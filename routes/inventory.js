const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Initialize inventory and fruits (store inventory in-memory for now)
let inventory = {};

// Load fruits from JSON file
const fruitsPath = path.join(__dirname, "../public/fruits.json");
const loadFruits = () => {
  try {
    return JSON.parse(fs.readFileSync(fruitsPath, "utf-8"));
  } catch (error) {
    console.error("Error loading fruits:", error);
    return [];
  }
};
const fruits = loadFruits();

// API Endpoints
// 1. Get all fruits
router.get("/fruits", (req, res) => {
  res.json(fruits);
});

// 2. Get current inventory
router.get("/", (req, res) => {
  res.json(inventory);
});

// 3. Add a fruit to inventory
router.post("/", (req, res) => {
  const { fruitName } = req.body;

  // Find the fruit in the list
  const fruit = fruits.find((f) => f.name === fruitName);
  if (!fruit) return res.status(404).json({ message: "Fruit not found" });

  // Add fruit to inventory
  if (!inventory[fruit.name]) {
    inventory[fruit.name] = { ...fruit, count: 0 };
  }
  inventory[fruit.name].count++;

  res.json(inventory);
});

// 4. Reset inventory
router.delete("/", (req, res) => {
  inventory = {}; // Clear inventory
  res.json({ message: "Inventory reset successfully" });
});

module.exports = router;
