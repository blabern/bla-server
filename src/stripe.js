// @flow
const camelcaseKeys = require("camelcase-keys");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Subscription, User } = require("./models");

const { STRIPE_HOOKS_SECRET } = process.env;

type StripeSubscriptionType = {
  id: string,
  created: number,
  status: $PropertyType<Subscription, "status">,
  customer: string,
};

type MapStripeSubscriptionPropsType = (StripeSubscriptionType) => $Shape<Subscription>;

const mapStripeSubscriptionProps: MapStripeSubscriptionPropsType = (
  stripeSubscription
) => ({
  subscriptionId: stripeSubscription.id,
  createdAt: new Date(stripeSubscription.created * 1000),
  updatedAt: new Date(),
  status: stripeSubscription.status,
});

type OnSubscriptionCreatedOrUpdatedType = (StripeSubscriptionType) => Promise<?Subscription>;

// In case user created a subscription but "customer.subscription.created" wasn't called
// e.g. due to server restart.
// We can update subscription (check "Rest the billing cycle") from the UI and it will create it.
const onSubscriptionCreatedOrUpdated: OnSubscriptionCreatedOrUpdatedType = async (
  stripeSubscription
) => {
  const stripeCustomer = await stripe.customers.retrieve(
    stripeSubscription.customer
  );
  if (!stripeCustomer) {
    throw Error(`Unknown Stripe customer ${stripeSubscription.customer}`);
  }
  const update = {
    ...mapStripeSubscriptionProps(stripeSubscription),
    email: stripeCustomer.email,
  };

  const subscription = await Subscription.findOneAndUpdate(
    { subscriptionId: update.subscriptionId },
    update,
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      useFindAndModify: false,
    }
  );

  return subscription;
};

const handlers = {
  "customer.subscription.created": onSubscriptionCreatedOrUpdated,
  "customer.subscription.updated": onSubscriptionCreatedOrUpdated,
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
  const subscription = await Subscription.findOne({
    email: user.email,
    status: "active",
  })
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

type ReadPricesType = () => Promise<{|
  premium: {|
    priceId: string,
    formattedPrice: string,
  |},
|}>;

const readPrices: ReadPricesType = async () => {
  const productId =
    process.env.NODE_ENV === "production"
      ? "prod_Ibn916lxFKnyRQ"
      : "prod_Iah8WDGh0CMuFL";
  // TODO use other currencies/locales based on user (location?)
  const locale = "en-US";
  const currency = "usd";

  const prices = await stripe.prices.list({
    active: true,
    product: productId,
    currency,
  });

  // We should always have only one price for a given product and curency.
  const price = camelcaseKeys(prices.data[0]);
  const formattedPrice = (price.unitAmount / 100).toLocaleString(locale, {
    style: "currency",
    currency,
  });

  return {
    premium: {
      priceId: price.id,
      formattedPrice,
    },
  };
};

module.exports = { handleEvent, hasActiveSubscription, readPrices };
