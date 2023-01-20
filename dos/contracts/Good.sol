// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Good {
    address public currentWinner;
    uint256 public topBid;

    constructor() {
        currentWinner = msg.sender;
    }

    function bid() public payable {
        require(msg.value > topBid, "ETH amount smaller than current top bid");
        (bool success, ) = payable(currentWinner).call{value: topBid}("");
        if(success) {
            currentWinner = msg.sender;
            topBid = msg.value;
        }
    } 
}