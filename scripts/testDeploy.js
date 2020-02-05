const TellorFund = artifacts.require("./TellorFund.sol");
const TellorTransfer = require("usingtellor/build/contracts/TellorTransfer.json")
const TellorGettersLibrary = require("usingtellor/build/contracts/TellorGettersLibrary.json")
const TellorLibrary = require("usingtellor/build/contracts/TellorLibrary.json")
const TellorMaster = require("usingtellor/build/contracts/TellorMaster.json")
const Tellor = require("usingtellor/build/contracts/Tellor.json")
const UserContract = require("usingtellor/build/contracts/UserContract.json")
const UsingTellor = require("usingtellor/build/contracts/UsingTellor.json")

module.exports =async function(callback) {
    let master
    let tellor
    let userContract
    let usingTellor
    let tellorGettersLibrary
    let tellorLibrary 
    let tellorFund
        console.log("starting..")
        /**********Start: Manually Deploy Tellor*******************************/
        //Deploy TellorTransfer library
        let t = await new web3.eth.Contract(TellorTransfer.abi)
        let tellorTransfer = await t.deploy({data:TellorTransfer.bytecode}).send({from:accounts[0], gas:3000000})
        t = await new web3.eth.Contract(TellorGettersLibrary.abi)
        //Deploy TellorGetters library
        tellorGettersLibrary  =await t.deploy({data:TellorGettersLibrary.bytecode}).send({from:accounts[0], gas:3000000})
        //Link TellorLibary to TellorTransfer
        var libBytes = TellorLibrary.bytecode.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );
        //Deploy TellorLibary
        t = await new web3.eth.Contract(TellorLibrary.abi)
        tellorLibrary  =await t.deploy({data:libBytes}).send({from:accounts[0], gas:5000000})
        //Link Tellor to TellorTranfer
        var mainBytes = Tellor.bytecode.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );
        //Link Tellor to TellorLibrary 
        mainBytes = mainBytes.replace(
          /_+TellorLibrary_+/g,
          tellorLibrary._address.replace("0x", "")
        );
        //Deploy Tellor
        t = await new web3.eth.Contract(Tellor.abi)
        tellor  =await t.deploy({data:mainBytes}).send({from:accounts[0], gas:5000000})
        //Link TellorMaster to TellorGettersLibrary
        var masterBytes = TellorMaster.bytecode.replace(
          /_+TellorGettersLibrary_+/g,
          tellorGettersLibrary._address.replace("0x", "")
        );
        //Link TellorMaster to TellorTransfer library
        masterBytes = masterBytes.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );
        //Deploy TellorMaster
        t = await new web3.eth.Contract(TellorMaster.abi)
        master = await t.deploy({data:masterBytes,arguments:[tellor._address]}).send({from:accounts[0], gas:4000000})
        /**********End: Manually Deploy Tellor*******************************/    
        userContract = await new web3.eth.Contract(UserContract.abi)
        userContract = await userContract.deploy({data:UserContract.bytecode,arguments:[master._address]}).send({from:accounts[0], gas:4000000})
        tellorFund = await TellorFund.new(userContract._address,1,1)
        console.log("Tellor Fund Address: ",tellorFund.address);
}