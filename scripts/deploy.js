
var Migrations = artifacts.require("./Migrations.sol");
var TellorFund = artifacts.require("./TellorFund.sol");

var TellorMaster = artifacts.require("./usingTellor/contracts/TellorMaster.sol");
const Tellor = require("usingtellor/build/contracts/Tellor.json")

let masterAddress ="0x724D1B69a7Ba352F11D73fDBdEB7fF869cB22E19"
let userAddress ="0x20D894d1566770525CbE16DC62A729f4596EfAcd"
function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}



module.exports = async function(callback) {
            console.log(masterAddress)
            let tellor = new web3.eth.Contract(Tellor.abi)
            console.log("here")
            sleep_s(3)
         let t = await new web3.eth.Contract(TellorFund.abi)
        let tellorFund = await t.deploy({data:TellorFund.bytecode,arguments:[userAddress,50,1000000]}).send({from:"0xe010ac6e0248790e08f42d5f697160dedf97e024", gas:6000000})
        console.log(tellorFund._address);
    }