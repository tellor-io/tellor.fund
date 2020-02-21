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
        await web3.eth.sendTransaction({to:master._address,from:accounts[0],gas:2000000,data:tellor.methods.requestData("1","1",1,0).encodeABI()})      
        userContract = await new web3.eth.Contract(UserContract.abi)
        userContract = await userContract.deploy({data:UserContract.bytecode,arguments:[master._address]}).send({from:accounts[0], gas:4000000})
        oracleIDDescriptions = await new web3.eth.Contract(OracleIDDescriptions.abi)
        oracleIDDescriptions = await oracleIDDescriptions.deploy({data:OracleIDDescriptions.bytecode}).send({from:accounts[0], gas:4000000})
        await oracleIDDescriptions.methods.defineTellorCodeToStatusCode(0,400).send({from:accounts[0]})
        await oracleIDDescriptions.methods.defineTellorCodeToStatusCode(1,200).send({from:accounts[0]})
        await oracleIDDescriptions.methods.defineTellorCodeToStatusCode(2,404).send({from:accounts[0]})
        await oracleIDDescriptions.methods.defineTellorIdToBytesID(1,bytes).send({from:accounts[0]})
        await userContract.methods.setOracleIDDescriptors(oracleIDDescriptions._address).send({from:accounts[0]})
        tellorFund = await TellorFund.new(userContract._address,1,1)
    })

    it("Test Full Proposal and Settlement - passing", async function(){
        for(var i =1;i<6;i++){
            await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:2000000,data:tellor.methods.submitMiningSolution("1",1,1200).encodeABI()})      
        }
        await advanceTime(86400 * 2);
        await web3.eth.sendTransaction({to:master._address,from:accounts[1],gas:2000000,data:tellor.methods.approve(tellorFund.address,web3.utils.toWei("1",'ether')).encodeABI()})   
        await tellorFund.createProposal("test","give Nick a raise",1200,2,{from:accounts[1]});
        let count = await tellorFund.getProposalCount();
        assert(count == 1, "count should be correct");
        await web3.eth.sendTransaction({to:master._address,from:accounts[2],gas:2000000,data:tellor.methods.approve(tellorFund.address,web3.utils.toWei("1",'ether')).encodeABI()})      
        await tellorFund.fund(1,web3.utils.toWei("1",'ether'),{from:accounts[2]})
        await advanceTime(86400 * 2);
        let id = await tellorFund.tellorPriceID.call();
        assert(id == 1, "tellor ID should be correct");
        let vars = await userContract.methods.getCurrentValue(1).call()
        let price = await tellorFund.viewTellorPrice();
        assert(price - 1200 == 0, "price should be 1200");
        let prop = await tellorFund.getProposalById(1);
		assert(prop[0] == "test", "title should be correct")
		assert(prop[1] == "give Nick a raise", "desc should be correct")
		assert(prop[2] == accounts[1], "owner should be correct")
		assert(prop[3] == 1200, "minAmountUSD should be correct")
		assert(prop[4] > _date + 86400 * 2, "date should be correct")
		assert(prop[5] == web3.utils.toWei("1",'ether'), "amount TRB should be correct")
		assert(prop[6] == true, "is open should be correct")
		assert(prop[7] == false, "passed should be correct")
		let obal = await master.methods.balanceOf(accounts[1]).call();
        await tellorFund.closeProposal(1,{from:accounts[1]});
        let nbal = await master.methods.balanceOf(accounts[1]).call();
        assert(web3.utils.fromWei(nbal) - 1 == web3.utils.fromWei(obal), "balances should change properly");
	})
      
    it("Test Full Proposal and Settlement -failing", async function(){
        for(var i =1;i<6;i++){
            await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:2000000,data:tellor.methods.submitMiningSolution("1",1,1200).encodeABI()})      
        }
        await advanceTime(86400 * 2);
        await web3.eth.sendTransaction({to:master._address,from:accounts[1],gas:2000000,data:tellor.methods.approve(tellorFund.address,web3.utils.toWei("1",'ether')).encodeABI()})
        await tellorFund.createProposal("test","give Nick a raise",2400,2,{from:accounts[1]});
        await web3.eth.sendTransaction({to:master._address,from:accounts[2],gas:2000000,data:tellor.methods.approve(tellorFund.address,web3.utils.toWei("1",'ether')).encodeABI()})      
        await tellorFund.fund(1,web3.utils.toWei("1",'ether'),{from:accounts[2]})
        let pctFunded = await tellorFund.percentFunded(1)
        assert(pctFunded == 50,"Percent funded should work")
        let obal = await master.methods.balanceOf(accounts[2]).call();
        await advanceTime(86400 * 2);
        await tellorFund.closeProposal(1,{from:accounts[1]})
        await tellorFund.withdrawMoney({from:accounts[2]});
        let nbal = await master.methods.balanceOf(accounts[2]).call();
        assert(web3.utils.fromWei(nbal) - 1 == web3.utils.fromWei(obal), "he should get his money back");
        let prop = await tellorFund.getProposalById(1);
		assert(prop[0] == "test", "title should be correct")
		assert(prop[1] == "give Nick a raise", "desc should be correct")
		assert(prop[2] == accounts[1], "owner should be correct")
		assert(prop[3] == 2400, "minAmountUSD should be correct")
		assert(prop[4] > _date + 86400 * 2, "date should be correct")
		assert(prop[5] == 0, "amount TRB should be correct")
		assert(prop[6] == false, "is open should be correct")
		assert(prop[7] == false, "passed should be correct")
    })
    it("Test Lots of open proposals", async function(){
        for(var i =1;i<6;i++){
            await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:2000000,data:tellor.methods.submitMiningSolution("1",1,1200).encodeABI()}) 
        }

        for(var i =1;i<6;i++){
            await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:2000000,data:tellor.methods.approve(tellorFund.address,web3.utils.toWei("1",'ether')).encodeABI()})
        	await tellorFund.createProposal("test","give Nick a raise",1000,i,{from:accounts[i]});   
        }  

        await advanceTime(86400 * 2);
        let count = await tellorFund.getAllOpenProposals();
        assert(count.length - 1 == 5, "count of proposals should work");
        assert(count[1] == 1, "open proposal array should work")
        for(var i =1;i<=3;i++){
        	await web3.eth.sendTransaction({to:master._address,from:accounts[1],gas:2000000,data:tellor.methods.approve(tellorFund.address,web3.utils.toWei("1",'ether')).encodeABI()})	
        	await tellorFund.fund(i,web3.utils.toWei("1",'ether'),{from:accounts[1]})
        	await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:2000000,data:tellor.methods.approve(tellorFund.address,web3.utils.toWei("1",'ether')).encodeABI()})	
        	await tellorFund.fund(1,web3.utils.toWei("1",'ether'),{from:accounts[i]})
   		}
        
   		let myguys = await tellorFund.getProposalsByAddress(accounts[1])
        console.log("myguys.propArray.length", myguys.propArray.length)
   		assert(myguys.propArray.length == 5, "proposals by address should work--5")
   		assert(myguys.propArray[1] == 1, "proposal by address should be correct")
   		let addbyid = await tellorFund.getAddressesById(1);
   		assert(addbyid.length == 4, "addbyid should be proper length")
   		assert(addbyid[0] == accounts[1], "addbyid should be correct")
        let obal1 = await master.methods.balanceOf(accounts[1]).call();
        let obal2 = await master.methods.balanceOf(accounts[2]).call();
        let obal3 = await master.methods.balanceOf(accounts[3]).call();
        await advanceTime(86400 * 2);
        let prop = await tellorFund.getProposalById(2);
		assert(prop[0] == "test", "title should be correct")
		assert(prop[1] == "give Nick a raise", "desc should be correct")
		assert(prop[2] == accounts[2], "owner should be correct")
		assert(prop[3] == 1000, "minAmountUSD should be correct")
		assert(prop[4] > _date + 86400 * 2, "date should be correct")
		assert(prop[5] == web3.utils.toWei("1",'ether'), "amount TRB should be correct")
		assert(prop[6] == true, "is open should be correct")
		assert(prop[7] == false, "passed should be correct")
		for(var i =1;i<=3;i++){
			await tellorFund.closeProposal(i)
		}
		let nbal1 = await master.methods.balanceOf(accounts[1]).call();
        let nbal2 = await master.methods.balanceOf(accounts[2]).call();
        let nbal3 = await master.methods.balanceOf(accounts[3]).call();
        assert(web3.utils.fromWei(nbal1) > web3.utils.fromWei(obal1), "he should get his money back1");
        assert(web3.utils.fromWei(nbal2) > web3.utils.fromWei(obal2), "he should get his money back2");
        assert(web3.utils.fromWei(nbal3) > web3.utils.fromWei(obal3), "he should get his money back3");
        count = await tellorFund.getAllOpenProposals();
        assert(count.length - 1== 2, "count of proposals should work");
        assert(count[1] == 5, "open proposal array should work")
        assert(count[2] == 4, "open proposal array should work")
    })

})