import "server-only";
import Stripe from "stripe";
import { appConfig, type PricePlanKey } from "@/src/lib/config";
import { serverConfig } from "@/src/lib/server-config";

export type CheckoutRequest = {
  organisationId: string;
  userEmail: string;
  planKey: PricePlanKey;
  successPath?: string;
  cancelPath?: string;
};

export type CheckoutResult = {
  provider: "stripe" | "fake";
  checkoutUrl: string;
  sessionId: string;
};

export type PaymentEventResult = {
  eventId: string;
  eventType: string;
  creditsAllocated: number;
  status: "processed" | "ignored";
};

export type PaymentsAdapter = {
  createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResult>;
  handleWebhook(rawBody: string, signature?: string | null): Promise<PaymentEventResult>;
};

export class FakePaymentsAdapter implements PaymentsAdapter {
  async createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResult> {
    const plan = appConfig.pricing[request.planKey];
    return {
      provider: "fake",
      checkoutUrl: `${serverConfig.appUrl}${request.successPath ?? "/settings/billing"}?checkout=mock&plan=${plan.key}`,
      sessionId: `fake_checkout_${plan.key}`,
    };
  }

  async handleWebhook(rawBody: string): Promise<PaymentEventResult> {
    const parsed = rawBody ? JSON.parse(rawBody) : {};
    const planKey = (parsed.planKey ?? "singleReport") as PricePlanKey;
    return {
      eventId: parsed.id ?? `fake_event_${planKey}`,
      eventType: parsed.type ?? "checkout.session.completed",
      creditsAllocated: appConfig.pricing[planKey]?.reportCredits ?? 1,
      status: "processed",
    };
  }
}

export class StripePaymentsAdapter implements PaymentsAdapter {
  private readonly stripe: Stripe;

  constructor(secretKey = serverConfig.stripe.secretKey) {
    if (!secretKey) throw new Error("STRIPE_SECRET_KEY is required outside fake checkout mode.");
    this.stripe = new Stripe(secretKey);
  }

  async createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResult> {
    const plan = appConfig.pricing[request.planKey];
    const price = process.env[plan.stripePriceEnv];
    if (!price) throw new Error(`${plan.stripePriceEnv} is not configured.`);

    const session = await this.stripe.checkout.sessions.create({
      mode: plan.cadence === "monthly" ? "subscription" : "payment",
      customer_email: request.userEmail,
      line_items: [{ price, quantity: 1 }],
      success_url: `${serverConfig.appUrl}${request.successPath ?? "/settings/billing"}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${serverConfig.appUrl}${request.cancelPath ?? "/pricing"}?checkout=cancelled`,
      metadata: {
        organisationId: request.organisationId,
        planKey: request.planKey,
        credits: String(plan.reportCredits),
        humanReviewed: String(plan.humanReviewed),
      },
    });

    return {
      provider: "stripe",
      checkoutUrl: session.url ?? `${serverConfig.appUrl}/settings/billing`,
      sessionId: session.id,
    };
  }

  async handleWebhook(rawBody: string, signature?: string | null): Promise<PaymentEventResult> {
    if (!serverConfig.stripe.webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    if (!signature) throw new Error("Missing Stripe signature header.");

    const event = this.stripe.webhooks.constructEvent(rawBody, signature, serverConfig.stripe.webhookSecret);
    if (event.type !== "checkout.session.completed") {
      return { eventId: event.id, eventType: event.type, creditsAllocated: 0, status: "ignored" };
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const planKey = (session.metadata?.planKey ?? "singleReport") as PricePlanKey;
    return {
      eventId: event.id,
      eventType: event.type,
      creditsAllocated: appConfig.pricing[planKey]?.reportCredits ?? 1,
      status: "processed",
    };
  }
}

export function createPaymentsAdapter(): PaymentsAdapter {
  if (serverConfig.mode === "production" && serverConfig.stripe.secretKey) {
    return new StripePaymentsAdapter();
  }
  return new FakePaymentsAdapter();
}
