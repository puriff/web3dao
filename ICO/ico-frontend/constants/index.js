export const ICO_CONTRACT_ADDRESS = "0xa8dBa754f8Fd958b4AA14A373196B00Aa8e465DB"
export const abi = [
    "function tokensPerNFT() external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function maxSupply() external view returns (uint256)",
    "function ico_price() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function buyTokens(uint256 amount) external payable",
    "function claimAirdrop() external"
]