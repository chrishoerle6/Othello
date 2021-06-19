
// Beskar Project
// Creator: Chris Hoerle 
// File Name: OthelloTokenSale.js
// Date Created: 06/19/2021

var OthelloToken = artifacts.require('./OthelloToken.sol');
var OthelloTokenSale = artifacts.require('./OthelloTokenSale.sol');

contract('OthelloTokenSale', function(accounts) {
	var tokenInstance;
	var tokenSaleInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var numberOfTokens;
	var tokenPrice = 1000000000000000; // In Wei, 0.001 Ether
	var tokensAvailable = 750000;

	// Test cases for OthelloTokenSale.sol public variables
	it('Initializes the contract with the correct values', function() {
		return OthelloTokenSale.deployed().then(function(instance) {
			tokenSaleInstance = instance;
			return tokenSaleInstance.address;
		}).then(function(address) {
			assert.notEqual(address, 0x0, 'Has contract address');
			return tokenSaleInstance.tokenContract();
		}).then(function(address) {
			assert.notEqual(address, 0x0, 'Has Othello token contract address');
			return tokenSaleInstance.tokenPrice();
		}).then(function(price) {
			assert.equal(price, tokenPrice, 'Othello token price is correct');
		});
	});

	it('Facilitates Othello token buying', function() {
		return OthelloToken.deployed().then(function(instance) {
			// Grab Othello token instance first
			tokenInstance = instance;
			return OthelloTokenSale.deployed();
		}).then(function(instance) {
			// Then grab Othello token sale instance
			tokenSaleInstance = instance;
			// Provision 75% of all tokens to the token sale
			return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
		}).then(function(receipt) {
			numberOfTokens = 10;
			return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'Triggers one event');
			assert.equal(receipt.logs[0].event, 'Sell', 'Should be the "Sell" event');
			assert.equal(receipt.logs[0].args._buyer, buyer, 'Logs the account that purchased the Othello tokens');
			assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'Logs the number of Othello tokens purchased');
			return tokenSaleInstance.tokensSold();
		}).then(function(amount) {
			assert.equal(amount.toNumber(), numberOfTokens, 'Increments the number of Othello tokens sold');
			return tokenInstance.balanceOf(buyer);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), numberOfTokens);
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance) {	
			assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
			// Try to buy Othello tokens different from the Ether value
			return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 }); // 1 Wei
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf('revert') >= 0, 'msg.value must equal number of Othello tokens in Wei');
			return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf('revert') >= 0, 'Cannot purchase more Othello tokens than available');
		});
	});

	it('Ends Othello token sale', function() {
		return OthelloToken.deployed().then(function(instance) {
			// Grab Othello token instance first
			tokenInstance = instance;
			return OthelloTokenSale.deployed();
		}).then(function(instance) {
			// Then grab Othello token sale instance
			tokenSaleInstance = instance;
			// Try the sale from account other than the admin
			return tokenSaleInstance.endSale( { from: buyer });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf('revert') >= 0, 'Must be admin to end sale');
			// End sale as admin
			return tokenSaleInstance.endSale({ from: admin });
		}).then(function(receipt) {
			return tokenInstance.balanceOf(admin);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 999990, 'Returns all unsold Othello tokens to admin');
			// Check that Othello token price was reset when selfDestruct was called
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(price) {
			assert.equal(price, 0, 'Othello token price was reset');
		});
	});
});