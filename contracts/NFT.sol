//contracts/Token.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
//import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

//contract token is AccessControl{
contract NFT is  AccessControl {
    using Address for address;
    using Strings for uint256;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private id=0;
    mapping(uint256 => address) private owners;
    mapping(address => uint256) private balances;
    mapping(uint256 => address) private tokenApprovals;
    mapping(address => mapping(address => bool)) private operatorApprovals;
    string private name_;
    string private symbol_;
    string private URI;
   constructor(
        string memory name,
        string memory symbol,
        string memory URI_
    ){
        name_=name;
        symbol_=symbol;
        URI=URI_;
        _setupRole(MINTER_ROLE, msg.sender); 
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);        
       
    }



    function name() public view returns(string memory) {
        return name_;
    }

    function symbol() public view returns(string memory) {
        return symbol_;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(owners[tokenId]!=address(0),"tokenId not exist");        
        return bytes(URI).length > 0 ? string(abi.encodePacked(URI, tokenId.toString())) : "";
    }

    function balanceOf(address account) external view returns(uint256) {
        return balances[account];
    }

    function ownerOf(uint256 tokenId) external view returns(address) {
        
        require(owners[tokenId]!=address(0),"tokenId not exist");
        return owners[tokenId];
    }

    

    

    function approve(address to, uint256 tokenId) public  {
        require(owners[tokenId]!=address(0),"tokenId not exist");
        require(owners[tokenId]==msg.sender||tokenApprovals[tokenId]==msg.sender, "The caller must own the token or be an approved operator");
        
        tokenApprovals[tokenId]=to;
        emit Approval(msg.sender, to, tokenId);
        
    }


    function getApproved(uint256 tokenId) public view returns(address) {
        require(owners[tokenId]!=address(0),"tokenId not exist");
        return tokenApprovals[tokenId];
    }
    function setApprovalForAll(address operator, bool _approved) public
    {
        require(msg.sender!=operator,"operator is caller");
        operatorApprovals[msg.sender][operator]=_approved;
        emit ApprovalForAll(msg.sender, operator, _approved);
    }
    function isApprovedForAll(address owner, address operator) public returns(bool)
    {
        
        return operatorApprovals[owner][operator];
        
    }
    
    // function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public 
    // {
    //     require(_checkOnERC721Received(from, to, tokenId, data), "ERC721: transfer to non ERC721Receiver implementer");
    //     transferFrom(from, to, tokenId);
        
    // }
    
    // function safeTransferFrom(address from, address to, uint256 tokenId) public  {
        
    //     safeTransferFrom(from, to, tokenId,"");
    // }
    // function exists(uint256 tokenId) public returns(bool)
    // {
    //     return owners[tokenId] != address(0);
    // }
    function transferFrom(address from, address to, uint256 tokenId) public{
        require(to != address(0), "to-zero address");
        require(from != address(0), "from- zero address");
        require(owners[tokenId]!=address(0),"tokenId not exist");
        
        if(msg.sender!=from)
        {
            require(isApprovedForAll(from,msg.sender)==true||getApproved(tokenId)==msg.sender,"not ApprovedForAll or not approved");
            approve(address(0), tokenId);
            
            
        }
        
        owners[tokenId]=to; 
        balances[from]-=1;
        balances[to]+=1;   
        emit Transfer(from, to, tokenId);
    }
    function mint(address to) public virtual onlyRole(MINTER_ROLE){
       
        require(to != address(0), "mint to the zero address");
        balances[to] += 1;
        owners[id] = to;
        emit Transfer(address(0), to, id);
        id+=1;

        
    }

    // function _checkOnERC721Received(
    //     address from,
    //     address to,
    //     uint256 tokenId,
    //     bytes memory _data
    // ) private returns (bool) {
    //     if (to.isContract()) {
    //         try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, _data) returns (bytes4 retval) {
    //             return retval == IERC721Receiver.onERC721Received.selector;
    //         } catch (bytes memory reason) {
    //             if (reason.length == 0) {
    //                 revert("ERC721: transfer to non ERC721Receiver implementer");
    //             } else {
    //                 assembly {
    //                     revert(add(32, reason), mload(reason))
    //                 }
    //             }
    //         }
    //     } else {
    //         return true;
    //     }
    // }

    event Transfer(address indexed from, address indexed to, uint256 tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool indexed approved);

}
