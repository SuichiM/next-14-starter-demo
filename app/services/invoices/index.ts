import prisma from '@/app/lib/db';
import { formatCurrency } from '@/app/lib/utils';
import type {
  LatestInvoiceRaw,
  LatestInvoice,
  InvoicesTable,
  InvoiceForm,
} from '@/app/lib/definitions';

import { unstable_noStore as noStore } from 'next/cache';

import { notFound } from 'next/navigation';
import { Prisma } from '@prisma/client';

export async function fetchLatestInvoices() {
  try {
    noStore();

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

type paramsType = {
  page?: number;
  size?: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 5;
export async function fetchLatest(
  params?: paramsType,
): Promise<LatestInvoice[]> {
  noStore();

  const { page = DEFAULT_PAGE, size = DEFAULT_PAGE_SIZE } = params || {};
  const skip = page * size - size;

  try {
    const invoices = await prisma.invoices.findMany({
      take: size,
      skip,
      orderBy: {
        date: 'desc',
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            image_url: true,
          },
        },
      },
    });

    return invoices.map(({ id, amount, status, customer }) => ({
      id,
      amount: formatCurrency(amount),
      status,
      name: customer.name,
      email: customer.email,
      image_url: customer.image_url,
    }));
  } catch (e) {
    console.log(e);
    throw new Error('Failed to fetch the latest invoices.');
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

export async function fetchInvoiceById(invoiceId: string) {
  noStore();

  try {
    // validate invoiceID is a valid UUID

    const { id, customer_id, amount, status } =
      await prisma.invoices.findFirstOrThrow({ where: { id: invoiceId } });

    return {
      id,
      customer_id,
      amount: amount / 100,
      status,
    } as InvoiceForm;
  } catch (error) {
    // check if the error if of type PrismaClientKnownRequestError
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Database Error:', error.message);
      if (error.code === 'P2025') return notFound();
    }

    throw new Error('Failed to fetch invoice.');
  }
}
