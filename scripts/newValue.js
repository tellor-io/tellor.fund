
var Migrations = artifacts.require("./Migrations.sol");
var TellorFund = artifacts.require("./TellorFund.sol");

var TellorMaster = artifacts.require("./usingTellor/contracts/TellorMaster.sol");
const Tellor = require("usingtellor/build/contracts/Tellor.json")

function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

advanceTime = (time) => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [time],
            id: new Date().getTime()
        }, (err, result) => {
            if (err) { return reject(err); }
            return resolve(result);
        });
    });
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
			console.log(masterAddress);
			console.log(tellor.methods)
			await web3.eth.sendTransaction({to:masterAddress,from:accounts[0],gas:2000000,data:tellor.methods.requestData("1","1",1,0).encodeABI()})  
			for(var i =1;i<6;i++){
		           await web3.eth.sendTransaction({to:masterAddress,from:accounts[i],gas:2000000,data:tellor.methods.submitMiningSolution("1",1,1200).encodeABI()})      
		    }
		    await advanceTime(86400 * 2);
			process.exit()
		});

	})

}