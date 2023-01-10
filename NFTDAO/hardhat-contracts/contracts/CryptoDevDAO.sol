// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFakeNFTMarketplace {
    function getPrice() external view returns (uint256);
    function available(uint256 _tokenId) external view returns (bool);
    function purchase(uint256 _tokenId) external payable;
}

interface ICryptoDevNFT {
    function balanceOf(address owner) external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}

contract CryptoDevDAO is Ownable {
    IFakeNFTMarketplace NFTMarketplace;
    ICryptoDevNFT cryptoDevNFT;
    mapping(uint256 => Proposal) public proposals;
    uint256 public numberProposals;

    struct Proposal {
        uint256 nftTokenId;
        uint256 deadline;
        uint256 votesYes;
        uint256 votesNo;
        bool executed;
        mapping(uint256 => bool) voters;
    }

    enum Vote {
        YAY,
        NAY 
    }

    modifier cryptoDevNFTHolder {
        require(cryptoDevNFT.balanceOf(msg.sender) > 0, "You don't hold a CryptoDev NFT");
        _;
    }

    modifier proposalStillLive(uint256 proposalId) {
        require(proposals[proposalId].deadline > block.timestamp, "Proposal deadline is passed");
        _;
    }

    modifier inactiveProposal(uint256 proposalId) {
        require(proposals[proposalId].deadline < block.timestamp, "Proposal is still active");
        require(proposals[proposalId].executed == false,"Proposal already executed");
        _;
    }

    constructor(address NFTMarketplaceAddress, address cryptoDevNFTAddress) public payable {
        NFTMarketplace = IFakeNFTMarketplace(NFTMarketplaceAddress);
        cryptoDevNFT = ICryptoDevNFT(cryptoDevNFTAddress);
    }

    function createProposal(uint256 tokenId) external cryptoDevNFTHolder returns(uint256) {

        require(NFTMarketplace.available(tokenId), "NFT_NOT_FOR_SALE");
        Proposal storage proposal = proposals[numberProposals];
        proposal.nftTokenId = tokenId;
        proposal.deadline = block.timestamp + 5 minutes;
        numberProposals++; 
        return numberProposals - 1;
    }

    function voteOnProposal(uint256 proposalId, Vote vote) external cryptoDevNFTHolder proposalStillLive(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        uint256 voterNFTBalance = cryptoDevNFT.balanceOf(msg.sender);
        uint256 numVotes = 0;

        for (uint256 i = 0; i < voterNFTBalance; i++) {
            uint256 tokenId = cryptoDevNFT.tokenOfOwnerByIndex(msg.sender, i);
            if (proposal.voters[tokenId] == false) {
                numVotes++;
                proposal.voters[tokenId] = true;
            }
        }
        require(numVotes > 0, "ALREADY_VOTED");

        if(vote == Vote.YAY) {
            proposal.votesYes++;
        }
        else {
            proposal.votesNo++;
        }
    } 

    function executeProposal(uint proposalId) external cryptoDevNFTHolder inactiveProposal(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.votesYes > proposal.votesNo) {
            uint256 nftPrice = NFTMarketplace.getPrice();
            require(address(this).balance >= nftPrice, "NOT_ENOUGH_FUNDS");
            NFTMarketplace.purchase{value: nftPrice}(proposal.nftTokenId);
        }
        proposal.executed = true;
    }

    function withdrawFunds() public onlyOwner {
        address _owner = owner();
        uint256 balance = address(this).balance;
        (bool sent, ) = (_owner).call{value: balance}("");
        require(sent, "Failed to transfer Ether");
    }


    function receive()public payable  {}
    function fallback() public payable  {}
}