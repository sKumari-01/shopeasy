const express = require("express");
const router = express.Router();
const db = require("../db");

function buildCartResponse() {
  const items = db.cart.map((cartItem) => {
    const product = db.products.find((p) => p.id === cartItem.productId);
    return {
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      product,
    };
  });
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { items, total, itemCount };
}

router.get("/", (req, res) => {
  res.json(buildCartResponse());
});

router.post("/add", (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const existing = db.cart.find((c) => c.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    db.cart.push({ productId, quantity });
  }
  res.json(buildCartResponse());
});

router.post("/update", (req, res) => {
  const { productId, quantity } = req.body;
  const index = db.cart.findIndex((c) => c.productId === productId);
  if (index === -1) return res.status(404).json({ error: "Item not in cart" });

  if (quantity <= 0) {
    db.cart.splice(index, 1);
  } else {
    db.cart[index].quantity = quantity;
  }
  res.json(buildCartResponse());
});

router.post("/remove", (req, res) => {
  const { productId } = req.body;
  db.cart = db.cart.filter((c) => c.productId !== productId);
  res.json(buildCartResponse());
});

router.post("/clear", (req, res) => {
  db.cart = [];
  res.json(buildCartResponse());
});

module.exports = router;