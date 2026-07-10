let username = localStorage.getItem("mcoin_username") || "Player_" + Math.floor(Math.random() * 8900 + 1000);
let currentBalance = parseFloat(localStorage.getItem("mcoin_balance")) || 0.0000;
let customFarmingRate = parseFloat(localStorage.getItem("mcoin_farm_rate")) || 5.00;

const FIREBASE_ENDPOINT = "https://mcoin-bank-market-default-rtdb.asia-southeast1.firebasedatabase.app/leaderboard";

document.addEventListener("DOMContentLoaded", () => {
    let bannedList = JSON.parse(localStorage.getItem("mcoin_blacklist_users")) || [];
    if(bannedList.includes(username)) {
        document.body.innerHTML = `<div class="card" style="border-color:#f7768e; padding:30px;"><h2 style="color:#f7768e;">❌ SECURITY BLOCK LOCKOUT</h2><p style="text-align:center;">This device identity node signature context has been explicitly banned by administrative root directive parameters.</p></div>`;
        return;
    }

    if(localStorage.getItem("mcoin_maintenance_active") === "true" && !window.location.pathname.includes("admin.html")) {                                                     
        let block = document.getElementById("maintBlock"); if(block) block.style.display = "block";
        let app = document.getElementById("appContainer"); if(app) app.style.display = "none";
    }

    runThemeCSSMapping(localStorage.getItem("mcoin_theme") || "dark");
    syncMainframeView();

    setInterval(() => {                                                                                                                                                       
        if(localStorage.getItem("mcoin_maintenance_active") === "true") return;

        let globalSpeedMult = parseFloat(localStorage.getItem("mcoin_global_speed_multiplier")) || 1.0;
        let eventSpinMult = parseFloat(localStorage.getItem("mcoin_mod_multiplier")) || 1.0;

        let computedStepRate = (customFarmingRate / 3600) * globalSpeedMult * eventSpinMult;
        currentBalance += computedStepRate;

        let mainBalLabel = document.getElementById("mainBal"); 
        if(mainBalLabel) mainBalLabel.innerText = currentBalance.toFixed(4);
        localStorage.setItem("mcoin_balance", currentBalance.toFixed(4));

        evaluateRankProgressAndBadges();
    }, 1000);
});                                                                                                                                                                                                                                                                                                                                         

function runThemeCSSMapping(mode) {
    if(mode === "matrix") {
        document.documentElement.style.setProperty('--bg', '#010400');                                                                                                        
        document.documentElement.style.setProperty('--card-bg', '#050c05');                                                                                                   
        document.documentElement.style.setProperty('--border', '#00ff41');
        document.documentElement.style.setProperty('--text', '#39ff14');                                                                                                      
        document.documentElement.style.setProperty('--accent', '#00ff41');
    } else if(mode === "purple") {
        document.documentElement.style.setProperty('--bg', '#0c0214');
        document.documentElement.style.setProperty('--card-bg', '#150624');
        document.documentElement.style.setProperty('--border', '#bd00ff');
        document.documentElement.style.setProperty('--text', '#e0b0ff');
        document.documentElement.style.setProperty('--accent', '#bd00ff');                                                                                                
    } else {
        document.documentElement.style.setProperty('--bg', '#0f111a');                                                                                                        
        document.documentElement.style.setProperty('--card-bg', '#161b22');
        document.documentElement.style.setProperty('--border', '#30363d');
        document.documentElement.style.setProperty('--text', '#e6edf3');
        document.documentElement.style.setProperty('--accent', '#58a6ff');
    }
}

function syncMainframeView() {                                                                                                                                            
    let u = document.getElementById("userLabel"), b = document.getElementById("mainBal"), r = document.getElementById("rateLabel");
    if(u) u.innerText = username; 
    if(b) b.innerText = currentBalance.toFixed(4); 
    if(r) r.innerText = customFarmingRate.toFixed(2);                                        
    let field = document.getElementById("usernameField"); if(field) field.value = username;
}

function writeState() {
    localStorage.setItem("mcoin_balance", currentBalance.toFixed(4));
    localStorage.setItem("mcoin_farm_rate", customFarmingRate.toFixed(2));                                                                                                
    let mainBalLabel = document.getElementById("mainBal"); if(mainBalLabel) mainBalLabel.innerText = currentBalance.toFixed(4);
}                                                                                                                                                                                                                                                                                                                                           

function appendTxHistory(msg) {
    let hist = JSON.parse(localStorage.getItem("mcoin_tx_history_logs")) || [];
    hist.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`); if(hist.length > 5) hist.pop();
    localStorage.setItem("mcoin_tx_history_logs", JSON.stringify(hist));
}                                                                                                                                                                     

function evaluateRankProgressAndBadges() {
    let tierDisplay = document.getElementById("tierLabel");
    let badgeDock = document.getElementById("badgeDock");
    let achList = document.getElementById("achievementsContainer");

    let currentTier = "Novice Miner";
    if(currentBalance >= 50) currentTier = "Ecosystem Operator";
    if(currentBalance >= 500) currentTier = "Mcoin Tycoon 💎";
    if(currentBalance >= 2000) currentTier = "Ecosystem Lord 👑";
    if(tierDisplay) tierDisplay.innerText = currentTier;

    if(!badgeDock) return;
    badgeDock.innerHTML = "";
    let collectionMilestones = [];

    if(currentBalance >= 10) { badgeDock.innerHTML += '<span class="badge" style="background:#238636; color:white;">First Blocks</span>'; collectionMilestones.push("✔️ [Capital Gains Level 1]: Held over 10.00 Mcoin assets inside runtime storage."); }
    if(currentBalance >= 100) { badgeDock.innerHTML += '<span class="badge" style="background:#bb9af7; color:black;">Centurion Wallet</span>'; collectionMilestones.push("✔️ [Capital Gains Level 2]: Cross 100.00 Mcoin network wallet threshold values."); }
    if(customFarmingRate > 5.0) { badgeDock.innerHTML += '<span class="badge" style="background:#e0af68; color:black;">Overclocked Rig</span>'; collectionMilestones.push("✔️ [Hardware Engineering]: Assembled upgrades to multiply base yield vectors."); }

    let debt = parseFloat(localStorage.getItem("mcoin_debt_amt")) || 0;
    if(debt > 0) badgeDock.innerHTML += '<span class="badge" style="background:#f7768e; color:white;">Liabilities Pending ⚠️</span>';

    if(achList) achList.innerHTML = collectionMilestones.length === 0 ? "No computational milestones verified inside local terminal registries." : collectionMilestones.join("<br>");
}

function sendSnapshotToCloud() {
    if (username && username !== "..." && username !== "Anonymous_Miner") {
        let sanitizedDatabaseKey = username.replace(/[^a-zA-Z0-9_]/g, "");
        if (sanitizedDatabaseKey.length >= 3) {
            fetch(`${FIREBASE_ENDPOINT}/${sanitizedDatabaseKey}.json`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },                                                                                                                      
                body: JSON.stringify({ score: parseFloat(currentBalance.toFixed(4)), lastSeen: Date.now() })
            }).catch(err => console.log("Cloud request skipped in standalone offline sandbox."));
        }
    }
}

function commitUsername() {
    let field = document.getElementById("usernameField");
    if(field && field.value.trim().length >= 3) {
        username = field.value.trim();
        localStorage.setItem("mcoin_username", username);
        syncMainframeView();
        sendSnapshotToCloud();
    }
}
