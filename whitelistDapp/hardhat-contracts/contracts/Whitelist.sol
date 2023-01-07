// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Whitelist {

    uint8 public maxWhitelistedAddresses;
    uint8 public numAddressesWhitelisted;
    mapping (address=>bool) public whitelistedAddress;

    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses =  _maxWhitelistedAddresses;
    }

    function addToWhitelist() public {
        require(numAddressesWhitelisted < 10, "Max number of whitelisted addresses reached");
        require(!whitelistedAddress[msg.sender], "Address already whitelisted");
        whitelistedAddress[msg.sender] = true;
        numAddressesWhitelisted++;
    }

    function isWhitelisted(address _addrToCheck) public view returns(bool) {
        return whitelistedAddress[_addrToCheck];
    }
}