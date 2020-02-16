
var Migrations = artifacts.require("./Migrations.sol");
var TellorFund = artifacts.require("./TellorFund.sol");

var TellorMaster = artifacts.require("./usingTellor/contracts/TellorMaster.sol");
const Tellor = require("usingtellor/build/contracts/Tellor.json")

let masterAddress = "0x724D1B69a7Ba352F11D73fDBdEB7fF869cB22E19"
function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

module.exports = function(callback) {
            console.log(masterAddress)
            let tellor = new web3.eth.Contract(Tellor.abi)
            console.log("here")
            sleep_s(3)
            web3.eth.sendTransaction({to:masterAddress,from:"0xe010ac6e0248790e08f42d5f697160dedf97e024",gas:3000000,data:tellor.methods.requestData('PSR4','PSR4',10,50).encodeABI()})  
}