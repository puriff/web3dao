export const NFT_COLLECTION_CONTRACT_ADDRESS = "";
export const abi = [
        "function currentSupply() external view returns (uint8)",
        "function maxSupply() external view returns (uint8)",
        "function presaleEnded() external view returns (uint256)",
        "function presaleMint() external",
        "function presaleStarted() external view returns (bool)",
        "function publicMint() external",
        "function startPresale() external",
        "function owner() external view returns (address)"
]