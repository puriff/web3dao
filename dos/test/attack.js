const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

describe("Attacks auction", async function() {
    it("Prevents other users from bidding", async function() {
        let goodFactory = await ethers.getContractFactory("Good")
        let good = await goodFactory.deploy()
        await good.deployed()

        let attackFactory = await ethers.getContractFactory("Attack")
        let attack = await attackFactory.deploy(good.address)
        await attack.deployed()

        const [_, addr1, addr2] = await ethers.getSigners();

        let tx = await good.connect(addr1).bid({
            value: ethers.utils.parseEther("1"),
        });
        await tx.wait();

        tx = await attack.attack({
            value: ethers.utils.parseEther("3.0"),
        });
        await tx.wait();

        tx = await good.connect(addr2).bid({
            value: ethers.utils.parseEther("4"),
        });
        await tx.wait();

        expect(await good.currentWinner()).to.equal(
            attack.address
          );
    })
})