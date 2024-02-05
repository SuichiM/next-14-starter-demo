import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchRevenue() {
  const data = await prisma.revenue.findMany();
  console.log(data);
  return data;
}
