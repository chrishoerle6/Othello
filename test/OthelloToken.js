
// Othello Project
// Creator: Chris Hoerle 
// File Name: OthelloToken.js
// Date Created: 06/19/2021

var OthelloToken = artifacts.require("./OthelloToken.sol");

contract('OthelloToken', function(accounts) {
	var tokenInstance;

	// Test cases for the OthelloToken.sol public variables
	it('Initializes the contract with the correct values', function() {
		return OthelloToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, 'Othello', 'Has the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, 'ELLO', 'Has the correct symbol');
			return tokenInstance.standard();
		}).then(function(standard) {
			assert.equal(standard, 'Othello v1.0', 'Has the correct standard');
		});
	});

	// Test cases for the OthelloToken.sol constrcutor
	it('Allocates the initial supply upon deployment', function() {
		return OthelloToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			// Change 1000000 to any other number to verify that the test is working
			assert.equal(totalSupply.toNumber(), 1000000, 'Sets the total supply to 1,000,000');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 1000000, 'It allocates the initial supply to the admin account');
		});
	});
 
    // Test cases for the OthelloToken.sol transfer function 
	it('Transfers Othello token ownership', function() {
		return OthelloToken.deployed().then(function(instance) {
			tokenInstance = instance;
			// Test 'require' statement first by transferring something larger than the sender's balance
			return tokenInstance.transfer.call(accounts[1], 999999999);
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf('revert') >= 0, 'Error message must contain revert');
			return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
		}).then(function(success) {
			assert.equal(success, true, 'It returns true');
			return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'Triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'Logs the account the Othello tokens are transferred from');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'Logs the account the Othello tokens are transferred to');
			assert.equal(receipt.logs[0].args._value, 250000, 'Logs the transfer amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 250000, 'Adds the amount to the receiving account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 750000, 'Deducts the amount from the sending accounts');
		});
	});

	// Test cases for the OthelloToken.sol approve function 
	it('Approves Othello tokens for delegated transfer', function() {
		return OthelloToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100);
		}).then(function(success) {
			assert.equal(success, true, 'It returns true');
			return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'Triggers one event');
			assert.equal(receipt.logs[0].event, 'Approval', 'Should be the "Approval" event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'Logs the account the Othello tokens are authorized from');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'Logs the account the Othello tokens are authorized to');
			assert.equal(receipt.logs[0].args._value, 100, 'Logs the transfer amount');
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 100, 'Stores the allowance for a delegated transfer');
		});
	});

	// Test cases for the OthelloToken.sol transferFrom function
	it('Handles delegated transfers', function() {
		return OthelloToken.deployed().then(function(instance) {
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];
			// Transfer some Othello tokens to fromAccount
			return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
		}).then(function(receipt) {
			// Approve spendingAccount to spend 10 Othello tokens from fromAccount
			return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
		}).then(function(receipt) {
			// Try transferring something larger than the sender's balance
			return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
		}).then(assert.fail).catch(function(error) {
			assert(error.message, 'Cannot transfer value larger than balance');
			// Try transferring something larger than the approved amount
			return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.toString().indexOf('revert') >= 0, 'Cannot transfer larger than approved amount');
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
		}).then(function(success) {
			assert.equal(success, true);
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount});
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'Triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, fromAccount, 'Logs the account the Othello tokens are transferred from');
			assert.equal(receipt.logs[0].args._to, toAccount, 'Logs the account the Othello tokens are transferred to');
			assert.equal(receipt.logs[0].args._value, 10, 'Logs the transfer amount');		
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 90, 'Deducts the amount from the sending account');
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 10, 'Adds the amount from the receiving account');
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 0, 'Deducts the amount from the allowance');
		});
	});
});
