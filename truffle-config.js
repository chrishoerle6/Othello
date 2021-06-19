
// Othello Project
// Creator: Chris Hoerle 
// File Name: truffle-config.js
// Date Created: 06/19/2021

// File used to configure the Truffle project
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Local host
      port: "7545", // Port that Ganache is running on
      network_id: "*" // Match any network ID
    }
  }
};