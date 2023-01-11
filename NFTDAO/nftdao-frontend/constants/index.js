export const MARKETPLACE_CONTRACT_ADDRESS = "0x2d5C7E50501F1E642Fc13BF2D98c5353DEdE77DE"
export const MARKETPLACE_ABI = [
    "function available(uint256 tokenId) external view returns (bool)",
    "function getPrice() external view returns (uint256)",
    "function purchase(uint256 tokenId) external payable",
    "function tokens(uint256) external view returns (address)",
]
export const DAO_CONTRACT_ADDRESS = "0x7a21AA3c42c29ED13dE17D29A42339509D2EB36F";
export const DAO_ABI = [
    "function createProposal( uint256 tokenId ) external  returns (uint256 )",
    "function executeProposal( uint256 proposalId ) external",
    "function numberProposals(  ) external view returns (uint256 )",
    "function owner(  ) external view returns (address )",
    "function proposals( uint256  ) external view returns (uint256 nftTokenId, uint256 deadline, uint256 votesYes, uint256 votesNo, bool executed)",
    "function voteOnProposal( uint256 proposalId,uint8 vote ) external",
    "function withdrawFunds(  ) external",
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