// --- CONFIGURATION ---
const USDC_ADDR = "0x3600000000000000000000000000000000000000"; 
const MERCHANT_ADDRESS = "0x7a67f9b3BB918182Ad94182aC10f80F9619be81C"; 
const ARC_CHAIN_ID = '0x4cef52'; 
const RPC_URL = 'https://rpc.testnet.arc.network';
const INR_RATE = 94.25; 

let userAddress = "", provider, signer, codeReader, currentService = "DIRECT";

// --- INITIALIZE ON LOAD ---
window.addEventListener('load', async () => {
    if (window.ethereum && localStorage.getItem("isWalletConnected") === "true") {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) setupWallet(accounts[0]);
    }
});

// --- WALLET CORE ---
async function connectWallet() {
    if (!window.ethereum) {
        window.location.href = "https://metamask.app.link/dapp/" + window.location.href.replace(/https?:\/\//, "");
        return;
    }
    try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        await window.ethereum.request({ 
            method: 'wallet_switchEthereumChain', 
            params: [{ chainId: ARC_CHAIN_ID }] 
        }).catch(async (e) => {
            if (e.code === 4902) {
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
        });
        setupWallet(accounts[0]);
    } catch (e) { console.error(e); }
}

function setupWallet(addr) {
    userAddress = addr;
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    document.getElementById("dot").className = "bg-green-500 w-2 h-2 rounded-full";
    document.getElementById("walletLabel").innerText = addr.substring(0, 6) + "..." + addr.slice(-4).toUpperCase();
    localStorage.setItem("isWalletConnected", "true");
    fetchBalance();
}

// --- NEW: SMART VALIDATION MODAL TRIGGER ---
function showValidationError(message) {
    const validModal = document.getElementById('validModal');
    const validText = document.getElementById('validText');
    if (validModal && validText) {
        validText.innerText = message.toUpperCase();
        validModal.classList.remove('hidden');
    } else {
        alert(message); // Fallback agar modal missing ho
    }
}
