var Migrations = artifacts.require("./Migrations.sol");
var TellorFund = artifacts.require("./TellorFund.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(TellorFund,"0x0d7EFfEFdB084DfEB1621348c8C70cc4e871Eba4",1,1)
};
