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
const OracleIDDescriptions = require("usingtellor/build/contracts/OracleIDDescriptions.json")

var calls = 0;
var _date = Date.now()/1000- (Date.now()/1000)%86400;
var bytes = "0x0d7effefdb084dfeb1621348c8c70cc4e871eba4000000000000000000000000";


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

contract('Testing Derivative Contracts', function (accounts) {
    let oracle, event, _endDate
    let master
    let tellor
    let userContract
    let usingTellor
    let tellorOracle
    let tellorFallbackOracle
    let tellorOracleFactory
    let tellorFallbackOracleFactory
    let tellorTransfer
    let tellorGettersLibrary
    let tellorLibrary 
    let tellorFund
    let factory
    let oracleIDDescriptions

    beforeEach('Setup contract for each test', async function () {
        _endDate = ((_date - (_date % 86400000))/1000) + 86400 + (86400 * 4 * calls);
        calls = calls + 1
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
        await web3.eth.sendTransaction({to:master._address,from:accounts[0],gas:2000000,data:tellor.methods.requestData("1","1",10000,0).encodeABI()})      
        userContract = await new web3.eth.Contract(UserContract.abi)
        userContract = await userContract.deploy({data:UserContract.bytecode,arguments:[master._address]}).send({from:accounts[0], gas:4000000})
        oracleIDDescriptions = await new web3.eth.Contract(OracleIDDescriptions.abi)
        oracleIDDescriptions = await oracleIDDescriptions.deploy({data:OracleIDDescriptions.bytecode}).send({from:accounts[0], gas:4000000})
        await oracleIDDescriptions.methods.defineTellorCodeToStatusCode(0,400).send({from:accounts[0]})
        await oracleIDDescriptions.methods.defineTellorCodeToStatusCode(1,200).send({from:accounts[0]})
        await oracleIDDescriptions.methods.defineTellorCodeToStatusCode(2,404).send({from:accounts[0]})
        await oracleIDDescriptions.methods.defineTellorIdToBytesID(1,bytes).send({from:accounts[0]})
        await userContract.methods.setOracleIDDescriptors(oracleIDDescriptions._address).send({from:accounts[0]})
        tellorFund = await TellorFund.new(userContract._address,1)
    })

    it("Test Full Proposal and Settlement - passing", async function(){
        for(var i =1;i<6;i++){
            await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:2000000,data:tellor.methods.submitMiningSolution("1",1,1200).encodeABI()})      
        }
        await advanceTime(86400 * 2);
        string calldata _title, string calldata _desc,uint _minAmountUSD, uint _daystilComplet
        await tellorfund.methods.createProposal("test","give Nick a raise",1200,2).send();
        let count = await tellorfund.proposalCount.call();
        assert(count == 1, "count should be correct");
        await tellorfund.methods.fund(1,1).send()
        await advanceTime(86400 * 2);
        let price = await tellorfund.methods.viewTellorPrice().call();
        assert(price == 1200);
        await tellorfund.methods.closeProposal(1).send()
        let prop = getProposalById(uint _id);
        assert(each piece)


    })
    it("Test Full Proposal and Settlement -failing", async function(){
        for(var i =1;i<6;i++){
            await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:2000000,data:tellor.methods.submitMiningSolution("1",1,1200).encodeABI()})      
        }
        await advanceTime(86400 * 2);
        await tellorfund.methods.createProposal("test","give Nick a raise",2400,2).send();
        await tellorfund.methods.fund(1,1).send()
        let pctFunded = tellor.methods.percentFunded(1).call()
        assert(pctFunded == 50,"Percent funded should work")
        await tellorfund.methods.closeProposal(1).send()
        await advanceTime(86400 * 2);
        await tellorfund.methods.withdrawMoney().send();
        asset(he got his money back)
        let prop = getProposalById(uint _id);
        assert(each piece)
    })
    it("Test Lots of open proposals", async function(){
        for(var i =1;i<6;i++){
            await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:2000000,data:tellor.methods.submitMiningSolution("1",1,1200).encodeABI()}) 
            await tellorfund.methods.createProposal("test","give Nick a raise",1000*i,i).send();     
        }
        await advanceTime(86400 * 2);
        await tellorfund.methods.createProposal("test","give Nick a raise",2400,2).send();
        let count = await tellorfund.methods.getAllOpenProposals().call();
        assert(count.length == 5, "count of proposals should work");
        assert(count[0] == 1, "open proposal array should work")
        for(var i =1;i<=3;i++){
        	await tellorfund.methods.fund(i,1).send(from:accounts[1])
   		}
   		await tellorfund.methods.fund(1,1).send(from: accounts[2])
   		 let myguys = tellorfund.methods.getProposalsByAddress(accounts[1])
   		assert(myguys.length == 3, "proposals by address should work")
   		assert(myguys[0] == 2, "proposal by address should be correct")
   		let addbyid = await tellorfund.methods.getAddressesById(1);
   		assert(addbyid.length == 2, "addbyid should be proper length")
   		assert(addbyid[0] == 1, "addbyid should be correct")
        await tellorfund.methods.closeProposal(1).send()
        await tellorfund.methods.withdrawMoney().send();
        asset(he got his money back)

        assert it was closed properly
    })

})