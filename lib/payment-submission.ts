import "server-only";

import { z } from "zod";

const paymentReference = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .transform((value) => value.replace(/[\s-]+/g, "").toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9]{6,64}$/));

export const submitUpiPaymentSchema = z
  .object({
    paymentReference,
  })
  .strict();

export type SubmittedUpiPayment = {
  orderId: string;
  orderReference: string;
  paymentStatus: "submitted";
  paymentSubmittedAt: string;
};
