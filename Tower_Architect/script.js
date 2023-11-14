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

bestHeightDisplay.textContent = bestHeight;

function handleInvestment(investmentType) {
    const currentHeight = towerContainer.childElementCount;
    const colorMultiplier = getColorMultiplier(currentColor);

    if (!investmentActive[investmentType]) {
        let heightDeductionPercentage;
        investmentActive[investmentType] = true;

        switch (investmentType) {
            case "short":
                investmentClicks.short = 5; // Duration for short investment
                investmentReturns.short = calculateInvestmentReturn(currentHeight, colorMultiplier, 1.5, 0.5);
                heightDeductionPercentage = 0.10; // Deducts 10% of tower height for short investment
                alert("Short-term investment started!");
                break;
            case "medium":
                investmentClicks.medium = 10; // Duration for medium investment
                investmentReturns.medium = calculateInvestmentReturn(currentHeight, colorMultiplier, 1.3, 0.7);
                heightDeductionPercentage = 0.15; // Deducts 15% of tower height for medium investment
                alert("Medium-term investment started!");
                break;
            case "long":
                investmentClicks.long = 15; // Duration for long investment
                investmentReturns.long = calculateInvestmentReturn(currentHeight, colorMultiplier, 1.1, 0.9);
                heightDeductionPercentage = 0.20; // Deducts 20% of tower height for long investment
                alert("Long-term investment started!");
                break;
            default:
                alert("Invalid investment type.");
                return;
        }

        // Deduct a percentage of the current tower height as an investment
        const deductedHeight = Math.max(Math.floor(currentHeight * (1 - heightDeductionPercentage)), 1);
        adjustTowerHeight(deductedHeight);
    } else {
        alert("Investment type is already active.");
    }
}

function calculateInvestmentReturn(height, colorMultiplier, highRiskMultiplier, lowRiskMultiplier) {
    const baseReturn = height * colorMultiplier;
    return Math.random() > 0.5 ? baseReturn * highRiskMultiplier : baseReturn * lowRiskMultiplier;
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
    }

    if (clickCount % 100 === 0) clicksToIncrease *= 2;
    if (clickCount % clicksToIncrease === 0) addTowerSection();
    if (clickCount % 15 === 0) changeTowerColor();
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
    }, 90000); // Trigger weather event every 90 seconds
}

function triggerRandomWeather() {
    const weatherChance = Math.random();
    if (weatherChance < 0.05) {
        const weatherType = Math.floor(Math.random() * 3);
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
        }
    }
    startWeatherTimer(); // Reset the timer
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

startWeatherTimer();
shortInvestButton.addEventListener("click", () => handleInvestment("short"));
mediumInvestButton.addEventListener("click", () => handleInvestment("medium"));
longInvestButton.addEventListener("click", () => handleInvestment("long"));

