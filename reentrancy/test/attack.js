const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("Attack", function (){
    it("attacks good contract", async function() {
        let goodContract = await ethers.getContractFactory("GoodContract")
        let goodContractDeployed = await goodContract.deploy()
        await goodContractDeployed.deployed()

        let badContract = await ethers.getContractFactory("BadContract")
        const badContractDeployed = await badContract.deploy(goodContractDeployed.address);
        await badContractDeployed.deployed();

        const [_, innocentAddress, attackerAddress] = await ethers.getSigners();
         // Innocent User deposits 10 ETH into GoodContract
        let tx = await goodContractDeployed.connect(innocentAddress).addToBalance({
            value: parseEther("10"),
        });
        await tx.wait();

        let balanceETH = await ethers.provider.getBalance(goodContractDeployed.address);
        expect(balanceETH).to.equal(parseEther("10"));

        tx = await badContractDeployed.connect(attackerAddress).startAttack({
            value: parseEther("1"),
        });
        await tx.wait();

        balanceETH = await ethers.provider.getBalance(goodContractDeployed.address);
        expect(balanceETH).to.equal(BigNumber.from("0"));

        balanceETH = await ethers.provider.getBalance(badContractDeployed.address);
        expect(balanceETH).to.equal(parseEther("11"));
    }) 
})