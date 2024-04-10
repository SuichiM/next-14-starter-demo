import prisma from '@/app/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import { formatCurrency } from '@/app/lib/utils';

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
