/**
 * ARC INDIPAY - FINAL FIXED LOGIC
 * Aligned with your HTML structure
 */

const USDC_ADDR = "0x3600000000000000000000000000000000000000";
const MERCHANT = "0x7a67f9b3BB918182Ad94182aC10f80F9619be81C";
const ARC_CHAIN_ID = '0x4cef52'; 
const RPC_URL = 'https://rpc.testnet.arc.network';
const INR_RATE = 94.25; 

let userAddr = "", provider, signer;

// --- WALLET CONNECT ---
async function connect() {
    if (!window.ethereum) return alert("MetaMask not found!");

    try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        
        // Auto-switch to Arc Testnet
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ARC_CHAIN_ID }],
            });
        } catch (err) {
            if (err.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: ARC_CHAIN_ID,
                        chainName: 'Arc Testnet',
                        rpcUrls: [RPC_URL],
                        nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                        blockExplorerUrls: ['https://testnet.arcscan.app']
                    }]
                });
            }
        }

        userAddr = accounts[0];
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        // Update UI immediately
        updateUI(true);
        fetchBalance();
        console.log("Connected:", userAddr);
        
    } catch (e) {
        console.error("Connection failed", e);
    }
}

// --- DISCONNECT ---
function disconnectWallet() {
    userAddr = "";
    provider = null;
    signer = null;
    updateUI(false);
    
    // Close the dropdown menu
    const menu = document.getElementById("profileMenu");
    if (menu) menu.classList.remove("show");
    
    document.getElementById("usdcBal").innerText = "0.00";
    document.getElementById("inrBal").innerText = "0.00";
}

// --- UI UPDATES ---
function updateUI(isConnected) {
    const label = document.getElementById("walletLabel");
    const dot = document.getElementById("dot");

    if (isConnected) {
        // Formatted Address: 0x... + last 5 chars
        const displayAddr = userAddr.substring(0, 4) + "..." + userAddr.slice(-5).toUpperCase();
        label.innerText = displayAddr;
        
        // Green dot for active connection
        dot.classList.remove("bg-red-500");
        dot.classList.add("bg-green-500");
    } else {
        label.innerText = "Connect Wallet";
        dot.classList.remove("bg-green-500");
        dot.classList.add("bg-red-500");
    }
}

// Fixed toggle logic
function toggleProfile() {
    if (!userAddr) {
        connect();
    } else {
        const menu = document.getElementById("profileMenu");
        menu.classList.toggle("show");
    }
}

// --- UTILS ---
async function fetchBalance() {
    if (!userAddr) return;
    try {
        const contract = new ethers.Contract(USDC_ADDR, ["function balanceOf(address) view returns (uint256)"], provider);
        const bal = await contract.balanceOf(userAddr);
        const usdc = ethers.utils.formatUnits(bal, 6);
        
        document.getElementById("usdcBal").innerText = parseFloat(usdc).toFixed(2);
        document.getElementById("inrBal").innerText = (parseFloat(usdc) * INR_RATE).toLocaleString('en-IN');
    } catch (e) {
        console.error("Balance fetch failed", e);
    }
}

function copyAddr() {
    if (userAddr) {
        navigator.clipboard.writeText(userAddr);
        alert("Copied!");
        const menu = document.getElementById("profileMenu");
        if (menu) menu.classList.remove("show");
    }
}
