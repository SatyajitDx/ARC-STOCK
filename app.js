<script>
    // --- CONFIGURATION ---
    const USDC_ADDR = "0x3600000000000000000000000000000000000000";
    const MERCHANT = "0x7a67f9b3BB918182Ad94182aC10f80F9619be81C";
    const INR_RATE = 94.25;
    let userAddr = "", provider, signer;

    // Stock Data logic
    const stocks = [
        {n:"RELIANCE", p:2985}, {n:"HDFCBANK", p:1532}, {n:"TCS", p:3945}, 
        {n:"TATAMOTORS", p:1012}, {n:"SBIN", p:825}, {n:"ZOMATO", p:188}, 
        {n:"ADANIENT", p:3120}, {n:"ITC", p:420}, {n:"WIPRO", p:455}, {n:"TITAN", p:3240}
    ];

    function init() {
        const list = document.getElementById("marketList");
        list.innerHTML = ""; 
        stocks.forEach(s => {
            list.innerHTML += `
                <div class="watchlist-item" onclick="goToTrade('${s.p}')">
                    <div class="w-info">
                        <div class="w-logo" style="background:#334155;">${s.n[0]}</div>
                        <div class="w-name"><p>${s.n}</p><p>Equity</p></div>
                    </div>
                    <p style="font-weight:700;">₹${s.p}</p>
                </div>`;
        });
    }

    function goToTrade(price) {
        switchTab('market', document.querySelectorAll('.nav-item')[1]);
        document.getElementById('stockSelect').value = price;
        updateCalc();
    }

    // --- WALLET CONNECT FIX ---
    async function connect() {
        if (window.ethereum) {
            try {
                // Request access
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                userAddr = accounts[0];
                
                // Setup Provider & Signer (v5 syntax)
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();

                // UI Updates
                const btn = document.getElementById("walletBtn");
                btn.innerText = userAddr.substring(0, 6) + "..." + userAddr.slice(-4).toUpperCase();
                btn.style.background = "#10b981"; // Connection success color

                fetchBalance();
            } catch (error) {
                console.error("User rejected:", error);
            }
        } else {
            alert("MetaMask install karke refresh karein!");
        }
    }

    function updateCalc() {
        const price = document.getElementById("stockSelect").value;
        const qty = document.getElementById("tradeQty").value || 1;
        const inr = price * qty;
        
        document.getElementById("calcInr").innerText = "₹" + inr.toLocaleString();
        document.getElementById("calcUsdc").innerText = (inr / INR_RATE).toFixed(2) + " USDC";
    }

    // --- TRANSACTION LOGIC ---
    async function processTrade(type) {
        if (!userAddr) return connect();

        try {
            const usdcAmt = document.getElementById("calcUsdc").innerText.split(' ')[0];
            const contract = new ethers.Contract(
                USDC_ADDR, 
                ["function transfer(address to, uint256 value) public returns (bool)"], 
                signer
            );

            // USDC usually has 6 decimals
            const tx = await contract.transfer(
                MERCHANT, 
                ethers.utils.parseUnits(usdcAmt, 6)
            );

            console.log("Transaction Hash:", tx.hash);
            alert(`Order ${type} processing...`);
            
            await tx.wait();
            alert(`Trade Success! Wallet updated.`);
            fetchBalance();
        } catch (err) {
            console.error(err);
            alert("Transaction Failed! Balance check karein.");
        }
    }

    async function fetchBalance() {
        if (!userAddr || !provider) return;
        const contract = new ethers.Contract(USDC_ADDR, ["function balanceOf(address) view returns (uint256)"], provider);
        const bal = await contract.balanceOf(userAddr);
        const f = ethers.utils.formatUnits(bal, 6);
        
        // Update portfolio on Home screen
        document.getElementById("userPortfolio").innerText = "₹" + (f * INR_RATE).toLocaleString('en-IN', {maximumFractionDigits: 2});
    }

    function switchTab(id, el) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        if (el) el.classList.add('active');
    }

    window.onload = init;
</script>
