// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {

    address public cryptoDev;

    constructor(address _cryptoDev) ERC20("CryptoDev LP token", "CD LP"){
        require(_cryptoDev != address(0), "address is null");
        cryptoDev = _cryptoDev;
    }

    function getReserves() public view returns(uint256) {
        //uint256 ethBalance = address(this).balance;
        uint256 CryptoDevBalance = ERC20(cryptoDev).balanceOf(address(this));
        return CryptoDevBalance;
    }

    function addLiquidity(uint256 cryptoDevAmount) public payable returns(uint256) {
        uint liquidity;
        uint256 ethBalance = address(this).balance;
        uint256 cryptoDevReserve = getReserves();
        ERC20 cryptoDevToken = ERC20(cryptoDev);
        if(cryptoDevReserve == 0) {
            cryptoDevToken.transferFrom(msg.sender, address(this), cryptoDevAmount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        }
        else {
            uint ethReserve =  ethBalance - msg.value;
            uint cryptoDevTokenAmount = (msg.value * cryptoDevReserve)/(ethReserve);
            require(cryptoDevAmount >= cryptoDevTokenAmount, "Amount of tokens sent is less than the minimum tokens required");
            cryptoDevToken.transferFrom(msg.sender, address(this), cryptoDevTokenAmount);
            liquidity = (totalSupply() * msg.value)/ ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    function removeLiquidity(uint256 amountLPs) public returns(uint256, uint256) {
        require(amountLPs>0, "Amount of LPs to withdraw should be greater than 0");
        // ((amount of LP tokens that user wants to withdraw) / (total supply of LP tokens) ) * eth resreve
        uint256 LPSupply = totalSupply();
        uint256 ethReserve = address(this).balance;
        uint256 ethAmountToSend = ( amountLPs / ethReserve ) * LPSupply;
        uint cryptoDevAmount = (getReserves() * amountLPs)/ LPSupply;
        _burn(msg.sender, amountLPs);
        payable(msg.sender).transfer(ethAmountToSend);
        ERC20(cryptoDev).transfer(msg.sender, cryptoDevAmount);
        return (ethAmountToSend, cryptoDevAmount);
    }

    function getAmountOfTokens(uint256 inputTokenAmount,uint256 inputTokenReserve, uint256 outputTokenReserve) public pure returns(uint256) {
        require(inputTokenReserve>0 && outputTokenReserve>0, "Invalid reserves");
        uint256 inputAmountWithFees = inputTokenAmount * 99;
        uint256 numerator = inputAmountWithFees * outputTokenReserve;
        uint256 denominator = (inputTokenReserve * 100) + inputAmountWithFees;
        return numerator / denominator;
    }

    function swapETHToCryptoDev(uint256 minAmount) public payable{
        uint256 inputTokenReserve = address(this).balance - msg.value;
        uint256 outputTokenReserve = getReserves();
        uint256 cryptoDevTokenAmount = getAmountOfTokens(msg.value, inputTokenReserve, outputTokenReserve);
        require(cryptoDevTokenAmount >= minAmount, "insufficient output amount");
        ERC20(cryptoDev).transfer(msg.sender, cryptoDevTokenAmount);
    }

    function swapCryptoDevToETH(uint256 cryptoDevTokenAmount, uint256 minAmount) public {
        uint256 outputTokenReserve = address(this).balance;
        uint256 inputTokenReserve = getReserves();
        uint256 ethAmount = getAmountOfTokens(cryptoDevTokenAmount, inputTokenReserve, outputTokenReserve);
        require(ethAmount >= minAmount, "insufficient output amount");
        ERC20(cryptoDev).transferFrom(msg.sender, address(this), cryptoDevTokenAmount);
        payable(msg.sender).transfer(ethAmount);
    }


}