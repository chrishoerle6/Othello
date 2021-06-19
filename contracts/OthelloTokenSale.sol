
// Beskar Project
// Creator: Chris Hoerle 
// File Name: OthelloTokenSale.sol
// Date Created: 06/19/2021 

pragma solidity ^0.5.16;

import "./OthelloToken.sol";

// Smart contract that allows the sale of Othello tokens
// It sets an Othello token price in Wei and assigns an admin
// It allows an admin to buy Othello tokens and end a sale
contract OthelloTokenSale {

	// State variables that write data to the blockchain when the smart contract is migrated
	address payable admin;
	OthelloToken public tokenContract;
	uint256 public tokenPrice;
	uint256 public tokensSold;

	event Sell(address _buyer, uint256 _amount);

	// Constructor
	constructor(OthelloToken _tokenContract, uint256 _tokenPrice) public {
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}

	// Needed for buyTokens function
	function multiply(uint x, uint y) internal pure returns (uint z) {
		require(y == 0 || (z = x * y) / y == x);
	}

	// Allows people to buy Othello tokens
	function buyTokens(uint256 _numberOfTokens) public payable {
   		// If the value is equal to Othello tokens
   		require(msg.value == multiply(_numberOfTokens, tokenPrice));
   		
   		// If the contract has enough Othello tokens
   		require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
   		
   		// If the transfer is successful
   		require(tokenContract.transfer(msg.sender, _numberOfTokens));
   		
		// Keep track of tokensSold
   		tokensSold += _numberOfTokens;

   		emit Sell(msg.sender, _numberOfTokens);
	}

	function endSale() public {
		// Require that only an admin can perform this
		require(msg.sender == admin);

		// Transfer remaining Othello tokens to admin
		require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));

		// Destroy the contract when this is done
		selfdestruct(admin);
	}
}

