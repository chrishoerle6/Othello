
// Othello Project
// Creator: Chris Hoerle 
// File Name: 1_Initial_Migration.js
// Date Created: 06/19/2021

// Initial migration that gets run whenever we deploy the smart contracts
var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
