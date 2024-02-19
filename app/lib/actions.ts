'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import prisma from './db';

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({
    required_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
  prevState?: {
    customerId?: string;
    amount?: string;
    status?: string;
  };
};

export async function createInvoice(prevState: State, formData: FormData) {
  const inputValues = Object.fromEntries(formData.entries());

  const validatedFields = CreateInvoice.safeParse(inputValues);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
      prevState: inputValues,
    };
  }

  const { customerId, amount, status } = validatedFields.data;

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

  try {
    await prisma.invoices.update({
      where: { id },
      data: {
        customer_id: customerId,
        amount: amountInCents,
        status,
      },
    });
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');
  try {
    await prisma.invoices.delete({ where: { id } });
    revalidatePath('/dashboard/invoices');
    return { message: 'Invoice deleted successfully.' };
  } catch (e) {
    console.error('Database Error:', e);
    return { message: 'Database Error: Failed to delete invoice.' };
  }
}
