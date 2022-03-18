import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let addr: SignerWithAddress[];
let owner: SignerWithAddress;
let NFT: ContractFactory;
let nft: Contract;


let zeroAdd: string;


describe("NFT contract", function () {


  beforeEach(async () => {
    addr = await ethers.getSigners();
    
    NFT = await ethers.getContractFactory("NFT");

    nft = await NFT.deploy(
      "SlavkaToken",
      "ST",
      "https://ipfs.io/ipfs/QmWGAVDeEsTb2jLPqA8yku3ywBBNDT7sp9ALJLwAFoDZpX?filename=1528_2021_07_05_4_.jpg"
    );
    
   
    zeroAdd = '0x0000000000000000000000000000000000000000';
    //nft.grantRole(await nft.MINTER_ROLE(), nft.address)
  });
  describe("name", function () {
    it("should return name", async function () {

      const Name = await nft.name();
      expect("SlavkaToken").to.equal(Name);
    });
  });
  describe("symbol", function () {
    it("should return symbol", async function () {

      const Symbol = await nft.symbol();
      expect("ST").to.equal(Symbol);
    });
  });
 

  describe("ownerOf", function () {
    it("check owners", async function () {
      await nft.mint(addr[1].address);
      expect(await nft.ownerOf(0)).to.equal(addr[1].address);
      
    });
    it("tokenId not exist", async function () {
      
      await expect(nft.ownerOf(0)).to.be.revertedWith("tokenId not exist");
      
    });
  });
  describe("tokenURI", function () {
    it("check tokenURI", async function () {
      await nft.mint(addr[1].address);
      const x=await nft.tokenURI(0)
      expect(await nft.tokenURI(0)).to.equal("https://ipfs.io/ipfs/QmWGAVDeEsTb2jLPqA8yku3ywBBNDT7sp9ALJLwAFoDZpX?filename=1528_2021_07_05_4_.jpg0");
      //console.log(x);
      
    });
    it("check require", async function () {
      
      await expect(nft.tokenURI(0)).to.be.revertedWith("tokenId not exist");
      //console.log(x);
      
    });
  });
  describe("balanceOf", function () {
    it("check balances", async function () {
      await nft.mint(addr[1].address);
      expect(await nft.balanceOf(addr[1].address)).to.equal(1);
      
    });
  });
  describe("approve", function () {
    it("tokenId not exist", async function () {
      await expect(nft.connect(addr[2]).approve(addr[2].address, 1)).to.be.revertedWith("tokenId not exist");
      
    });
    it("The caller must own the token or be an approved operator", async function () {
      await nft.mint(addr[1].address);
      //expect(await token.ownersOf(1)).to.equal(addr[1].address);
      await expect(nft.connect(addr[2]).approve(addr[1].address, 0)).to.be.revertedWith("The caller must own the token or be an approved operator");
    });
    it("approve work rightt", async function () {
      await nft.mint(addr[1].address);
      await nft.connect(addr[1]).approve(addr[2].address,0);
      expect(await nft.connect(addr[1]).getApproved(0)).to.equal(addr[2].address);
    });
  });

  describe("getApproved", function () {
    it("tokenId not exist", async function () {
      await expect(nft.connect(addr[2]).getApproved(13)).to.be.revertedWith("tokenId not exist");

    });

  });
  describe("setApprovalForAll", function () {
    it("operator is caller", async function () {
      await expect(nft.connect(addr[2]).setApprovalForAll(addr[2].address, true)).to.be.revertedWith("operator is caller");

    });
  });
  describe("transferFrom", function () {
    it("tokenId not exist", async function () {
      await expect(nft.connect(addr[2]).transferFrom(addr[2].address, addr[1].address, 2)).to.be.revertedWith("tokenId not exist");

    });
    
    it("from- zero address", async function () {
      
      await expect(nft.transferFrom(zeroAdd, addr[1].address, 0)).to.be.revertedWith("from- zero address");

    });
    it("to-zero address", async function () {
      await expect(nft.transferFrom(addr[1].address, zeroAdd, 0)).to.be.revertedWith("to-zero address");

    });
    it("not ApprovedForAll", async function () {
      await nft.mint(addr[2].address);
      await expect(nft.connect(addr[3]).transferFrom(addr[2].address, addr[1].address, 0)).to.be.revertedWith("not ApprovedForAll or not approved");
    });
    it(" work right: msg.sender==from", async function () {
      await nft.mint(addr[2].address);
      await nft.connect(addr[2]).setApprovalForAll(addr[3].address,true);
      
      await nft.connect(addr[2]).transferFrom(addr[2].address, addr[1].address, 0);
      expect(await nft.ownerOf(0)).to.equal(addr[1].address);
    });
    it(" work right: msg.sender!=from", async function () {
      await nft.mint(addr[2].address);
      await nft.connect(addr[2]).setApprovalForAll(nft.address,true);
      await nft.connect(addr[2]).setApprovalForAll(addr[3].address,true);
      nft.connect(addr[2]).approve(addr[3].address, 0);
      await nft.connect(addr[3]).transferFrom(addr[2].address, addr[1].address, 0);
      expect(await nft.ownerOf(0)).to.equal(addr[1].address);
    });
  });
  describe("mint", function () {
    it("msg.sender must have minter role to mint", async function () {

      await expect(nft.connect(addr[1]).mint(addr[1].address)).to.be
        .revertedWith(`AccessControl: account ${addr[1].address.toLowerCase()} is missing role ${await nft.MINTER_ROLE()}`);

    });
    it("mint on zero address", async function () {
      await expect(nft.mint(zeroAdd)).to.be.revertedWith("mint to the zero address");

    });
  });
});
  


