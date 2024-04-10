import prisma from '@/app/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenue() {
  noStore();

  const data = await prisma.revenue.findMany();

  return data;
}
