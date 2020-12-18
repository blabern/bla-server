// @flow
const camelcaseKeys = require("camelcase-keys");
const fetch = require("node-fetch");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Purchase } = require("./models");
const { STRIPE_HOOKS_SECRET } = process.env;

type StripeInvoceType = {|
  customerEmail: string,
  customer: string,
  id: string,
  paymentIntent: string,
  subscription: string,
  billingReason: string,
  created: number,
  periodStart: number,
  periodEnd: number,
  status: string,
|};
type OnInvoicePaidType = (StripeInvoceType) => Promise<Purchase>;

const onInvoicePaid: OnInvoicePaidType = async (invoice) => {
  const purchase = new Purchase({
    email: invoice.customerEmail,
    customerId: invoice.customer,
    invoiceId: invoice.id,
    paymentIntentId: invoice.paymentIntent,
    subscriptionId: invoice.subscription,
    reason: invoice.billingReason,
    paidAt: new Date(invoice.created * 1000),
    periodStart: new Date(invoice.periodStart * 1000),
    periodEnd: new Date(invoice.periodEnd * 1000),
    status: invoice.status,
  });
  return await purchase.save();
};

const handlers = {
  "invoice.paid": onInvoicePaid,
};

type HandleType = (Buffer, string) => Promise<Purchase | void>;

const handle: HandleType = async (eventPayload, signature) => {
  const event = stripe.webhooks.constructEvent(
    eventPayload,
    signature,
    STRIPE_HOOKS_SECRET
  );

  const handler = handlers[event.type];

  if (!handler) return;

  return await handler(camelcaseKeys(event.data.object, { deep: true }));
};

module.exports = { handle };
