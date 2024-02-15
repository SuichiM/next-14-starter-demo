'use server';
import {z} from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import prisma from './db';

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });


export async function createInvoice(formData: FormData) {

 const inputValues = Object.fromEntries(formData.entries());

 const { customerId, amount, status } = CreateInvoice.parse(inputValues);

 const amountInCents = amount * 100;
 const date = new Date().toISOString();

 const newInvoice = {
    customer_id: customerId,
    amount: amountInCents,
    status,
    date,
  };

  try {
    await prisma.invoices.create({
      data: newInvoice,
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create invoice.');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}


export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await prisma.invoices.update({
    where: { id },
    data: {
      customer_id: customerId,
      amount: amountInCents,
      status,
    },
  });
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}