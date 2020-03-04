
var Migrations = artifacts.require("./Migrations.sol");
var TellorFund = artifacts.require("./TellorFund.sol");

var TellorMaster = artifacts.require("./usingTellor/contracts/TellorMaster.sol");
const Tellor = require("usingtellor/build/contracts/Tellor.json")

let tFundAddress = "0x6BCA541fBDdb50d1c66272982Ab34E8cc850f349"
let masterAddress = "0xFe41Cb708CD98C5B20423433309E55b53F79134a"
let title = "Mike v Brenda"
let desc = "Boxing Match for the Ages"
let minAmountUSD = 2000
let days = 5



function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

module.exports = function(callback) {
            let tellorFund = new web3.eth.Contract(TellorFund.abi)
            let tellor = new web3.eth.Contract(Tellor.abi)
            console.log("here")
            sleep_s(3)
            web3.eth.sendTransaction({to:masterAddress,from:"0xe010ac6e0248790e08f42d5f697160dedf97e024",gas:3000000,data:tellor.methods.approve(tFundAddress,web3.utils.toWei("1")).encodeABI()})  
            sleep_s(15)
            web3.eth.sendTransaction({to:tFundAddress,from:"0xe010ac6e0248790e08f42d5f697160dedf97e024",gas:3000000,data:tellorFund.methods.createProposal(title,desc,minAmountUSD,days).encodeABI()})  
}