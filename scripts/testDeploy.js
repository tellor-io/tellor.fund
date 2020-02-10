const TellorFund = artifacts.require("./TellorFund.sol").new();
const TellorTransfer = require("usingtellor/build/contracts/TellorTransfer.json")
const TellorGettersLibrary = require("usingtellor/build/contracts/TellorGettersLibrary.json")
const TellorLibrary = require("usingtellor/build/contracts/TellorLibrary.json")
const TellorMaster = require("usingtellor/build/contracts/TellorMaster.json")
const Tellor = require("usingtellor/build/contracts/Tellor.json")
const UserContract = require("usingtellor/build/contracts/UserContract.json")
const UsingTellor = require("usingtellor/build/contracts/UsingTellor.json")

module.exports = async function(callback){
    let master
    let tellor
    let userContract
    let usingTellor
    let tellorGettersLibrary
    let tellorLibrary 
    let tellorFund
        console.log("starting..")
        console.log(TellorTransfer.abi)
        let t =  new web3.eth.Contract(TellorTransfer.abi)
        t.deploy({data:TellorTransfer.bytecode}).then(function(res)=>{
            console.log(t)
        })

        callback()
        /**********Start: Manually Deploy Tellor*******************************/
        //Deploy TellorTransfer library
        // let tellorTransfer = await t.deploy({data:TellorTransfer.bytecode}).send({from:accounts[0], gas:3000000})
        // t = await new web3.eth.Contract(TellorGettersLibrary.abi)
        // //Deploy TellorGetters library
        // tellorGettersLibrary  =await t.deploy({data:TellorGettersLibrary.bytecode}).send({from:accounts[0], gas:3000000})
        // //Link TellorLibary to TellorTransfer
        // var libBytes = TellorLibrary.bytecode.replace(
        //   /_+TellorTransfer_+/g,
        //   tellorTransfer._address.replace("0x", "")
        // );
        // //Deploy TellorLibary
        // t = await new web3.eth.Contract(TellorLibrary.abi)
        // tellorLibrary  =await t.deploy({data:libBytes}).send({from:accounts[0], gas:5000000})
        // //Link Tellor to TellorTranfer
        // var mainBytes = Tellor.bytecode.replace(
        //   /_+TellorTransfer_+/g,
        //   tellorTransfer._address.replace("0x", "")
        // );
        // //Link Tellor to TellorLibrary 
        // mainBytes = mainBytes.replace(
        //   /_+TellorLibrary_+/g,
        //   tellorLibrary._address.replace("0x", "")
        // );
        // //Deploy Tellor
        // t = await new web3.eth.Contract(Tellor.abi)
        // tellor  =await t.deploy({data:mainBytes}).send({from:accounts[0], gas:5000000})
        // //Link TellorMaster to TellorGettersLibrary
        // var masterBytes = TellorMaster.bytecode.replace(
        //   /_+TellorGettersLibrary_+/g,
        //   tellorGettersLibrary._address.replace("0x", "")
        // );
        // //Link TellorMaster to TellorTransfer library
        // masterBytes = masterBytes.replace(
        //   /_+TellorTransfer_+/g,
        //   tellorTransfer._address.replace("0x", "")
        // );
        // //Deploy TellorMaster
        // t = await new web3.eth.Contract(TellorMaster.abi)
        // master = await t.deploy({data:masterBytes,arguments:[tellor._address]}).send({from:accounts[0], gas:4000000})
        // /**********End: Manually Deploy Tellor*******************************/    
        // userContract = await new web3.eth.Contract(UserContract.abi)
        // userContract = await userContract.deploy({data:UserContract.bytecode,arguments:[master._address]}).send({from:accounts[0], gas:4000000})
        // tellorFund = await TellorFund.new(userContract._address,1,1)
        // console.log("Tellor Fund Address: ",tellorFund.address);
        // callback()
}


/**
* @title Deploy User Contracts 
* @dev This allows Tellor deploy the community sale contract
*/

/*Imports*/
var UserContract = artifacts.require("UserContract");
var UsingTellor = artifacts.require("UsingTellor");
var OracleIDDescriptions = artifacts.require("OracleIDDescriptions");

/*Helper functions*/
function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

/*notes for validating contract
//solc: 0.5.8+commit.23d335f2.Emscripten.clang
// truffle-flattener ./contracts/01_DeploySaleContract.sol > ./flat_files/01_DeploySaleContract.sol
// truffle exec scripts/01_DeployTellor.js --network rinkeby

/*Variables*/
//rinkeby
//tellorMaster = '0x724D1B69a7Ba352F11D73fDBdEB7fF869cB22E19';

//mainnet
tellorMaster = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5';

var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
var bytes = web3.utils.keccak256(api, 1000);
console.log("bytes", bytes);

console.log("start");
module.exports =async function(callback) {
    let userContract;
    let oracleIDDescriptions;
   console.log("1")
    // oa = (web3.utils.toChecksumAddress(tellorMaster));
    // // tm = (web3.utils.toChecksumAddress(tellorMaster));
    // // console.log("tm", tm);
    // userContract = await UserContract.new(oa);
    // console.log("userContract address:", userContract.address);
    // sleep_s(30)

a = '0x09459fdafD6Fdce14E04B3487A656FBca0b953ea'
userContract = await UserContract.at(a);


process.exit()
}


