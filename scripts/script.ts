import {ethers} from "hardhat";


async function main() {
  
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();
  const NFT = await ethers.getContractFactory("NFT");

  const nft = await NFT.deploy("SlavkaToken",
  "ST","https://ipfs.io/ipfs/QmWGAVDeEsTb2jLPqA8yku3ywBBNDT7sp9ALJLwAFoDZpX?filename=slavkaNFT-id");
  await nft.deployed();
  
  const MarketPlace = await ethers.getContractFactory("MarketPlace");
  const marketPlace = await MarketPlace.deploy(nft.address,token.address);
  await marketPlace.deployed();
  console.log("Token deployed to:", token.address);
  console.log("NFT deployed to:", nft.address);
  console.log("MarketPlace deployed to:", marketPlace.address);
  
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
