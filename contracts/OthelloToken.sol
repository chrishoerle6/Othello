
// Othello Project
// Creator: Chris Hoerle 
// File Name: OthelloToken.sol
// Date Created: 06/19/2021 

pragma solidity ^0.5.16;

// Smart contract that implements the ERC20 token standard
// In charge of governing the behavior of our cryptocurrency
// Sets the total number of Othello tokens and reads the total number of tokens
contract OthelloToken {

    // State variables that write data to the blockchain when the smart contract is migrated 
    string public name = "Othello";
    string public symbol = "ELLO";
    string public standard = "Othello v1.0";
    uint256 public totalSupply;

    event Transfer( 
      address indexed _from,
      address indexed _to,
      uint256 _value
    );

    event Approval(
      address indexed _owner,
      address indexed _spender,
      uint256 _value
    );

    // State variable that maps an account to a value of Othello tokens 
    mapping(address => uint256) public balanceOf;

    // State variable that allows an account to approve another account to transfer Othello tokens (Nested mapping)
    mapping(address => mapping(address => uint256)) public allowance;

    // Constructor
    constructor(uint256 _initialSupply) public {
      balanceOf[msg.sender] = _initialSupply;
      totalSupply = _initialSupply;
    }

    // Allows an account (owner) to send Othello tokens to another account
    function transfer(address _to, uint256 _value) public returns (bool success) {
      require(balanceOf[msg.sender] >= _value); // require: if true, continue execution. If false, stop execution
      
      balanceOf[msg.sender] -= _value;
      balanceOf[_to] += _value;

      emit Transfer(msg.sender, _to, _value);

      return true;
    }

    // Delegated Tranfer: Allows another account to transfer Othello tokens on the owner's behalf
    // Ex. Placing a limit order. You allow an exchange to make a transfer with your approval
    function approve(address _spender, uint _value) public returns (bool success) {
      // The alloted value that an account approved for a Delegated Transfer
      allowance[msg.sender][_spender] = _value;

      emit Approval(msg.sender, _spender, _value);

      return true;
    }

    // Handles execution of the Delegated Transfer
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
      // If _from has enough Othello tokens 
      require(_value <= balanceOf[_from]);

      // If allowance is big enough
      require(_value <= allowance[_from][msg.sender]);
      
      // Change the balance
      balanceOf[_from] -= _value;
      balanceOf[_to] += _value;

      // Update the allowance
      allowance[_from][msg.sender] -= _value;

      // Transfer event
      emit Transfer(_from, _to, _value);

      return true;
    }
}

