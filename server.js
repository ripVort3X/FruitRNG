const express = require("express");
const path = require("path");

// Initialize the app
const app = express();
const port = process.env.PORT || 8080;

// Serve static files (like HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
