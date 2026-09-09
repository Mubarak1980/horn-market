const prisma = require('../config/db');

async function createOrder(req, res) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        buyerId: req.user.id,
        total,
        status: 'pending',
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            sellerId: item.product.sellerId,
            quantity: item.quantity,
            priceAtPurchase: item.product.price
          }))
        }
      },
      include: { items: true }
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user.id },
      include: { items: true, payment: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function getOrder(req, res) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, payment: true }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Not your order' });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

async function getSellerOrders(req, res) {
  try {
    const items = await prisma.orderItem.findMany({
      where: { sellerId: req.user.id },
      include: { order: true, product: true }
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch seller orders' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const valid = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getSellerOrders,
  updateOrderStatus
};
