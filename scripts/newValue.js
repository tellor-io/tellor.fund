
var Migrations = artifacts.require("./Migrations.sol");
var TellorFund = artifacts.require("./TellorFund.sol");


// const Web3 = require('web3');
// const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

const TellorFund = artifacts.require("./TellorFund.sol");
const TellorTransfer = require("usingtellor/build/contracts/TellorTransfer.json")
const TellorGettersLibrary = require("usingtellor/build/contracts/TellorGettersLibrary.json")
const TellorLibrary = require("usingtellor/build/contracts/TellorLibrary.json")
const TellorMaster = require("usingtellor/build/contracts/TellorMaster.json")
const Tellor = require("usingtellor/build/contracts/Tellor.json")
const UserContract = require("usingtellor/build/contracts/UserContract.json")
const UsingTellor = require("usingtellor/build/contracts/UsingTellor.json")

contract('Testing Derivative Contracts', function (accounts) {
    let master
    let tellor
    let userContract
    let tellorFund

    beforeEach('Setup contract for each test', async function () {
        await web3.eth.sendTransaction({to:master._address,from:accounts[0],gas:2000000,data:tellor.methods.requestData("1","1",1,0).encodeABI()})  
    })
})