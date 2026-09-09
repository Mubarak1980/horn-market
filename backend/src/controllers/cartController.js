const prisma = require('../config/db');

async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } }
    });
  }

  return cart;
}

async function getCart(req, res) {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
}

async function addItem(req, res) {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const cart = await getOrCreateCart(req.user.id);

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (quantity || 1) }
      });
    } else {
      item = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: quantity || 1
        }
      });
    }

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
}

async function updateItem(req, res) {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity required' });
    }

    const item = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity }
    });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item' });
  }
}

async function removeItem(req, res) {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
}

module.exports = { getCart, addItem, updateItem, removeItem };
