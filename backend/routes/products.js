const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const { category, search } = req.query;
  let products = [...db.products];

  if (category) {
    products = products.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  res.json(products);
});

router.get("/category-summary", (req, res) => {
  const categories = ["clothes", "shoes", "electronics", "books"];
  const summary = categories.map((cat) => {
    const items = db.products.filter((p) => p.category === cat);
    return {
      category: cat,
      count: items.length,
      minPrice: items.length ? Math.min(...items.map((p) => p.price)) : 0,
      maxPrice: items.length ? Math.max(...items.map((p) => p.price)) : 0,
    };
  });
  res.json(summary);
});

router.get("/:id", (req, res) => {
  const product = db.products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

module.exports = router;