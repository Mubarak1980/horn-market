const axios = require('axios');
const prisma = require('../config/db');

const CHAPA_BASE = 'https://api.chapa.co/v1';
const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY;

async function initializePayment(req, res) {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Not your order' });
    }

    const tx_ref = 'horn-' + order.id;

    const response = await axios.post(
      `${CHAPA_BASE}/transaction/initialize`,
      {
        amount: order.total.toString(),
        currency: 'ETB',
        email: order.buyer.email,
        first_name: order.buyer.name || 'Customer',
        tx_ref,
        callback_url: `${process.env.PUBLIC_API_URL}/api/payments/chapa/verify/${tx_ref}`,
        return_url: 'https://mubarak1980.github.io/horn-market/'
      },
      { headers: { Authorization: `Bearer ${CHAPA_SECRET}` } }
    );

    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: { provider: 'chapa', providerPaymentId: tx_ref, amount: order.total, status: 'pending' },
      create: { orderId: order.id, provider: 'chapa', providerPaymentId: tx_ref, amount: order.total, status: 'pending' }
    });

    res.json({ checkoutUrl: response.data.data.checkout_url });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
}

async function verifyPayment(req, res) {
  try {
    const { tx_ref } = req.params;

    const response = await axios.get(
      `${CHAPA_BASE}/transaction/verify/${tx_ref}`,
      { headers: { Authorization: `Bearer ${CHAPA_SECRET}` } }
    );

    const status = response.data.data.status === 'success' ? 'succeeded' : 'failed';

    const payment = await prisma.payment.update({
      where: { providerPaymentId: tx_ref },
      data: { status }
    });

    if (status === 'succeeded') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'paid' }
      });
    }

    res.json({ status });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Verification failed' });
  }
}

module.exports = { initializePayment, verifyPayment };
