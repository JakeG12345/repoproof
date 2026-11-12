import { NextRequest } from "next/server";
import { createPaymentsAdapter } from "@/src/lib/payments/adapter";
import { getCurrentUser } from "@/src/lib/auth/session";
import type { PricePlanKey } from "@/src/lib/config";

export async function GET(request: NextRequest) {
  const planKey = (request.nextUrl.searchParams.get("plan") ?? "singleReport") as PricePlanKey;
  const user = await getCurrentUser();
  const checkout = await createPaymentsAdapter().createCheckoutSession({
    organisationId: user.organisationId,
    userEmail: user.email,
    planKey,
  });
  return Response.redirect(checkout.checkoutUrl);
}
