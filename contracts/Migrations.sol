
// Othello Project
// Creator: Chris Hoerle 
// File Name: Migrations.sol
// Date Created: 06/19/2021

pragma solidity ^0.5.16;

// Contract that handles migrations whenever we deploy the smart contracts to the blockchain.
contract Migrations {
  address public owner;
  uint public last_completed_migration;

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  constructor() public {
    owner = msg.sender;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}

