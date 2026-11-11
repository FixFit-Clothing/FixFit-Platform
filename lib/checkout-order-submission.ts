import { createClient } from "@/lib/supabase/client";
import type {
  BookingDraftCartItem,
  BookingDraftIssue,
  BookingOrderItem,
} from "@/lib/booking-draft";

type CatalogGarment = { id: string; name: string };
type CatalogIssue = {
  id: string;
  garment_type_id: string;
  name: string;
  category: string;
};
type CatalogOption = { id: string; issue_id: string; name: string };

export class CheckoutOrderSubmissionError extends Error {}

function catalogUnavailable() {
  return new CheckoutOrderSubmissionError(
    "We could not validate the current FixFit catalog. Please try again shortly."
  );
}

/**
 * The estimator draft intentionally stores display data. Resolve it to the
 * public catalog's current IDs immediately before the trusted API submission.
 */
export async function resolveOrderItems(
  cart: readonly BookingDraftCartItem[]
): Promise<BookingOrderItem[]> {
  if (cart.some((item) => item.garment === "Other garment")) {
    throw new CheckoutOrderSubmissionError(
      "Custom garments cannot be booked online yet. Edit your booking to choose a listed garment."
    );
  }
  if (
    cart.some((item) =>
      item.issues.some(
        (issue) => issue.category === "alteration" && issue.issue === "Other"
      )
    )
  ) {
    throw new CheckoutOrderSubmissionError(
      "Custom alteration requests are not available online yet. Choose one of the listed alteration options."
    );
  }

  const supabase = createClient();
  const garmentNames = [...new Set(cart.map((item) => item.garment))];
  const { data: garments, error: garmentsError } = await supabase
    .from("garment_types")
    .select("id, name")
    .eq("is_active", true)
    .in("name", garmentNames);

  if (garmentsError || !garments) throw catalogUnavailable();

  const garmentsByName = new Map(
    (garments as CatalogGarment[]).map((garment) => [garment.name, garment])
  );
  const unavailableGarment = cart.find(
    (item) => !garmentsByName.has(item.garment)
  );
  if (unavailableGarment) {
    throw new CheckoutOrderSubmissionError(
      `${unavailableGarment.garment} is no longer available. Edit your booking and try again.`
    );
  }

  const garmentIds = [
    ...new Set([...garmentsByName.values()].map((item) => item.id)),
  ];
  const { data: issues, error: issuesError } = await supabase
    .from("issues")
    .select("id, garment_type_id, name, category")
    .eq("is_active", true)
    .in("garment_type_id", garmentIds);

  if (issuesError || !issues) throw catalogUnavailable();

  const findIssue = (garmentId: string, item: BookingDraftIssue) =>
    (issues as CatalogIssue[]).find(
      (issue) =>
        issue.garment_type_id === garmentId &&
        issue.name === item.issue &&
        issue.category === item.category
    );

  const resolvedIssues = cart.flatMap((cartItem) => {
    const garment = garmentsByName.get(cartItem.garment);
    if (!garment) return [];

    return cartItem.issues.map((issue) => ({
      cartItem,
      issue,
      catalogIssue: findIssue(garment.id, issue),
    }));
  });
  const unavailableIssue = resolvedIssues.find((item) => !item.catalogIssue);
  if (unavailableIssue) {
    throw new CheckoutOrderSubmissionError(
      `${unavailableIssue.issue.issue} is no longer available for ${unavailableIssue.cartItem.garment}. Edit your booking and try again.`
    );
  }

  const issueIds = resolvedIssues.flatMap((item) =>
    item.catalogIssue ? [item.catalogIssue.id] : []
  );
  const { data: options, error: optionsError } = await supabase
    .from("issue_options")
    .select("id, issue_id, name")
    .eq("is_active", true)
    .in("issue_id", issueIds);

  if (optionsError || !options) throw catalogUnavailable();

  const findOption = (issueId: string, optionName: string) =>
    (options as CatalogOption[]).find(
      (option) => option.issue_id === issueId && option.name === optionName
    );

  return cart.map((cartItem) => {
    const garment = garmentsByName.get(cartItem.garment);
    if (!garment) throw catalogUnavailable();

    return {
      garmentTypeId: garment.id,
      serviceTierCode: cartItem.tier,
      rush: cartItem.rush,
      issues: cartItem.issues.map((issue) => {
        const catalogIssue = findIssue(garment.id, issue);
        if (!catalogIssue) throw catalogUnavailable();

        const optionIds = issue.options.map((optionName) => {
          const option = findOption(catalogIssue.id, optionName);
          if (!option) {
            throw new CheckoutOrderSubmissionError(
              `${optionName} is no longer available for ${issue.issue}. Edit your booking and try again.`
            );
          }
          return option.id;
        });

        return { issueId: catalogIssue.id, optionIds };
      }),
    };
  });
}
