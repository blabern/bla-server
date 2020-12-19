// @flow
const camelcaseKeys = require("camelcase-keys");
const fetch = require("node-fetch");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Subscription, User } = require("./models");

const { STRIPE_HOOKS_SECRET } = process.env;

const mapStripeSubscriptionProps = (stripeSubscription) => ({
  subscriptionId: stripeSubscription.id,
  createdAt: new Date(stripeSubscription.created * 1000),
  updatedAt: new Date(),
  status: stripeSubscription.status,
});

const onSubscriptionCreated = async (stripeSubscription) => {
  const stripeCustomer = await stripe.customers.retrieve(
    stripeSubscription.customer
  );
  if (!stripeCustomer) {
    throw Error(`Unknown Stripe customer ${stripeSubscription.customer}`);
  }

  const subscription = new Subscription({
    ...mapStripeSubscriptionProps(stripeSubscription),
    email: stripeCustomer.email,
  });
  await subscription.save();
  return subscription;
};

const handlers = {
  "customer.subscription.created": onSubscriptionCreated,
};

type HandleEventType = (Buffer, string) => Promise<Subscription | void>;

const handleEvent: HandleEventType = async (eventPayload, signature) => {
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
  const user = await User.findOne({ _id: userId }).exec();
  if (!user) return false;

  // Gets the latest subscription.
  const subscription = await Subscription.findOne({ email: user.email })
    .sort({ createdAt: -1 })
    .exec();
  if (!subscription) return false;

  // We want to update the subscription status once per day only to avoid
  // having to send requests to stripe every time user loads the app.
  const needsUpdate = subscription.updatedAt.getDate() !== new Date().getDate();

  if (needsUpdate) {
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.subscriptionId
    );

    // If stripe doesn't have this subscription, we don't need to have it either.
    if (!stripeSubscription) {
      await Subscription.deleteOne({ _id: subscription._id });
      return false;
    }

    // Update our subscription with data from stripe.
    Object.assign(subscription, mapStripeSubscriptionProps(stripeSubscription));
    await subscription.save();
  }

  return subscription.status === "active";
};

module.exports = { handleEvent, hasActiveSubscription };
