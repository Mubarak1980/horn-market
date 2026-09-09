const prisma = require('../config/db');

async function getProducts(req, res) {
  try {
    const { search, category, sort } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category && category !== 'all') {
      where.category = category;
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { price: 'asc' };
    if (sort === 'price-high') orderBy = { price: 'desc' };

    const products = await prisma.product.findMany({ where, orderBy });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

async function getProduct(req, res) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

async function createProduct(req, res) {
  try {
    const { name, description, price, category, imageUrl, stockQty } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price,
        category: category || 'Other',
        imageUrl: imageUrl || null,
        stockQty: stockQty || 0,
        sellerId: req.user.id
      }
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Not your product' });
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Not your product' });
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
