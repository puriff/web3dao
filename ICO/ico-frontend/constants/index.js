export const ICO_CONTRACT_ADDRESS = "0xF36a9a0cE6370140f7d8386dd4A63b41E3D5CB6F"
export const ICO_ABI = [
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
]
export const NFT_COLLECTION_CONTRACT_ADDRESS = "0x92F761A74dfF71d11175b8ce299f86760DF171E8";
export const NFT_ABI = [
        "function currentSupply() external view returns (uint8)",
        "function maxSupply() external view returns (uint8)",
        "function presaleEnded() external view returns (uint256)",
        "function presaleMint() external",
        "function presaleStarted() external view returns (bool)",
        "function publicMint() external",
        "function startPresale() external",
        "function balanceOf(address account) external view returns (uint256)",
        "function owner() external view returns (address)",
        "function tokenOfOwnerByIndex(address _addr, uint256 index) external view returns(uint256 id)"
]