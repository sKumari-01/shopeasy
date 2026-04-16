const express = require("express");
const cors = require("cors");
const path = require("path");
const productsRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const { seedDatabase } = require("./seed");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/products", productsRouter);
app.use("/cart", cartRouter);

app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

seedDatabase();

app.listen(PORT, () => {
  console.log(`ShopEase running at http://localhost:${PORT}`);
});