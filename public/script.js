let fruits = [];
let inventory = {};
let isCooldown = false;
const cooldownTime = 0; // Cooldown time in milliseconds
const modal = document.getElementById("resetModal");
const resetButton = document.getElementById("reset-button");
const confirmResetButton = document.getElementById("confirm-reset");
const cancelResetButton = document.getElementById("cancel-reset");

// Fetch fruit data from JSON file or localStorage
async function loadFruits() {
  const storedFruits = localStorage.getItem("fruits");
  if (storedFruits) {
    fruits = JSON.parse(storedFruits);
  } else {
    try {
      const response = await fetch("./fruits.json");
      fruits = await response.json();
      localStorage.setItem("fruits", JSON.stringify(fruits));
    } catch (error) {
      console.error("Error loading fruits data:", error);
    }
  }
  loadInventory(); // Load inventory after fruits are ready
}

// Utility to select a random fruit based on its weighted chance
function rollFruit() {
  const weightedFruits = fruits.flatMap((fruit) =>
    Array(Math.round(fruit.chance * 100)).fill(fruit)
  );
  return weightedFruits[Math.floor(Math.random() * weightedFruits.length)];
}

// Update the cooldown timer display
function updateTimerDisplay(remainingTime) {
  const timeElement = document.getElementById("time-remaining");
  if (remainingTime > 0) {
    const timeInSeconds = (remainingTime / 1000).toFixed(3);
    timeElement.textContent = `${timeInSeconds}s left`;
  } else {
    timeElement.textContent = "";
    document.getElementById("timer-text").textContent = "You can roll now";
  }
}

// Save inventory to localStorage
function saveInventory() {
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

// Load inventory from localStorage
function loadInventory() {
  const storedInventory = localStorage.getItem("inventory");
  inventory = storedInventory ? JSON.parse(storedInventory) : {};
}

// Event listener for the Roll button
document.getElementById("roll-button").addEventListener("click", () => {
  if (!fruits.length) {
    alert("Fruit data is not loaded yet. Please try again later!");
    return;
  }

  if (isCooldown) {
    alert("Please wait for the cooldown to finish.");
    return;
  }

  const fruit = rollFruit();

  if (!inventory[fruit.name]) {
    inventory[fruit.name] = { ...fruit, count: 0 };
  }
  inventory[fruit.name].count++;
  saveInventory();

  // Update the Roll Result section
  document.getElementById("fruit-image").src = fruit.img;
  document.getElementById("fruit-info").innerHTML = `
    <p>Name: ${fruit.name}</p>
    <p>Price: ${fruit.price}</p>
    <p>Rarity: ${fruit.rarity}</p>
  `;
  document.getElementById("roll-result").classList.remove("hidden");
  document.getElementById("inventory").classList.add("hidden");

  // Start the cooldown
  isCooldown = true;
  let remainingTime = cooldownTime;

  document.getElementById("timer-text").textContent = "Please wait...";
  const cooldownInterval = setInterval(() => {
    remainingTime -= 50;
    updateTimerDisplay(remainingTime);

    if (remainingTime <= 0) {
      clearInterval(cooldownInterval);
      isCooldown = false;
      updateTimerDisplay(0);
    }
  }, 50);
});

// Event listener for the Inventory button
document.getElementById("inventory-button").addEventListener("click", () => {
  console.log("Current Inventory:", inventory); // Log inventory to verify data

  const inventoryList = document.getElementById("inventory-list");
  inventoryList.innerHTML = "";

  const sortedInventory = Object.values(inventory).sort((a, b) => {
    const priceA = parseInt(a.price.replace(/\D/g, ""));
    const priceB = parseInt(b.price.replace(/\D/g, ""));
    return priceB - priceA;
  });

  sortedInventory.forEach((item) => {
    const inventoryItem = document.createElement("div");
    inventoryItem.classList.add("inventory-item");

    inventoryItem.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <span>Price: ${item.price}</span>
      <span>${item.name}</span>
      <div class="fruit-count">${item.count}</div>  <!-- Fruit count here -->
    `;
    inventoryList.appendChild(inventoryItem);
  });

  document.getElementById("inventory").classList.remove("hidden");
  document.getElementById("roll-result").classList.add("hidden");
});

// Reset Inventory functionality
resetButton.addEventListener("click", () => {
  modal.style.display = "flex";
});

confirmResetButton.addEventListener("click", () => {
  inventory = {};
  saveInventory();
  alert("Your inventory has been reset.");
  document.getElementById("inventory-list").innerHTML = "";
  modal.style.display = "none";
});

cancelResetButton.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Initialize the app
loadFruits();
