import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let addr: SignerWithAddress[];
let Token: ContractFactory;
let token: Contract;
let zeroAdd: string;
let MarketPlace: ContractFactory;
let marketPlace: Contract;
let NFT: ContractFactory;
let nft: Contract;

function skipTime(s: number) {
    ethers.provider.send("evm_increaseTime", [s]);
    ethers.provider.send("evm_mine", []);
  }

describe("MarketPlace contract", function () {

    beforeEach(async () => {
        addr = await ethers.getSigners();
  
        Token = await ethers.getContractFactory("Token");
        token = await Token.deploy();
  
      

        NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
            "SlavkaToken",
            "ST",
            "https://ipfs.io/ipfs/QmWGAVDeEsTb2jLPqA8yku3ywBBNDT7sp9ALJLwAFoDZpX?filename=1528_2021_07_05_4_.jpg"
        );
        MarketPlace = await ethers.getContractFactory("MarketPlace");
        marketPlace = await MarketPlace.deploy(nft.address,token.address);
        zeroAdd = '0x0000000000000000000000000000000000000000';
        await nft.grantRole(await nft.MINTER_ROLE(), marketPlace.address);

        
    });
    describe("listItem", function () {
        it("msg.sender not owner", async function () {
            await marketPlace.createItem(addr[2].address);
            
            await expect(marketPlace.connect(addr[1]).listItem(0,10)).to.be.revertedWith("msg.sender not owner");
        });
        it("already listed", async function () {          
            await marketPlace.createItem(addr[2].address);
            marketPlace.connect(addr[2]).listItem(0,10);
            await expect(marketPlace.connect(addr[2]).listItem(0,10)).to.be.revertedWith("already listed");
          
        });
        // it("already listed", async function () {          
        //     await marketPlace.createItem(addr[2].address);
            
        //     marketPlace.connect(addr[2]).listItemOnAuction(0,10);
        //     await expect(marketPlace.connect(addr[2]).listItem(0,20)).to.be.revertedWith("already listed");
          
        // });

      });
    describe("cancel", function () {
        it("msg.sender not owner", async function () {
            await marketPlace.createItem(addr[2].address);
            marketPlace.connect(addr[2]).listItem(0,10);
            await expect(marketPlace.connect(addr[1]).cancel(0)).to.be.revertedWith("msg.sender not owner");
        });
        it("cancel good", async function () {
            await marketPlace.createItem(addr[2].address);
            marketPlace.connect(addr[2]).listItem(0,10);
            await marketPlace.connect(addr[2]).cancel(0);
            expect(await marketPlace.connect(addr[2]).statusOf(0)).to.be.equal(0);
        });
    });
    describe("buyItem", function () {
        it("can not buy", async function () {
            await marketPlace.createItem(addr[2].address);
            
            await expect(marketPlace.connect(addr[1]).buyItem(0)).to.be.revertedWith("can not buy");
        });
        it("buyItem good", async function () {
            await marketPlace.createItem(addr[2].address);
            await nft.connect(addr[2]).approve(marketPlace.address, 0);
            await marketPlace.connect(addr[2]).listItem(0,10);
            await token.mint(addr[1].address,10);
            await token.connect(addr[1]).approve(marketPlace.address, 10);
            expect(await marketPlace.connect(addr[1]).priceOf(0)).to.be.equal(10);
            await marketPlace.connect(addr[1]).buyItem(0);
            expect(await marketPlace.connect(addr[2]).statusOf(0)).to.be.equal(0);
            expect(await token.connect(addr[2]).balanceOf(addr[2].address)).to.be.equal(10);
        });
    });
    describe("listItemOnAuction", function () {
        it("msg.sender not owner", async function () {
            await marketPlace.createItem(addr[2].address);
            
            await expect(marketPlace.connect(addr[1]).listItemOnAuction(0,10)).to.be.revertedWith("msg.sender not owner");
        });
        it("already listed", async function () {          
            await marketPlace.createItem(addr[2].address);
            await marketPlace.connect(addr[2]).listItem(0,10);
            await expect(marketPlace.connect(addr[2]).listItemOnAuction(0,10)).to.be.revertedWith("already listed");
          
        });
        

      });
      describe("makeBid", function () {
        it("low bid", async function () {
            await marketPlace.createItem(addr[2].address);
            await nft.connect(addr[2]).approve(marketPlace.address, 0);
            await marketPlace.connect(addr[2]).listItemOnAuction(0,10)
            await expect(marketPlace.connect(addr[1]).makeBid(0,5)).to.be.revertedWith("low bid");
        });
        it("not listed(auction)", async function () {
            await marketPlace.createItem(addr[2].address);
            
            await expect(marketPlace.connect(addr[1]).makeBid(0,5)).to.be.revertedWith("not listed(auction)");
        });
        it("makeBid good", async function () {
            await marketPlace.createItem(addr[2].address);
            await nft.connect(addr[2]).approve(marketPlace.address, 0);
            await marketPlace.connect(addr[2]).listItemOnAuction(0,10)
            await token.mint(addr[1].address,15);
            await token.connect(addr[1]).approve(marketPlace.address, 15);
            await marketPlace.connect(addr[1]).makeBid(0,15)
            expect(await marketPlace.connect(addr[2]).bidOf(0)).to.be.equal(15);
            expect(await marketPlace.connect(addr[2]).numberBidderOf(0)).to.be.equal(1);
            expect(await marketPlace.connect(addr[2]).bidderOf(0)).to.be.equal(addr[1].address);
            await token.mint(addr[3].address,25);
            await token.connect(addr[3]).approve(marketPlace.address, 25);
            await marketPlace.connect(addr[3]).makeBid(0,25);
            expect(await token.balanceOf(addr[1].address)).to.be.equal(15);
            
        });
    
    });
    describe("finishAuction", function () {
        it("not listed(auction)", async function () {
            await marketPlace.createItem(addr[2].address);
            await expect(marketPlace.connect(addr[1]).finishAuction(0)).to.be.revertedWith("not listed(auction)");
        });
        it("not enough time", async function () {
            await marketPlace.createItem(addr[2].address);
            await nft.connect(addr[2]).approve(marketPlace.address, 0);
            await marketPlace.connect(addr[2]).listItemOnAuction(0,10)
            await expect(marketPlace.connect(addr[1]).finishAuction(0)).to.be.revertedWith("not enough time");
        });
        it("finishAuction good(zero bidders)", async function () {
            await marketPlace.createItem(addr[2].address);
            await nft.connect(addr[2]).approve(marketPlace.address, 0);
            await marketPlace.connect(addr[2]).listItemOnAuction(0,10);
            skipTime(60*60*24*3);
            await marketPlace.connect(addr[2]).finishAuction(0);
            expect(await nft.connect(addr[2]).ownerOf(0)).to.be.equal(addr[2].address);
        });
        it("finishAuction good(one bidder)", async function () {
            await marketPlace.createItem(addr[2].address);
            await nft.connect(addr[2]).approve(marketPlace.address, 0);
            await marketPlace.connect(addr[2]).listItemOnAuction(0,10);
            await token.mint(addr[1].address,15);
            await token.connect(addr[1]).approve(marketPlace.address, 15);
            await marketPlace.connect(addr[1]).makeBid(0,15)
            skipTime(60*60*24*3);
            await marketPlace.connect(addr[2]).finishAuction(0);
            expect(await nft.connect(addr[2]).ownerOf(0)).to.be.equal(addr[2].address);
            expect(await token.connect(addr[1]).balanceOf(addr[1].address)).to.be.equal(15);
        });
        it("finishAuction good(3 bidders)", async function () {
            await marketPlace.createItem(addr[2].address);
            await nft.connect(addr[2]).approve(marketPlace.address, 0);
            await marketPlace.connect(addr[2]).listItemOnAuction(0,10);
            await token.mint(addr[1].address,15);
            await token.connect(addr[1]).approve(marketPlace.address, 15);
            await marketPlace.connect(addr[1]).makeBid(0,15)
            await token.mint(addr[3].address,25);
            await token.connect(addr[3]).approve(marketPlace.address, 25);
            await marketPlace.connect(addr[3]).makeBid(0,25)
            await token.mint(addr[4].address,35);
            await token.connect(addr[4]).approve(marketPlace.address, 35);
            await marketPlace.connect(addr[4]).makeBid(0,35)
            
            skipTime(60*60*24*3);
            await marketPlace.connect(addr[2]).finishAuction(0);
            expect(await nft.connect(addr[2]).ownerOf(0)).to.be.equal(addr[4].address);
            expect(await token.connect(addr[1]).balanceOf(addr[2].address)).to.be.equal(35);
        });
    });
});