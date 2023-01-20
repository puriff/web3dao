// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.4;

  contract Game {
    constructor() public payable {}

    function pickACard() private view returns(uint) {
        uint pickedCard = uint(keccak256(abi.encodePacked(blockhash(block.number), block.timestamp)));
        return pickedCard;
    }

    function guessCard(uint cardNumber) public {
        uint pickedCard = pickACard();
        if(cardNumber == pickedCard) {
            (bool sent,) = msg.sender.call{value: 0.1 ether}("");
            require(sent, "Failed to send ether");
        }
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
  }