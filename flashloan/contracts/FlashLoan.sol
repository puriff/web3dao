// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract FlashLoan is FlashLoanSimpleReceiverBase {
    using SafeMath for uint256;
    event Log(address asset, uint val);

    constructor(IPoolAddressesProvider provider) FlashLoanSimpleReceiverBase(provider) {}

    function createFlashloan(address asset, uint amount) external {
        address receiver = address(this);
        bytes memory params = "";
        uint16 refCode = 0;

        POOL.flashLoanSimple(
            receiver,
            asset,
            amount,
            params,
            refCode);
    }

    function executeOperation(address asset, uint256 amount, uint256 premium, address initiator, bytes calldata params) external returns(bool) {
        console.log("i");
        uint amountToPayback = amount.add(premium);
        IERC20(asset).approve(address(POOL), amountToPayback);
        emit Log(asset, amountToPayback);
        return true;
    }
}