const { CRYPTO_DEVS_NFT_CONTRACT_ADDRESS } = require("../constants");
const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
    const FakeNFTMarketplace = await ethers.getContractFactory(
      "FakeNFTMarketplace"
    );
    const fakeNftMarketplace = await FakeNFTMarketplace.deploy();
    await fakeNftMarketplace.deployed();
  
    console.log("FakeNFTMarketplace deployed to: ", fakeNftMarketplace.address);
  
    // Now deploy the CryptoDevsDAO contract
    const CryptoDevsDAO = await ethers.getContractFactory("CryptoDevDAO");
    const cryptoDevsDAO = await CryptoDevsDAO.deploy(
      fakeNftMarketplace.address,
      CRYPTO_DEVS_NFT_CONTRACT_ADDRESS,
      {
        // This assumes your account has at least 1 ETH in it's account
        // Change this value as you want
        value: ethers.utils.parseEther("0.1"),
      }
    );
    await cryptoDevsDAO.deployed();
  
    console.log("CryptoDevsDAO deployed to: ", cryptoDevsDAO.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
