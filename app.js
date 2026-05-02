// --- CONFIGURATION ---
const USDC_ADDR = "0x3600000000000000000000000000000000000000";
const MERCHANT = "0x7a67f9b3BB918182Ad94182aC10f80F9619be81C";
const INR_RATE = 94.25;

// Arc Testnet Details for Auto Switch
const ARC_CHAIN_ID = '0x4cef52'; // Hex for Arc Testnet (315090)
const ARC_RPC = 'https://rpc.testnet.arc.network';

let userAddr = "", provider, signer;

// --- WALLET CONNECTION ---
async function connect() {
    if (!window.ethereum) return alert("Bhai, Pehle Metamask install kar!");

    try {
        // 1. Request Accounts (Wallet Connect)
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        userAddr = accounts[0];

        // 2. Auto Switch to Arc Chain
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ARC_CHAIN_ID }],
            });
        } catch (switchError) {
            // Agar chain Metamask mein nahi hai toh add karega
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: ARC_CHAIN_ID,
                        chainName: 'Arc Testnet',
                        rpcUrls: [ARC_RPC],
                        nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                        blockExplorerUrls: ['https://testnet.arcscan.app']
                    }]
                });
            }
        }

        // 3. Setup Ethers Provider
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        // 4. UI UPDATE: Button par address dikhayega
        updateUI();
        
        // 5. Balance check karega
        fetchBalance();

    } catch (error) {
        console.error("Connection failed", error);
    }
}

// --- UI UPDATE FUNCTION ---
function updateUI() {
    const btn = document.getElementById("walletBtn");
    const label = document.getElementById("walletLabel");
    
    if (userAddr) {
        // Address ko chota karega: 0x1234...ABCD
        const shortAddr = userAddr.substring(0, 6) + "..." + userAddr.substring(userAddr.length - 4);
        
        // Button ke andar ka text change karega
        if (label) {
            label.innerText = shortAddr;
        } else {
            btn.innerText = shortAddr;
        }
        
        // Button ka style green kar dega connect hone par
        btn.style.background = "#10b981"; 
        console.log("Wallet Connected: " + userAddr);
    }
}

// --- FETCH BALANCE ---
async function fetchBalance() {
    if(!userAddr) return;
    try {
        const contract = new ethers.Contract(USDC_ADDR, ["function balanceOf(address) view returns (uint256)"], provider);
        const bal = await contract.balanceOf(userAddr);
        const f = ethers.utils.formatUnits(bal, 6);
        
        // Home screen par balance update
        const portfolioElem = document.getElementById("userPortfolio");
        if (portfolioElem) {
            portfolioElem.innerText = "₹" + (parseFloat(f) * INR_RATE).toLocaleString('en-IN');
        }
    } catch (e) {
        console.error("Balance fetch error", e);
    }
}

// Initialize Market List (Jo tune pehle banaya tha)
window.onload = () => {
    // Agar tune init() function banaya hai toh yahan call kar le
    if (typeof init === "function") init();
};
