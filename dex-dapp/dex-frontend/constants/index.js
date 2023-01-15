export const TOKEN_CONTRACT_ABI = [
    "function tokensPerNFT() external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function maxSupply() external view returns (uint256)",
    "function ico_price() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function buyTokens(uint256 amount) external payable",
    "function claimAirdrop() external",
    "function claimedTokens(uint256) external view returns (bool)",
    "function withdrawFunds() external",
    "function owner() external view returns (address)",
];
export const TOKEN_CONTRACT_ADDRESS = "0xF36a9a0cE6370140f7d8386dd4A63b41E3D5CB6F";
export const EXCHANGE_CONTRACT_ABI = [
    "function removeLiquidity(uint256 amountLPs) external returns (uint256, uint256)",
    "function swapCryptoDevToETH(uint256 cryptoDevTokenAmount, uint256 minAmount) external",
    "function swapETHToCryptoDev(uint256 minAmount) external payable",
    "function getAmountOfTokens(uint256 inputTokenAmount,uint256 inputTokenReserve,uint256 outputTokenReserve) external pure returns (uint256)",
    "function getReserves() external view returns (uint256)",
    "function addLiquidity(uint256 cryptoDevAmount)external payable returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
]
export const EXCHANGE_CONTRACT_ADDRESS = "0x626385899E0D8870Ad3240Fb934619a777C8A86f";