import prisma from '@/app/lib/db';
import { CustomerField } from '@/app/lib/definitions';

import { unstable_noStore as noStore } from 'next/cache';

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
