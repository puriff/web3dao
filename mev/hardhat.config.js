require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: "https://endpoints.omniatech.io/v1/eth/goerli/public",
      accounts: [PRIVATE_KEY],
    },
  },
};