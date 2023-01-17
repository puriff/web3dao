export const NFT_CONTRACT_ADDRESS = "0x8e7F9d61AD0f58aB7b2e1aE9ba2BD2918eEE59CB"
export const NFT_CONTRACT_ABI = [
    "function withdrawEther() external",
    "function tokenByIndex(uint256 index) external view returns (uint256)",
    "function tokenID() external view returns (uint8)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
    "function tokenPrice() external view returns (uint256)",
    "function tokenURI(uint256 tokenId) external view returns (string memory)",
    "function totalSupply() external view returns (uint256)",
    "function maxID() external view returns (uint8)",
    "function mint() external payable",
]