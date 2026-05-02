// --- CONFIGURATION ---
const USDC_ADDR = "0x3600000000000000000000000000000000000000";
const MERCHANT = "0x7a67f9b3BB918182Ad94182aC10f80F9619be81C";
const INR_RATE = 94.25; // 1 USDC = ₹94.25
let userAddr = "", provider, signer;

// Stocks Data for Market List
const stocks = [
    {n:"RELIANCE", p:2985}, {n:"HDFCBANK", p:1532}, {n:"TCS", p:3945}, 
    {n:"TATAMOTORS", p:1012}, {n:"SBIN", p:825}, {n:"ZOMATO", p:188}, 
    {n:"ADANIENT", p:3120}, {n:"ITC", p:420}, {n:"WIPRO", p:455}, {n:"TITAN", p:3240}
];

// --- INITIALIZE MARKET LIST ---
function init() {
    const list = document.getElementById("marketList");
    if (list) {
        stocks.forEach(s => {
            list.innerHTML += `
                <div class="watchlist-item" onclick="goToTrade('${s.p}')">
                    <div class="w-info">
                        <div class="w-logo" style="background:#334155;">${s.n[0]}</div>
                        <p>${s.n}</p>
                    </div>
                    <p>₹${s.p}</p>
                </div>`;
        });
    }
}

// --- NAVIGATION LOGIC ---
function switchTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(el) el.classList.add('active');
}

// Function to jump from Home to Market with selected stock
function goToTrade(price) {
    switchTab('market', document.querySelectorAll('.nav-item')[1]);
    document.getElementById('stockSelect').value = price;
    updateCalc();
}

// --- WALLET LOGIC ---
async function connect() {
    if(!window.ethereum) return alert("Metamask install karle bhai!");
    try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        userAddr = accounts[0];
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        // Update Wallet Button
        document.getElementById("walletBtn").innerText = userAddr.substring(0,6)+"..."+userAddr.slice(-4).toUpperCase();
        fetchBalance();
    } catch (e) {
        console.error("Connection Error", e);
    }
}

// --- TRADING LOGIC ---
function updateCalc() {
    const price = document.getElementById("stockSelect").value;
    const qty = document.getElementById("tradeQty").value;
    const inr = price * qty;
    
    document.getElementById("calcInr").innerText = "₹" + inr.toLocaleString('en-IN');
    document.getElementById("calcUsdc").innerText = (inr / INR_RATE).toFixed(2) + " USDC";
}

async function processTrade(type) {
    if(!userAddr) return connect();
    
    const btn = event.target;
    try {
        const usdcAmt = document.getElementById("calcUsdc").innerText.split(' ')[0];
        btn.innerText = "PROCESSING...";
        
        const contract = new ethers.Contract(USDC_ADDR, [
            "function transfer(address to, uint256 value) public returns (bool)"
        ], signer);

        // Transaction popup
        const tx = await contract.transfer(MERCHANT, ethers.utils.parseUnits(usdcAmt, 6));
        
        btn.innerText = "CONFIRMING...";
        await tx.wait(); // Wait for block confirmation
        
        alert(`Stock ${type} Success! Check Portfolio.`);
        fetchBalance();
    } catch(e) {
        console.error(e);
        alert("Transaction Fail ho gaya!");
    } finally {
        btn.innerText = type === "BUY" ? "BUY" : "SELL";
    }
}

// --- UTILS ---
async function fetchBalance() {
    if(!userAddr) return;
    const contract = new ethers.Contract(USDC_ADDR, ["function balanceOf(address) view returns (uint256)"], provider);
    const bal = await contract.balanceOf(userAddr);
    const f = ethers.utils.formatUnits(bal, 6);
    
    // Balance display logic
    document.getElementById("userPortfolio").innerText = "₹" + (f * INR_RATE).toLocaleString('en-IN');
}

window.onload = init;
