const { ethers } = require("hardhat");
require("dotenv").config({ path:".env"});
const {SPIDERVERSE_NFT_CONTRACT_ADDRESS} = require("../constants");


async function main(){
  const spiderverseTokenContract = await ethers.getContractFactory("SpiderVerseToken");
  const deployedspiderverseTokenContract = await spiderverseTokenContract.deploy(SPIDERVERSE_NFT_CONTRACT_ADDRESS);
  await deployedspiderverseTokenContract.deployed();
  console.log("Token Contract Address", deployedspiderverseTokenContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//Token Contract Address - 0xE1d8404256A462A8fC6936F4E40AbCa2F1eBddbd