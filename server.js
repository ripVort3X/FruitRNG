const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

// Middleware for parsing JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// API to fetch fruits data
app.get("/api/fruits", (req, res) => {
  const fruitsPath = path.join(__dirname, "public", "fruits.json");
  fs.readFile(fruitsPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error loading fruits data." });
    }
    res.json(JSON.parse(data));
  });
});

// API to save inventory to a temporary storage
let inventory = {};

app.post("/api/inventory", (req, res) => {
  const newInventory = req.body;
  if (newInventory && typeof newInventory === "object") {
    inventory = newInventory;
    return res.json({ message: "Inventory saved successfully." });
  }
  res.status(400).json({ message: "Invalid inventory data." });
});

// API to get saved inventory
app.get("/api/inventory", (req, res) => {
  res.json(inventory);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
