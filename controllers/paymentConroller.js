const asyncHandler = require("express-async-handler");
const Worker = require("../model/workerModel");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY);

const subscribe = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Please enter a name" });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(25 * 100),
      currency: "USD",
      payment_method_types: ["card"],
      metadata: { name },
    });
    const clientSecret = paymentIntent.client_secret;
    res.json({ message: "Payment initiated", clientSecret });
    console.log({ message: "Payment initiated", clientSecret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

const createProduct = asyncHandler(async (req, res) => {
  try {
    const product = await stripe.products.create({
      name: "Monthly Subscription",
      type: "service",
    });
    res.json({ product });
  } catch (err) {
    res.status(500).json({
      message: "server errors",
      err,
    });
  }
});

const createPlan = asyncHandler(async (req, res) => {
  try {
    const plan = await stripe.plans.create({
      nickname: "Monthly Subscription",
      product: "prod_NGl6k4vIXMdaEQ", // Replace with your Stripe product ID
      currency: "usd",
      interval: "month",
      amount: 1000, // 10.00 USD
    });
    res.json({ plan });
  } catch (err) {
    res.status(500).end();
  }
});

const fetchPlan = asyncHandler(async (req, res) => {
  const plan = await stripe.plans.retrieve("plan_NGlAOOprTiSgEJ");
  res.json({ plan });
});

const createPrice = asyncHandler(async (req, res) => {
  try {
    const productId = "prod_NGl6k4vIXMdaEQ";
    const unitAmount = 1000;
    const currency = "USD";

    const price = await stripe.prices.create({
      product: productId,
      unit_amount: unitAmount,
      currency: currency,
      recurring: {
        interval: "month",
      },
    });

    res.status(200).json({ price });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const retrieveCustomer = asyncHandler(async (req, res) => {
  try {
    const customer = await stripe.customers.retrieve("cus_NHEYWD1bHyK1g8");
    console.log(customer);
    res.json({ customer });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const paymentUpdate = asyncHandler(async (req, res) => {
  try {
    const upd = await stripe.paymentMethods.attach("pm_card_visa", {
      customer: "cus_NGThWXaQU8FDJs",
    });
    // const upd = await stripe.customers.update("cus_NGThWXaQU8FDJs", {
    //   invoice_settings: { default_payment_method: "pm_card_visa" },
    // });

    res.json({ upd });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// const requireActiveSubscription = async (req, res, next) => {
//   const customer = await stripe.customers.retrieve(req.user.stripeCustomerId);

//   if (!customer.subscriptions.data.length) {
//     return res.status(401).send({ error: 'You need an active })
//   }

module.exports = {
  subscribe,
  createProduct,
  createPlan,
  fetchPlan,
  createPrice,
  retrieveCustomer,
  paymentUpdate,
};
