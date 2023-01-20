const { ethers, waffle } = require("hardhat");
const { expect } = require("chai");
const { BigNumber, utils } = require("ethers");
const { formatEther } = require("ethers/lib/utils");

describe("Attack test", async function() {
    it("Guesses the right card", async function() {
        let gameFactory = await ethers.getContractFactory("Game")
        let game = await gameFactory.deploy({ value: utils.parseEther("0.1") })
        await game.deployed()

        let attackFactory = await ethers.getContractFactory("Attack")
        let attack = await attackFactory.deploy(game.address)
        await attack.deployed()

        let tx = await attack.pickCard()
        await tx.wait();

        const balanceGame = await game.getBalance();
        expect(balanceGame).to.equal(BigNumber.from("0"));
    })
})