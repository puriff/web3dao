const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle, artifacts } = require("hardhat");
const hre = require("hardhat");

const { DAI, DAI_WHALE, POOL_ADDRESS_PROVIDER } = require("../config");

describe("Deploy an AAVE Flashloan", function() {
    it("Takes a flashloan and repay it", async function() {
        const flashloanExample = await ethers.getContractFactory("FlashLoan")
        const _flashloanExample = await flashloanExample.deploy(POOL_ADDRESS_PROVIDER)

        await _flashloanExample.deployed()

        const token = await ethers.getContractAt("IERC20", DAI)
        const DAI_BALANCE = ethers.utils.parseEther("20000")
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [DAI_WHALE],
          });
        const signer = await ethers.getSigner(DAI_WHALE)
        await token.connect(signer).transfer(_flashloanExample.address, DAI_BALANCE)
          
        const tx = await _flashloanExample.createFlashloan(DAI, 15000)
        await tx.wait()
        const remainingBalance = await token.balanceOf(_flashLoanExample.address);
        expect(remainingBalance.lt(BALANCE_AMOUNT_DAI)).to.be.true;
    });

    
})