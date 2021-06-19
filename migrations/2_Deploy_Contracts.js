
// Othello Project
// Creator: Chris Hoerle 
// File Name: 2_Deploy_Contracts.js
// Date Created: 06/19/2021

// Migration that gets run when we deploy the smart contracts

// Reads the smart contracts
var OthelloToken = artifacts.require("./OthelloToken.sol");
var OthelloTokenSale = artifacts.require("./OthelloTokenSale.sol")

// Deploys the smart contracts
module.exports = function(deployer) {
  deployer.deploy(OthelloToken, 1000000).then(function() {
  	var tokenPrice = 1000000000000000; // Price in Wei, 0.001 Ether
  	return deployer.deploy(OthelloTokenSale, OthelloToken.address, tokenPrice);
  });
};
