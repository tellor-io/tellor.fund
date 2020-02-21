pragma solidity >=0.4.21;
import "usingtellor/contracts/UsingTellor.sol";

/**
 * @title Tellor Fund
 * @notice Allows the Tellor communtiy to propose and fund different 
 * activities like paid AMA's, listing fees influencer's interviews.
 * The proposal is originally funded by the creator and if it fails to 
 * reach the minimum threshold it refunds the funds to the users that "voted"
 */

contract TellorFund is UsingTellor{
    /*Variables*/
	uint private proposalCount;
	uint public tellorPriceID; //??
	uint public granularity; //??
	uint[] openProposals;

	struct Proposal{
		string title;
		string description;
		address owner;
		uint minAmountUSD;
		uint expirationDate;
		uint trbBalance;
		bool open;
		bool passed;
	}

	struct Funder{
		address funder;
		uint amount;
	}

	struct Statement{
		uint id;
		uint amount;
	}

	mapping(uint => Proposal) idToProposal;
	mapping(uint => Funder[]) idToFunders;
	mapping(address => Statement[]) addressToStatements;//???
	mapping(uint => uint) idToOpenIndex;
	mapping(address => uint) availableForWithdraw;

    /*Events*/
	event NewProposal(uint _id,string _title,string _desc,uint _minAmountUSD,uint _daystilComplete);
	event ProposalFunded(uint _id, address _funder, uint _amount);
	event ProposalClosed(uint _id, bool _funded, uint _amount);

    /*
    * @dev Sets the usercontract, tellor's request data Id and 
    * amount of decimals to include(granularity)
    * @param _userContract is the userContract address for Tellor
    * @param _tellorPriceID is Tellor's request ID to read data from ??
    * @param _granularity is the amount of decimals to include in the price feed
    */
    constructor(address _userContract, uint _tellorPriceID, uint _granularity) public UsingTellor(_userContract){
    	proposalCount = 1;
    	tellorPriceID = _tellorPriceID;
    	granularity = _granularity;
    	openProposals.length++;
    }


    /*
    * @dev Creates a proposoal
    * @param _title is the proposal's title
    * @param _desc is the proposal description
    * @param _minAmountUSD is the minimun USD threshold to fund before the proposal goes to a vote???
    * @param _daystilComplete number of days allowed for funding???
    */
	function createProposal(string calldata _title, string calldata _desc,uint _minAmountUSD, uint _daystilComplete) external returns(uint _id){
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
        require(_tellor.transferFrom(msg.sender,address(this),1e18), "Fee to create proposal failed to tranfer");
		require(_daystilComplete < 30);
		_id = proposalCount;
		proposalCount++;
		idToProposal[_id] = Proposal({
			title:_title,
			description:_desc,
			owner:msg.sender,
			minAmountUSD:_minAmountUSD,
			expirationDate:now + _daystilComplete * 86400,
			trbBalance:0,
			open:true,
			passed:false
		});
		idToOpenIndex[_id] = openProposals.length;
		openProposals.push(_id);
		Statement memory thisStatement= Statement({
        	id:_id,
        	amount:0
        });
        addressToStatements[msg.sender].push(thisStatement);//what is the statememt???


	emit NewProposal(_id,_title,_desc,_minAmountUSD,_daystilComplete);
	}

    /*
    * @dev Funds a specified proposoal
    * @param _id is the proposal Id
    * @param _amountTRB amount of TRB to fund 
    */
	function fund(uint _id, uint _amountTRB) external {
		require(_amountTRB > 0);
		Proposal storage thisProp = idToProposal[_id];
		require(thisProp.open);
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
        require(_tellor.transferFrom(msg.sender,address(this),_amountTRB), "Funding Failed");
        Statement memory thisStatement= Statement({
        	id:_id,
        	amount:_amountTRB
        	});
        addressToStatements[msg.sender].push(thisStatement);
        thisProp.trbBalance += _amountTRB;

        Funder memory thisFunder = Funder({
        	funder:msg.sender,
        	amount:_amountTRB
        });
        idToFunders[_id].push(thisFunder);
        emit ProposalFunded(_id,msg.sender,_amountTRB);

	}

    /*
    * @dev Closes the specified proposal
    * @param _id is the proposal id
    */
	function closeProposal(uint _id) external{
		Proposal storage thisProp = idToProposal[_id];
		require(thisProp.open);
		require(_id > 0);
		require(now > thisProp.expirationDate);
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
		if(percentFunded(_id) >= 100){
			thisProp.passed = true;
			_tellor.transfer(thisProp.owner,thisProp.trbBalance);
		}
		else{
			Funder[] storage theseFunders = idToFunders[_id];
			for(uint i=0;i < theseFunders.length;i++){
				availableForWithdraw[theseFunders[i].funder] += theseFunders[i].amount; 
			}
		}
		uint _index = idToOpenIndex[_id];
		if(_index == openProposals.length - 1){
			openProposals.length--;
		}
		else{
			uint _lastId = openProposals[openProposals.length - 1];
			openProposals[_index] = _lastId;
			idToOpenIndex[_lastId] = _index;
			openProposals.length--;
			idToOpenIndex[_id] = 0;
		}
		thisProp.open = false;
		emit ProposalClosed(_id,thisProp.passed,thisProp.trbBalance);
		thisProp.trbBalance = 0;
	}

    /*
    * @dev Allows funders to withdraw their funds
    */
 	function withdrawMoney() external{
 		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
 		uint _amt = availableForWithdraw[msg.sender];
 		availableForWithdraw[msg.sender] =0;
		_tellor.transfer(msg.sender,_amt);
 	}

    /*
    * @dev Getter function for all open proposals
    */
	function getAllOpenProposals() external view returns(uint[] memory){
		return openProposals;
	}

    /*
    * @dev Getter function for
    * @param _user is the funder address 
    */
	function getAvailableForWithdraw(address _user) external returns(uint){
		return availableForWithdraw[_user];
	}

    /*
    * @dev Getter funciton for the proposal information by the id
    * @param _id is the proposal id 
    */
	function getProposalById(uint _id) external view returns(string memory,string memory,address,uint,uint,uint,bool,bool,uint){
		Proposal memory t = idToProposal[_id];
		return (t.title,t.description,t.owner,t.minAmountUSD,t.expirationDate,t.trbBalance,t.open,t.passed,100 * (t.trbBalance* viewTellorPrice()/1e18) / t.minAmountUSD);
	}

    /*
    * @dev Getter function for all proposals funded by the specified address
    * @param _funder is the funder address to look up
    */
	function getProposalsByAddress(address _funder) public view returns(uint[] memory propArray,uint[] memory amountArray){
		Statement[] memory theseStatements = addressToStatements[_funder];
		propArray = new uint[](theseStatements.length);
		amountArray = new uint[](theseStatements.length);
		for(uint i=0;i < theseStatements.length;i++){
			propArray[i] = theseStatements[i].id;
			amountArray[i]= theseStatements[i].amount;
		}
		return (propArray,amountArray);
	}

    /*
    * @dev Getter function for funder address by proposal id 
    * @param _id is the proposal id
    */
	function getAddressesById(uint _id) public view returns(address[] memory addArray){
			Funder[] memory theseFunders = idToFunders[_id];
			addArray = new address[](theseFunders.length);
			for(uint i=0;i < theseFunders.length;i++){
				addArray[i] = theseFunders[i].funder;
			}
	}

    /*
    * @dev Gets the percent funded for the specified proposal
    * @param _id is the proposal id
    */
	function percentFunded(uint _id) public view returns(uint){
			Proposal memory thisProp = idToProposal[_id];
			return  100 * (thisProp.trbBalance* viewTellorPrice()/1e18) / thisProp.minAmountUSD ;
	}

    /*
    * @dev Gets Tellor's Price for the request ID specified in the constructor
    */
	function viewTellorPrice() public view returns(uint){
		bool _didget;
		uint _value;
		uint _timestamp;
		(_didget,_value,_timestamp) = getCurrentValue(tellorPriceID);
		if(!_didget){
			return 0;
		}
		else if(_timestamp > now - 60 minutes){
			for(uint i=120;i< 2400;i++){
				(_didget,_value,_timestamp) = getAnyDataAfter(tellorPriceID,now - i * 60);
				if(_didget && _timestamp < now - 60 minutes){
					i = 2400;
				}
				else if(!_didget){
					return 0;
				}
			}

		}
		return _value/granularity;
	}
    /*
    * @dev Getter for proposal count
    */
	function getProposalCount() public view returns(uint){
		return proposalCount -1;
	}

    /*
    * @dev Getter function for Tellor's address
    */
	function tellorAddress() public view returns(address){
		return tellorUserContract.tellorStorageAddress();
	}
}
