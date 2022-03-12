import {ethers} from "hardhat";


async function main() {
  
  const Token = await ethers.getContractFactory("Token");

  const token = await Token.deploy("SlavkaToken",
  "ST","https://ipfs.io/ipfs/QmWGAVDeEsTb2jLPqA8yku3ywBBNDT7sp9ALJLwAFoDZpX?filename=slavkaNFT-id");
  await token.deployed();
  
  

  console.log("Token deployed to:", token.address);
  
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
