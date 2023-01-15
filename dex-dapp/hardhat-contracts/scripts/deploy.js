require("dotenv").config({ path: ".env" });

async function main() {

  const CryptoDevsExchangeContract = await ethers.getContractFactory("Exchange");
  const CryptoDevsExchange = await CryptoDevsExchangeContract.deploy(
    "0xF36a9a0cE6370140f7d8386dd4A63b41E3D5CB6F"
  );
  await CryptoDevsExchange.deployed();

  console.log("CryptoDevsExchange deployed to: ", CryptoDevsExchange.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
