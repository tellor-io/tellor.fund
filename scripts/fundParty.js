
var Migrations = artifacts.require("./Migrations.sol");
var TellorFund = artifacts.require("./TellorFund.sol");

var TellorMaster = artifacts.require("./usingTellor/contracts/TellorMaster.sol");
const Tellor = require("usingtellor/build/contracts/Tellor.json")

let toAddress ="0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4"
function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

module.exports = function(callback) {
    web3.eth.getAccounts().then(function(accounts){
        TellorFund.deployed().then(async function(t){
            console.log(t.address)
            let masterAddress = await t.tellorAddress()
            let tellor = new web3.eth.Contract(Tellor.abi)
            console.log("here")
            console.log(accounts)
            sleep_s(3)
            web3.eth.sendTransaction({to:toAddress,gas:21000,value:web3.utils.toWei("2"),from:accounts[0]})
            await web3.eth.sendTransaction({to:masterAddress,from:accounts[0],gas:2000000,data:tellor.methods.theLazyCoon(toAddress,web3.utils.toWei('5000', 'ether')).encodeABI()})  
             process.exit()
        });

    })

}