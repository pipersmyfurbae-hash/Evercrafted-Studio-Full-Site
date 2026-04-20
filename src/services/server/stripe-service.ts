// EVERCRAFTED STRIPE SERVICE

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    stripeClient = new Stripe(key, {
      apiVersion: "2023-10-16" as any,
    });
  }
  return stripeClient;
}

export async function createCheckoutSession(item: {
  id: string;
  title: string;
  price: number;
  userId: string;
}) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
          },
          unit_amount: item.price * 100,
        },
        quantity: 1,
      },
    ],

    success_url: `${process.env.BASE_URL}/success?item=${item.id}`,
    cancel_url: `${process.env.BASE_URL}/cancel`,
    metadata: {
      blueprintId: item.id,
      userId: item.userId,
    },
  });

  return session.url;
}

export function constructWebhookEvent(
  payload: Buffer,
  signature: string | string[] | undefined
) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is required");
  }
  if (!signature || Array.isArray(signature)) {
    throw new Error("Invalid Stripe signature header");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
