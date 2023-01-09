// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface ICryptoDev {
    function tokenOfOwnerByIndex(address _addr, uint256 index) external view returns(uint256 tokenId);
    function balanceOf(address _addr) external view returns(uint256 balance);

    //get balance with balanceOf (ex => 5), 
    //for(i=0; i<balance; i++) {tokenId = tokenOfOwnerByIndex(address,i)} => get id of tokens owned by _addr
    //need tokenId to mark them as "already claimed the drop"
}