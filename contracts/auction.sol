// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./NFT.sol";
import "./Token.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MarketPlace is AccessControl {

    mapping(uint256 => uint256) private prices;
    mapping(uint256 => Status) private statuses;

    enum Status{
        NOT,
        SELL,
        BID
    }

    mapping(uint256 => uint256) private bids; // last bid
    mapping(uint256 => address) private bidders; // last bidder

    mapping(uint256 => address) private sellers; 
    mapping(uint256 => uint256) private numberOfBidders;
    mapping(uint256 => uint256) private auctionStart;
    uint32 time = 60 * 60 * 24 * 3;
    address nftAddress;
    address tokenAddress;
    constructor(address _nft, address _token) {
        nftAddress = _nft;
        tokenAddress = _token;
    }

    function priceOf(uint256 tokenId) external view returns(uint256) {
        return prices[tokenId];
    }

    function statusOf(uint256 tokenId) external view returns(Status) {
        return statuses[tokenId];
    }

    function bidOf(uint256 tokenId) external view returns(uint256) {
        return bids[tokenId];
    }

    function bidderOf(uint256 tokenId) external view returns(address) {
        return bidders[tokenId];
    }

    function numberBidderOf(uint256 tokenId) external view returns(uint256) {
        return numberOfBidders[tokenId];
    }

    function createItem(address owner) public {

        NFT(nftAddress).mint(owner);

    }

    function listItem(uint256 tokenId, uint256 price) public {
        require(NFT(nftAddress).ownerOf(tokenId) == msg.sender, "msg.sender not owner");
        require(statuses[tokenId] == Status.NOT, "already listed");


        prices[tokenId] = price;
        statuses[tokenId] = Status.SELL;

    }

    function cancel(uint256 tokenId) public {
        require(NFT(nftAddress).ownerOf(tokenId) == msg.sender, "msg.sender not owner");

        statuses[tokenId] = Status.NOT;
        prices[tokenId] = 0;

    }

    function buyItem(uint256 tokenId) public {

        require(statuses[tokenId] == Status.SELL, "can not buy");
        address owner_ = NFT(nftAddress).ownerOf(tokenId);
        Token(tokenAddress).transferFrom(msg.sender, owner_, prices[tokenId]);
        NFT(nftAddress).transferFrom(owner_, msg.sender, tokenId);
        statuses[tokenId] = Status.NOT;
        prices[tokenId] = 0;

    }

    function listItemOnAuction(uint256 tokenId, uint256 minPrice) public {

        require(NFT(nftAddress).ownerOf(tokenId) == msg.sender, "msg.sender not owner");
        require(statuses[tokenId] == Status.NOT, "already listed");

        NFT(nftAddress).transferFrom(msg.sender, address(this), tokenId);
        sellers[tokenId] = msg.sender;
        statuses[tokenId] = Status.BID;
        bids[tokenId] = minPrice;
        numberOfBidders[tokenId] = 0;
        auctionStart[tokenId] = block.timestamp;
    }

    function makeBid(uint256 tokenId, uint256 price) public {

        require(statuses[tokenId] == Status.BID, "not listed(auction)");
        require(price > bids[tokenId], "low bid");
        if (numberOfBidders[tokenId] > 0) {
            Token(tokenAddress).transfer(bidders[tokenId], bids[tokenId]);
        }
        Token(tokenAddress).transferFrom(msg.sender, address(this), price);
        bids[tokenId] = price;
        numberOfBidders[tokenId] += 1;
        bidders[tokenId] = msg.sender;

    }

    function finishAuction(uint256 tokenId) public {
        require(statuses[tokenId] == Status.BID, "not listed(auction)");
        require(block.timestamp - auctionStart[tokenId] > time, "not enough time");
        if (numberOfBidders[tokenId] > 2) {
            NFT(nftAddress).transferFrom(address(this), bidders[tokenId], tokenId);
            Token(tokenAddress).transfer(sellers[tokenId], bids[tokenId]);
        } else if (numberOfBidders[tokenId] == 0) {
            NFT(nftAddress).transferFrom(address(this), sellers[tokenId], tokenId);
        } else {
            Token(tokenAddress).transfer(bidders[tokenId], bids[tokenId]);
            
            NFT(nftAddress).transferFrom(
                address(this), 
                sellers[tokenId], 
                tokenId
            );
        }
        bids[tokenId] = 0;
        numberOfBidders[tokenId] = 0;
        bidders[tokenId] = address(0);
        statuses[tokenId] = Status.NOT;

    }

}