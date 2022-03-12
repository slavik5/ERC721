import "@nomiclabs/hardhat-waffle";
import "solidity-coverage"
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";
dotenv.config();
//import "./task/transfer"


module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_API_KEY,
      gas: "auto",
      //gasPrice: 20000000000,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    }
  },
  etherscan: {
    apiKey: process.env.Scum,
  }
};
