// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import './ICryptoDev.sol';

contract CryptoDevToken is ERC20,Ownable  {

    ICryptoDev cryptoDev;
    //supply expressed in lowest unit where 1 = (10^-18) (like gwei to eth), so one whole token = 10^18
    uint256 public maxSupply = 10000 * 10**18;
    uint256 public constant tokensPerNFT = 10 * 10**18;
    uint256 public constant ico_price = 0.001 ether;
    mapping (uint256=>bool) public claimedTokens; //track tokenIDs that have claimed their tokens

    modifier cryptoDevHolder {
        require(cryptoDev.balanceOf(msg.sender) > 0, "You do not hold a CryptoDev NFT");
        _;
    }

    constructor (address cryptoDevContractAddress) ERC20("CryptoDevToken", "CD") public {
        cryptoDev = ICryptoDev(cryptoDevContractAddress);
    }

    function buyTokens(uint256 amount) public payable {
        uint256 requiredETHAmount = amount * ico_price;
        require(msg.value >= requiredETHAmount, "Amount of ETH sent is too low");
        uint256 amountDecimals = amount * 10**18;
        require((totalSupply() + amount) <= maxSupply, "Supply will exceed max supply if you buy that much, lower the amount you want to buy");
        _mint(msg.sender, amountDecimals);
    }

    function claimAirdrop() public cryptoDevHolder {
        uint256 NFTBalance = cryptoDev.balanceOf(msg.sender);
        uint8 amountLeftToClaim = 0;
        for (uint256 index = 0; index < NFTBalance; index++) {
            uint256 tokenID = cryptoDev.tokenOfOwnerByIndex(msg.sender, index);
            if(!claimedTokens[tokenID]) {
                amountLeftToClaim++;
                claimedTokens[tokenID] = true;
            }
        }
        require(amountLeftToClaim > 0,"You already claimed all your tokens");
        _mint(msg.sender, NFTBalance * tokensPerNFT);
    }

    function withdrawFunds() public onlyOwner {
        address owner = owner();
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH in this contract");
        (bool sent,) = owner.call{value: balance}("");
        require(sent, "Failed to withdraw funds");
    }

    receive() external payable {}
    fallback() external payable {}
}