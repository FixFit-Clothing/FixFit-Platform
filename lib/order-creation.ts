import "server-only";

import { z } from "zod";

const uuid = z.uuid();

const optionSelectionSchema = z
  .object({
    issueId: uuid,
    optionIds: z.array(uuid).max(12),
  })
  .strict()
  .refine(
    (value) => new Set(value.optionIds).size === value.optionIds.length,
    "An issue option may be selected only once."
  );

const orderItemSchema = z
  .object({
    garmentTypeId: uuid,
    serviceTierCode: z.string().trim().min(1).max(32),
    rush: z.boolean(),
    issues: z.array(optionSelectionSchema).min(1).max(12),
  })
  .strict()
  .refine(
    (value) =>
      new Set(value.issues.map((issue) => issue.issueId)).size ===
      value.issues.length,
    "An issue may be selected only once per garment."
  );

export const createOrderRequestSchema = z
  .object({
    idempotencyKey: uuid,
    addressId: uuid,
    paymentMethod: z.literal("upi"),
    items: z.array(orderItemSchema).min(1).max(25),
  })
  .strict();

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export type CreatedOrder = {
  id: string;
  reference: string;
  status: "pending";
  createdAt: string;
  estimatedWorkAmount: number;
  bookingFeeAmount: number;
  rushFeeAmount: number;
  finalPayableAmount: number | null;
};

export function toRpcItems(items: CreateOrderRequest["items"]) {
  return items.map((item) => ({
    garment_type_id: item.garmentTypeId,
    service_tier_code: item.serviceTierCode,
    rush: item.rush,
    issues: item.issues.map((issue) => ({
      issue_id: issue.issueId,
      option_ids: issue.optionIds,
    })),
  }));
}
