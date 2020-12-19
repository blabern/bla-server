// @flow
const camelcaseKeys = require("camelcase-keys");
const fetch = require("node-fetch");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Purchase, User } = require("./models");

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
type OnInvoicePaidType = (StripeInvoceType) => Promise<Purchase | void>;

const retrieveSubscriptions = async (subscriptionId) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (subscription) return camelcaseKeys(subscription);
};

const onInvoicePaid: OnInvoicePaidType = async (invoice) => {
  const subscription = await retrieveSubscriptions(invoice.subscription);
  if (!subscription) return;
  const purchase = new Purchase({
    email: invoice.customerEmail,
    customerId: invoice.customer,
    invoiceId: invoice.id,
    paymentIntentId: invoice.paymentIntent,
    subscriptionId: invoice.subscription,
    reason: invoice.billingReason,
    paidAt: new Date(invoice.created * 1000),
    periodStart: new Date(subscription.currentPeriodStart * 1000),
    periodEnd: new Date(subscription.currentPeriodEnd * 1000),
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

type HasActiveSubscriptionType = (bson$ObjectId) => Promise<boolean>;

const hasActiveSubscription: HasActiveSubscriptionType = async (userId) => {
  const user = await User.findById(userId).exec();
  if (!user) return false;
  const purchases = await Purchase.find({ email: user.email }).exec();
  const now = new Date();
  return purchases.some((purchase) => {
    return (
      purchase.status === "paid" &&
      purchase.periodStart < now &&
      purchase.periodEnd > now
    );
  });
};

module.exports = { handle, hasActiveSubscription };
