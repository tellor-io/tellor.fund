/****Uncomment the body below to run this with Truffle migrate for truffle testing*/
var TellorTransfer = artifacts.require("./usingTellor/contracts/libraries/TellorTransfer.sol");
var TellorLibrary = artifacts.require("./usingTellor/contracts/libraries/TellorLibrary.sol");
var TellorGettersLibrary = artifacts.require("./usingTellor/contracts/libraries/TellorGettersLibrary.sol");
var Tellor = artifacts.require("./usingTellor/contracts/Tellor.sol");
var TellorMaster = artifacts.require("./usingTellor/contracts/TellorMaster.sol");
var UserContract = artifacts.require("./usingTellor/contracts/UserContract.sol");
var TellorFund = artifacts.require("./TellorFund.sol");
/****Uncomment the body to run this with Truffle migrate for truffle testing*/

/**
*@dev Use this for setting up contracts for testing 
*/
function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}
/****Uncomment the body below to run this with Truffle migrate for truffle testing*/
module.exports = async function (deployer) {

  // deploy transfer
  await deployer.deploy(TellorTransfer);
  //sleep_s(30);

  // deploy getters lib
  await deployer.deploy(TellorGettersLibrary);
  //sleep_s(30);

  // deploy lib
  await deployer.link(TellorTransfer, TellorLibrary);
  await deployer.deploy(TellorLibrary);
  //sleep_s(60);

  // deploy tellor
  await deployer.link(TellorTransfer,Tellor);
  await deployer.link(TellorLibrary,Tellor);
  await deployer.deploy(Tellor);
  //sleep_s(60);

  // deploy tellor master
  await deployer.link(TellorTransfer,TellorMaster);
  await deployer.link(TellorGettersLibrary,TellorMaster);
  await deployer.deploy(Tellor).then(async function() {
    await deployer.deploy(TellorMaster, Tellor.address).then(async function(){
      await deployer.deploy(UserContract,TellorMaster.address).then(async function(){
        await deployer.deploy(TellorFund,UserContract.address,1,1)
      })
    })
  });
  
  console.log("Tellor Fund Address", TellorFund.address)


};
