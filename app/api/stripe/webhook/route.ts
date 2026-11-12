import { createPaymentsAdapter } from "@/src/lib/payments/adapter";
import { recordDeliveryOnce, sha256Hex } from "@/src/lib/webhooks";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const deliveryId = signature ?? sha256Hex(rawBody);

  if (!recordDeliveryOnce("stripe", deliveryId)) {
    return Response.json({ status: "duplicate_ignored" });
  }

  try {
    const result = await createPaymentsAdapter().handleWebhook(rawBody, signature);
    return Response.json({ ...result, bodyHash: sha256Hex(rawBody) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Stripe webhook failed." }, { status: 400 });
  }
}
