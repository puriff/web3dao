// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract GoodContract {
    mapping(address => uint256) public balances;

    function addToBalance() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdrawBalance() public {
        require(balances[msg.sender] > 0, "No ETH in the contract");
        uint256 balance = address(this).balance;
        (bool success, ) = (msg.sender).call{value: balances[msg.sender]}("");
        require(success);
        balances[msg.sender] = 0;
    }
}