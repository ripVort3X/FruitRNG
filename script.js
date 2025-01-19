let fruits = [];
let inventory = {};
let isCooldown = false;
const cooldownTime = 2000;
const modal = document.getElementById("resetModal");
const resetButton = document.getElementById("reset-button");
const confirmResetButton = document.getElementById("confirm-reset");
const cancelResetButton = document.getElementById("cancel-reset");

// Fetch fruit data from the JSON file and check if it's already stored in localStorage
async function loadFruits() {
  // First, try to load fruits from localStorage
  const storedFruits = localStorage.getItem("fruits");
  if (storedFruits) {
    fruits = JSON.parse(storedFruits); // Load fruits from localStorage if available
  } else {
    // Fetch fruit data from the JSON file and store it in localStorage
    try {
      const response = await fetch("./fruits.json");
      fruits = await response.json();
      localStorage.setItem("fruits", JSON.stringify(fruits)); // Store fruits in localStorage for future use
    } catch (error) {
      console.error("Error loading fruits data:", error);
    }
  }
  loadInventory(); // After fruits are loaded, load the inventory
}

// Utility to select a random fruit based on its chance
function rollFruit() {
  const weightedFruits = fruits.flatMap((fruit) =>
    Array(Math.round(fruit.chance * 100)).fill(fruit)
  );
  return weightedFruits[Math.floor(Math.random() * weightedFruits.length)];
}

// Update the timer text with 3 decimal places
function updateTimerDisplay(remainingTime) {
  if (remainingTime > 0) {
    const timeInSeconds = (remainingTime / 1000).toFixed(3); // Convert to seconds with 3 decimals
    document.getElementById(
      "time-remaining"
    ).textContent = `${timeInSeconds}s left`;
  } else {
    document.getElementById("time-remaining").textContent = ``; // Empty the timer display
    document.getElementById("timer-text").textContent = `You can roll now`; // Show this message
  }
}

// Function to save the inventory to localStorage
function saveInventory() {
  localStorage.setItem("inventory", JSON.stringify(inventory)); // Save inventory in localStorage
}

// Function to load the inventory from localStorage
function loadInventory() {
  const storedInventory = localStorage.getItem("inventory");
  if (storedInventory) {
    inventory = JSON.parse(storedInventory); // Load inventory from localStorage if available
  } else {
    inventory = {}; // Initialize an empty inventory if no data found
  }
}

// Event listener for roll button
document.getElementById("roll-button").addEventListener("click", () => {
  if (!fruits.length) {
    alert("Fruit data is not yet loaded. Please try again later!");
    return;
  }

  // Check if cooldown is active
  if (isCooldown) {
    alert("Please wait before rolling again.");
    return;
  }

  const fruit = rollFruit();

  // Update inventory
  if (!inventory[fruit.name]) {
    inventory[fruit.name] = { ...fruit, count: 0 };
  }
  inventory[fruit.name].count++;

  // Save updated inventory to localStorage
  saveInventory();

  // Update roll result
  document.getElementById("fruit-image").src = fruit.img;
  document.getElementById("fruit-info").innerHTML = `
        <p>Name: ${fruit.name}</p>
        <p>Price: ${fruit.price}</p>
        <p>Rarity: ${fruit.rarity}</p>
    `;
  document.getElementById("roll-result").classList.remove("hidden");
  document.getElementById("inventory").classList.add("hidden");

  // Start cooldown timer
  isCooldown = true;
  let remainingTime = cooldownTime / 1000; // Time in seconds
  document.getElementById("timer-text").textContent = `Please wait...`; // Display wait message
  // Update timer every 50ms for smooth countdown
  const cooldownInterval = setInterval(() => {
    remainingTime -= 0.05; // Decrease the remaining time by 50 milliseconds

    updateTimerDisplay(remainingTime * 1000); // Update with the new time in ms

    if (remainingTime <= 0) {
      clearInterval(cooldownInterval);
      isCooldown = false;
      updateTimerDisplay(0); // When the timer finishes, display "You can roll now"
    }
  }, 50); // Update every 50ms for smoother experience
});

// Event listener for inventory button
document.getElementById("inventory-button").addEventListener("click", () => {
  const inventoryList = document.getElementById("inventory-list");
  inventoryList.innerHTML = "";

  // Sort inventory by price (high to low)
  const sortedInventory = Object.values(inventory).sort((a, b) => {
    const priceA = parseInt(a.price.replace(/\D/g, "")); // Remove any non-numeric characters to convert to integer
    const priceB = parseInt(b.price.replace(/\D/g, ""));
    return priceB - priceA; // Sort by price descending
  });

  // Populate inventory list
  sortedInventory.forEach((item) => {
    const inventoryItem = document.createElement("div");
    inventoryItem.classList.add("inventory-item");
    inventoryItem.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <span>Price: ${item.price}</span>
            <span>${item.name} - ${item.count}</span>
        `;
    inventoryList.appendChild(inventoryItem);
  });

  document.getElementById("inventory").classList.remove("hidden");
  document.getElementById("roll-result").classList.add("hidden");
});

// Event listener for Reset Inventory button
resetButton.addEventListener("click", () => {
  modal.style.display = "flex"; // Show the modal
});

// If "Yes" is clicked, reset inventory and hide the modal
confirmResetButton.addEventListener("click", () => {
  inventory = {}; // Clear the inventory
  alert("Your inventory has been reset.");
  document.getElementById("inventory-list").innerHTML = ""; // Clear the displayed inventory
  modal.style.display = "none"; // Close the modal
});

// If "No" is clicked, just close the modal
cancelResetButton.addEventListener("click", () => {
  modal.style.display = "none"; // Close the modal
});

// Close the modal if the user clicks outside of it (clicking the backdrop)
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Initialize the game
loadFruits(); // Load fruits first to ensure inventory works
