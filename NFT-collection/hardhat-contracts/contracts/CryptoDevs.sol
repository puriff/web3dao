// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import './IWhitelist.sol';

contract CryptoDevs is ERC721Enumerable, Ownable {

    string _baseTokenURI;
    uint8 public maxSupply = 20;
    uint8 public currentSupply;
    bool public _paused;
    bool public presaleStarted;
    IWhitelist whitelist;
    uint256 public presaleEnded;

    modifier notPaused {
        require(!_paused, "Minting is paused");
        _;
    }

    constructor(string memory baseURI, address WhitelistContract) ERC721("Crypto Devs","CD") {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(WhitelistContract);
    }

    function startPresale() public onlyOwner {
        require(!presaleStarted,"Presale already started");
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }

    function presaleMint() public notPaused {
        require(presaleStarted, "Presale hasn't started");
        require(block.timestamp <= presaleEnded, "Presale has ended");
        require(whitelist.whitelistedAddress(msg.sender), "This address is not whitelisted");
        require(currentSupply < maxSupply, "All NFTS have been minted");
        currentSupply++;
        _safeMint(msg.sender, currentSupply);
    }

    function publicMint() public notPaused {
        require(presaleStarted, "Presale hasn't started");
        require(block.timestamp >= presaleEnded, "Presale has ended");
        require(currentSupply < maxSupply, "All NFTS have been minted");
        currentSupply++;
        _safeMint(msg.sender, currentSupply);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setPaused(bool paused) public onlyOwner {
        _paused = paused;
    }

    function withdrawFunds() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) =  _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }   
}