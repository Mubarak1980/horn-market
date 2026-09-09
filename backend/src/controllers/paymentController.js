const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = require('../config/db');

async function createPaymentIntent(req, res) {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Not your order' });
    }

    const amountInCents = Math.round(Number(order.total) * 100);

    const intent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { orderId: order.id }
    });

    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        provider: 'stripe',
        providerPaymentId: intent.id,
        amount: order.total,
        status: 'pending'
      },
      create: {
        orderId: order.id,
        provider: 'stripe',
        providerPaymentId: intent.id,
        amount: order.total,
        status: 'pending'
      }
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}

async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const orderId = intent.metadata.orderId;

    await prisma.payment.update({
      where: { orderId },
      data: { status: 'succeeded' }
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid' }
    });
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    const orderId = intent.metadata.orderId;

    await prisma.payment.update({
      where: { orderId },
      data: { status: 'failed' }
    });
  }

  res.json({ received: true });
}

module.exports = { createPaymentIntent, handleWebhook };
