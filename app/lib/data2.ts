import prisma from '@/app/lib/db';
import { formatCurrency } from './utils';
import { CustomerField, InvoiceForm, InvoicesTable, LatestInvoiceRaw } from './definitions';

import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenue() {
  noStore();

 //  console.log('Fetching revenue data...');
  // await new Promise((resolve) => setTimeout(resolve, 6000));

  const data = await prisma.revenue.findMany();

  // console.log('Data fetch completed after 3 seconds.');

  return data;
}

export async function fetchLatestInvoices() {
  try {
    noStore();
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await prisma.$queryRaw<
      LatestInvoiceRaw[]
    >`SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    noStore();

    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = prisma.$queryRaw<
      { count: BigInt }[]
    >`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = prisma.$queryRaw<
      { count: BigInt }[]
    >`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = prisma.$queryRaw<
      { paid: BigInt; pending: BigInt }[]
    >`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const [invoiceCount, customerCount, invoicesCount] = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(invoiceCount[0].count ?? '0');
    const numberOfCustomers = Number(customerCount[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(
      Number(invoicesCount[0].paid) ?? '0',
    );
    const totalPendingInvoices = formatCurrency(
      Number(invoicesCount[0].pending) ?? '0',
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  noStore();

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.$queryRaw<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  noStore();

  try {
    const count = await prisma.$queryRaw<{ count: BigInt }[]>`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}


export async function fetchCustomers() {
  noStore();
  try {
    const data = await prisma.$queryRaw<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchInvoiceById(invoiceId: string) {
  noStore();
  
  try {
    const {id, customer_id, amount, status } = await prisma.invoices.findFirstOrThrow({where:{id:invoiceId}});

    return {
      id,
      customer_id,
      amount: amount / 100,
      status
    } as InvoiceForm;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}