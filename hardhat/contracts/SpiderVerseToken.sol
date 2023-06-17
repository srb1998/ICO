// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ISpiderverse.sol";

contract SpiderVerseToken is ERC20, Ownable {

    uint256 public constant tokenPrice = 0.001 ether;
    uint256 public constant tokenPerNFT = 10 * 10**18;
    uint256 public constant maxTotalSupply = 10000 * 10**18;

    ISpiderverse SpiderVerseNFT;

    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _spiderverseContract) ERC20("Spiderverse Token","SV"){
        SpiderVerseNFT = ISpiderverse(_spiderverseContract);
    }

    function mint(uint256 amount) public payable{
        uint256 _requiredAmount = tokenPrice * amount;
        require(msg.value >= _requiredAmount, "Ether sent is incorrect");
        uint256 amountWithDecimals = amount * 10**18;
        require(totalSupply() + amountWithDecimals <= maxTotalSupply, "Exceeds the max total supply");
        _mint(msg.sender,amountWithDecimals);
    }

    function claim() public {
        address sender = msg.sender;
        
        uint256 balance = SpiderVerseNFT.balanceOf(sender);
        require(balance > 0,"You dont have Spiderverse NFT");
        uint256 amount = 0;
        for(uint256 i=0 ;i<balance; i++){
            uint256 tokenId = SpiderVerseNFT.tokenOfOwnerByIndex(sender, i);
            if(!tokenIdsClaimed[tokenId]){
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }

        require(amount > 0, "You have already Claimed all your tokens");

        _mint(msg.sender, amount * tokenPerNFT );
    }

    function withdraw() public onlyOwner{
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw, contract balance is 0");
        
        address _owner = owner();
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

receive() external payable{}

fallback() external payable{}

}

