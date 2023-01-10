// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract FakeNFTMarketplace {
    mapping(uint256 => address) public tokens;
    uint256 NFTPrice = 0.1 ether;

    function purchase(uint256 tokenId) external payable {
        require(msg.value == NFTPrice, "ETH amount is incorrect");
        tokens[tokenId] = msg.sender;
    }

    function getPrice() public view returns(uint256) {
        return NFTPrice;
    }

    function available(uint256 tokenId) public view returns(bool) {
        address NFTOwner = tokens[tokenId];
        if(NFTOwner != address(0)) {
            return false;
        } else {
            return true;
        }
    }
}