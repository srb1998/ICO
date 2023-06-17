require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;
const SEPOLIYA_PRIVATE_KEY = process.env.SEPOLIYA_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.10",

  networks: {
    sepolia:{
      url: ALCHEMY_API_KEY_URL,
      accounts: [SEPOLIYA_PRIVATE_KEY],
    },
  }
  // Defining Test Network where to deploy to 

  // How do we define which account to use for deployment
};

//Token Contract Address - 0xE1d8404256A462A8fC6936F4E40AbCa2F1eBddbd                                                                                   `
