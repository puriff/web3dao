const {ethers} = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
  const verifyContract = await ethers.getContractFactory("LW3Frens");
  const deployedVerifyContract = await verifyContract.deploy("ipfs://QmQNRTVNTsTa9TbDprGVy6zHPMWvEnnuSJ3Ej1xjXGtanJ/");
  await deployedVerifyContract.deployed();

  // print the address of the deployed contract
  console.log("Contract deployed at:", deployedVerifyContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


//0x8e7F9d61AD0f58aB7b2e1aE9ba2BD2918eEE59CB