require('dotenv').config()
const HDWalletProvider = require("@truffle/hdwallet-provider");
// var HDWalletProvider = require("truffle-hdwallet-provider");
 const mnemonic = process.env.ETH_MNEMONIC;
 const accessToken = process.env.WEB3_INFURA_PROJECT_ID;

module.exports = {
  networks: {
    development: {
      accounts: 5,
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 6000000,
      websockets: true
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider("3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216", `https://rinkeby.infura.io/v3/${accessToken}`),
      network_id: 4,
    },
    mainnet: {
      provider: () =>
        new HDWalletProvider(mnemonic, `https://mainnet.infura.io/v3/${accessToken}`),
      network_id: 1,
      gas: 4700000,
      gasPrice: 8000000000,
    },
    mocha: {
      enableTimeouts: false,
      before_timeout: 210000, // Here is 2min but can be whatever timeout is suitable for you.
    },
  }
};

// var HDWalletProvider = require("truffle-hdwallet-provider");

// var mnemonic ="nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish";

//Public - 0xe010ac6e0248790e08f42d5f697160dedf97e024
//Private - 3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216
//ganache-cli -m "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish" -l 10000000


//    // 0x4b9f5c980000000000000000000000000000000000000000000000000000000000000000
    // 0x4b9f5c980000000000000000000000000000000000000000000000000000000000000001
// module.exports = {
//   networks: {
//     development: {
//       host: "localhost",
//       port: 8545,
//       network_id: "*",
//       gas: 10000000,
//       websockets: true
//     },
//     dev2: {
//       host: "localhost",
//       port: 8546,
//       network_id: "*" // Match any network id
//     },
//     rinkeby: {
//       provider: () =>
//       new HDWalletProvider("4bdc16637633fa4b4854670fbb83fa254756798009f52a1d3add27fb5f5a8e16","https://rinkeby.infura.io/v3/7f11ed6df93946658bf4c817620fbced"),
//       network_id: 4
//     },
//     mainnet: {
//       provider: () =>
//       new HDWalletProvider("4bdc16637633fa4b4854670fbb83fa254756798009f52a1d3add27fb5f5a8e16","https://paritymainne1571508719785.nodes.deploy.radar.tech/?apikey=8efab57518069d3bcdbe8de5be236d39ebd85325019231af"),
//       network_id: 1
//     }      
//   }
// };