// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract LW3Frens is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string _baseTokenURI;
    uint256 public tokenPrice = 0.001 ether;
    uint8 public tokenID;
    bool public pause;
    uint8 public maxID = 10;

    constructor(string memory baseTokenURI) public ERC721("LW3Frens", "LW3F") {
        _baseTokenURI = baseTokenURI;   
    }

    modifier whenNotPaused() {
        require(!pause, "Mint is paused");
        _;
    }

    function mint() public payable whenNotPaused {
        require(msg.value >= tokenPrice, "Incorrect ETH amount");
        require(tokenID <= maxID, "All NFTs have been minted");
        tokenID++;
        _safeMint(msg.sender, tokenID);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }

    function setPaused(bool _pause) public onlyOwner {
        pause = _pause;
    }

    function withdrawEther() public onlyOwner {
        address _owner = owner();
        uint256 ETHBalance = address(this).balance;
        (bool success, ) = _owner.call{value: ETHBalance}("");
        require(success, "Failed to send the ETH");
    }

    receive() external payable {}
    fallback() external payable {}

}