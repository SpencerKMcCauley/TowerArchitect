let clickCount = 0;
let heightMultiplier = 1;
let clicksToIncrease = 1;
let weatherTimer = null;
let weatherEffect = null;
let bestHeight = parseInt(localStorage.getItem("bestHeight")) || 0;
let currentColor = 'blue';
let enhancedWheel = false;
let favorableSpinChance = 0.25; // Initial favorable chance for spinning the wheel
let riskButtonUsed = false; // To track if the risk button has been used
let investmentClicks = { short: 0, medium: 0, long: 0 };
let investmentActive = { short: false, medium: false, long: false };
let investmentReturns = { short: 0, medium: 0, long: 0 };

const towerContainer = document.getElementById("towerContainer");
const buildButton = document.getElementById("buildButton");
const spinWheel = document.getElementById("spinWheel");
const saveButton = document.getElementById("saveGame");
const deleteSave = document.getElementById("deleteSave");
const riskButton = document.getElementById("riskButton");
const currentHeightDisplay = document.getElementById("currentHeight");
const bestHeightDisplay = document.getElementById("bestHeight");
const shortInvestButton = document.getElementById("shortInvestButton");
const mediumInvestButton = document.getElementById("mediumInvestButton");
const longInvestButton = document.getElementById("longInvestButton");
const autoSaveInterval = 500; // 0.5 seconds in milliseconds

setInterval(autoSaveGame, autoSaveInterval);

bestHeightDisplay.textContent = bestHeight;

function autoSaveGame() {
    // Basic game stats
    localStorage.setItem("towerHeight", towerContainer.childElementCount.toString());
    localStorage.setItem("currentColor", currentColor);
    localStorage.setItem("clickCount", clickCount.toString());
    localStorage.setItem("clicksToIncrease", clicksToIncrease.toString());
    localStorage.setItem("bestHeight", bestHeight.toString());
    localStorage.setItem("enhancedWheel", enhancedWheel.toString());
    localStorage.setItem("favorableSpinChance", favorableSpinChance.toString());
    localStorage.setItem("riskButtonUsed", riskButtonUsed.toString());

    // Investment-related stats
    localStorage.setItem("investmentClicks", JSON.stringify(investmentClicks));
    localStorage.setItem("investmentActive", JSON.stringify(investmentActive));
    localStorage.setItem("investmentReturns", JSON.stringify(investmentReturns));

    // Weather effect
    localStorage.setItem("weatherEffect", weatherEffect || "");

    // Child Limestone Mine feature
    localStorage.setItem("childLimestoneMineActive", childLimestoneMineActive.toString());
    localStorage.setItem("childWorkers", childWorkers.toString());

    console.log("Game auto-saved"); // Optional: for debugging purposes
}

function loadGame() {
    // Load basic game stats and apply them
    const savedTowerHeight = parseInt(localStorage.getItem("towerHeight")) || 0;
    const savedCurrentColor = localStorage.getItem("currentColor") || 'blue';
    const savedClickCount = parseInt(localStorage.getItem("clickCount")) || 0;
    const savedClicksToIncrease = parseInt(localStorage.getItem("clicksToIncrease")) || 1;
    const savedBestHeight = parseInt(localStorage.getItem("bestHeight")) || 0;
    const savedEnhancedWheel = localStorage.getItem("enhancedWheel") === 'true';
    const savedFavorableSpinChance = parseFloat(localStorage.getItem("favorableSpinChance")) || 0.25;
    const savedRiskButtonUsed = localStorage.getItem("riskButtonUsed") === 'true';

    // Apply basic stats
    // Assuming your game logic functions to update the tower height and other elements are in place
    adjustTowerHeight(savedTowerHeight); // This function should update the visual tower height
    currentColor = savedCurrentColor;
    clickCount = savedClickCount;
    clicksToIncrease = savedClicksToIncrease;
    bestHeight = savedBestHeight;
    enhancedWheel = savedEnhancedWheel;
    favorableSpinChance = savedFavorableSpinChance;
    riskButtonUsed = savedRiskButtonUsed;

    // Load and apply investment-related stats
    investmentClicks = JSON.parse(localStorage.getItem("investmentClicks")) || { short: 0, medium: 0, long: 0 };
    investmentActive = JSON.parse(localStorage.getItem("investmentActive")) || { short: false, medium: false, long: false };
    investmentReturns = JSON.parse(localStorage.getItem("investmentReturns")) || { short: 0, medium: 0, long: 0 };

    // Load and apply weather effect
    weatherEffect = localStorage.getItem("weatherEffect") || null;
    // Additional logic might be needed here to reapply the weather effect in the game

    // Load and apply Child Limestone Mine feature stats
    childLimestoneMineActive = localStorage.getItem("childLimestoneMineActive") === 'true';
    childWorkers = parseInt(localStorage.getItem("childWorkers")) || 0;
    // Additional UI updates or logic might be needed here to reflect the state of the Child Limestone Mine in the game
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Load the saved game state
    loadGame();
});

function handleInvestment(investmentType) {
    const currentHeight = towerContainer.childElementCount;
    const colorMultiplier = getColorMultiplier(currentColor);

    if (!investmentActive[investmentType]) {
        let heightDeductionPercentage;
        let heightToInvest;

        // If the tower height is at least 1,000, allow the player to choose the investment percentage
        if (currentHeight >= 1000) {
            const investmentPercentage = parseFloat(prompt("Enter the percentage of the tower to invest:"));
            if (isNaN(investmentPercentage) || investmentPercentage <= 0 || investmentPercentage > 100) {
                alert("Invalid investment percentage. Please enter a value between 0 and 100.");
                return;
            }
            heightToInvest = (currentHeight * investmentPercentage) / 100;
        } else {
            // Default investment percentages for tower height below 1,000
            switch (investmentType) {
                case "short":
                    heightDeductionPercentage = 0.20; // 20% for short investment
                    break;
                case "medium":
                    heightDeductionPercentage = 0.30; // 30% for medium investment
                    break;
                case "long":
                    heightDeductionPercentage = 0.40; // 40% for long investment
                    break;
            }
            heightToInvest = currentHeight * heightDeductionPercentage;
        }

        // Apply trader's fee (3% of the current height) and set investment returns
        const traderFee = currentHeight * 0.03;
        investmentActive[investmentType] = true;
        investmentClicks[investmentType] = determineInvestmentDuration(investmentType);
        investmentReturns[investmentType] = calculateInvestmentReturn(heightToInvest, colorMultiplier, investmentType);

        // Deduct the invested height and trader's fee from the tower
        const newHeight = Math.max(currentHeight - heightToInvest - traderFee, 1);
        adjustTowerHeight(newHeight);

        alert(`${investmentType.charAt(0).toUpperCase() + investmentType.slice(1)}-term investment started.`);
    } else {
        alert("Investment type is already active.");
    }
}

function determineInvestmentDuration(investmentType) {
    switch (investmentType) {
        case "short":
            return 5;
        case "medium":
            return 10;
        case "long":
            return 15;
        default:
            return 0;
    }
}


function calculateInvestmentReturn(investedHeight, colorMultiplier, investmentType) {
    const baseReturn = investedHeight * colorMultiplier;
    let riskMultiplier, randomFactor;

    switch (investmentType) {
        case "short":
            riskMultiplier = 1.5;
            randomFactor = Math.random() * 2 - 1; // Range: -1 to 1
            break;
        case "medium":
            riskMultiplier = 1.3;
            randomFactor = Math.random() * 1.5 - 0.5; // Range: -0.5 to 1
            break;
        case "long":
            riskMultiplier = 1.1;
            randomFactor = Math.random() * 1.2 - 0.2; // Range: -0.2 to 1
            break;
        default:
            riskMultiplier = 1;
            randomFactor = 0;
            break;
    }

    // Calculate the profit or loss
    const profitOrLoss = baseReturn * riskMultiplier * randomFactor;

    // Total return is the initial investment plus profit or loss
    // Ensuring that the return doesn't exceed the invested height negatively
    return Math.max(investedHeight + profitOrLoss, 0);
}

function processInvestments() {
    Object.keys(investmentClicks).forEach(type => {
        if (investmentActive[type]) {
            investmentClicks[type]--;
            if (investmentClicks[type] <= 0) {
                concludeInvestment(type);
                investmentActive[type] = false;
            }
        }
    });
}

function concludeInvestment(type) {
    let investmentReturn = 0;
    switch (type) {
        case "short":
            investmentReturn = investmentReturns.short;
            break;
        case "medium":
            investmentReturn = investmentReturns.medium;
            break;
        case "long":
            investmentReturn = investmentReturns.long;
            break;
    }

    // Apply the investment return to the tower height
    const newHeight = Math.max(towerContainer.childElementCount + investmentReturn, 1); // Ensuring the height doesn't go below 1
    adjustTowerHeight(newHeight);

    alert(`Investment concluded: ${type}. Tower height changed by: ${investmentReturn}`);
}

function getColorMultiplier(color) {
    switch (color) {
        case 'red': return 1.1;
        case 'green': return 1.2;
        case 'blue': return 1.3;
        case 'yellow': return 1.4;
        case 'purple': return 1.5;
        default: return 1;
    }
}

function updateScoreboard() {
    const currentHeight = towerContainer.childElementCount;
    currentHeightDisplay.textContent = currentHeight;
    if (currentHeight > bestHeight) {
        bestHeight = currentHeight;
        bestHeightDisplay.textContent = bestHeight;
        localStorage.setItem("bestHeight", bestHeight);
    }
}

function changeTowerColor() {
    const colors = ['red', 'green', 'blue', 'yellow', 'purple'];
    currentColor = colors[Math.floor(Math.random() * colors.length)];
}

function getCurrentColor() {
    return currentColor;
}

function addTowerSection() {
    const towerSection = document.createElement("div");
    towerSection.className = "towerSection";
    towerSection.style.backgroundColor = getCurrentColor();
    towerContainer.appendChild(towerSection);

    if (weatherEffect === "wind") {
        const color = getCurrentColor();
        if (color === 'yellow' || color === 'purple') {
            adjustTowerHeight(Math.ceil(towerContainer.childElementCount * 1.01));
        } else {
            adjustTowerHeight(Math.floor(towerContainer.childElementCount * 0.95));
        }
    }

    updateScoreboard();
}

function adjustTowerHeight(newHeight) {
    while (towerContainer.childElementCount > newHeight) {
        towerContainer.removeChild(towerContainer.lastChild);
    }
    while (towerContainer.childElementCount < newHeight) {
        addTowerSection();
    }
    updateScoreboard();
}

buildButton.addEventListener("click", () => {
    clickCount++;
    if (weatherEffect === "rain" && getCurrentColor() !== 'blue') {
        clickCount++;
    processInvestments();
    }

    if (clickCount % 100 === 0) clicksToIncrease *= 2;
    if (clickCount % clicksToIncrease === 0) addTowerSection();
    if (clickCount % 15 === 0) changeTowerColor();
    processInvestments();
});

spinWheel.addEventListener("click", () => {
    const currentHeight = towerContainer.childElementCount;
    let newHeight;
    if (enhancedWheel) {
        newHeight = currentHeight * 10;
        enhancedWheel = false;
    } else {
        newHeight = Math.random() < 0.5 ? Math.max(Math.floor(currentHeight / 2), 1) : currentHeight * 2;
    }
    adjustTowerHeight(newHeight);
});

saveButton.addEventListener("click", () => {
    localStorage.setItem("towerHeight", towerContainer.childElementCount.toString());
    localStorage.setItem("towerColor", currentColor);
    localStorage.setItem("clickCount", clickCount.toString());
    localStorage.setItem("clicksToIncrease", clicksToIncrease.toString());
    alert("Game Saved!");
});

deleteSave.addEventListener("click", () => {
    localStorage.clear();
    towerContainer.innerHTML = '';
    clickCount = 0;
    clicksToIncrease = 1;
    enhancedWheel = false;
    addTowerSection();
    updateScoreboard();
    alert("Game Reset!");
});

riskButton.addEventListener("click", () => {
    const currentHeight = towerContainer.childElementCount;
    if (currentHeight < 1000) {
        alert("Your tower needs to reach a height of 1,000 to use this feature.");
        return;
    }

    if (!riskButtonUsed) {
        riskButtonUsed = true; // Ensure this button can only be used once

        if (Math.random() < 0.66) {
            // 66% chance to delete the tower
            adjustTowerHeight(1); // Reset tower to minimum height
            alert("Unlucky! Your tower has been deleted.");
        } else {
            // 33% chance to reduce the tower by 10%
            const newHeight = Math.max(Math.floor(currentHeight * 0.9), 1);
            adjustTowerHeight(newHeight);
            alert("Your tower height has been reduced by 10%.");
        }

        // Increase the favorable chance for future spins
        favorableSpinChance += 0.0001;
    } else {
        alert("You have already used the Risk for Reward feature.");
    }
});

// Weather Effects
function startWeatherTimer() {
    if (weatherTimer) {
        clearTimeout(weatherTimer);
    }
    weatherTimer = setTimeout(() => {
        triggerRandomWeather();
    }, 60000); // Trigger weather event every 60 seconds
}

function triggerRandomWeather() {
    const weatherChance = Math.random();
    if (weatherChance < 0.25) { // Adjust this probability as needed
        const weatherType = Math.floor(Math.random() * 4); // Assuming 4 types including Fog
        switch (weatherType) {
            case 0:
                applyRainEffect();
                break;
            case 1:
                applyWindEffect();
                break;
            case 2:
                applyHeatEffect();
                break;
            case 3:
                applyFogEffect();
                break;
        }
    }
    startWeatherTimer(); // Reset the timer for the next weather event
}


function applyRainEffect() {
    alert("Rain starts! Building speed halved.");
    weatherEffect = "rain";
    setTimeout(() => {
        weatherEffect = null;
        alert("Rain stopped.");
    }, 15000 + Math.random() * 15000);
}

function applyWindEffect() {
    alert("Wind starts! Tower size affected.");
    weatherEffect = "wind";
    setTimeout(() => {
        weatherEffect = null;
        alert("Wind stopped.");
    }, 15000 + Math.random() * 15000);
}

function applyHeatEffect() {
    alert("Heat wave! Tower size decreases.");
    weatherEffect = "heat";
    let heatInterval = setInterval(() => {
        if (weatherEffect !== "heat") {
            clearInterval(heatInterval);
            alert("Heat wave ended.");
        } else {
            adjustTowerHeight(Math.floor(towerContainer.childElementCount * 0.9975));
        }
    }, 1000);

    setTimeout(() => {
        weatherEffect = null;
        clearInterval(heatInterval); // Ensure interval is cleared when the effect ends
    }, 15000 + Math.random() * 15000);
}

function applyFogEffect() {
    alert("Fog descends! All click history and debuffs are cleared.");

    // Resetting click-related stats and debuffs
    clickCount = 0;
    clicksToIncrease = 1; // Assuming this is normally modified by clicks
    // Reset other click-related debuffs or modifiers here

    weatherEffect = "fog";

    // Set the duration of the fog effect
    setTimeout(() => {
        weatherEffect = null;
        alert("Fog lifts. Click history can now accumulate again.");
    }, 30000); // 30 seconds duration, adjust as needed
}

startWeatherTimer();
shortInvestButton.addEventListener("click", () => handleInvestment("short"));
mediumInvestButton.addEventListener("click", () => handleInvestment("medium"));
longInvestButton.addEventListener("click", () => handleInvestment("long"));
