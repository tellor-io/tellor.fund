pragma solidity >=0.4.21;
import "usingtellor/contracts/UsingTellor.sol";


contract TellorFund is UsingTellor{

	uint private proposalCount;
	uint public tellorPriceID;
	uint public granularity;
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
	mapping(address => Statement[]) addressToStatements;
	mapping(uint => uint) idToOpenIndex;
	mapping(address => uint) availableForWithdraw;

	event NewProposal(uint _id,string _title,string _desc,uint _minAmountUSD,uint _daystilComplete);
	event ProposalFunded(uint _id, address _funder, uint _amount);
	event ProposalClosed(uint _id, bool _funded, uint _amount);

    constructor(address _userContract, uint _tellorPriceID, uint _granularity) public UsingTellor(_userContract){
    	proposalCount = 1;
    	tellorPriceID = _tellorPriceID;
    	granularity = _granularity;
    	openProposals.length++;
    }


    //be sure to approve first
	function createProposal(string calldata _title, string calldata _desc,uint _minAmountUSD, uint _daystilComplete) external returns(uint _id){
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
        require(_tellor.transferFrom(msg.sender,address(this),1e18), "Virgin Sacrifice Failed");
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


	emit NewProposal(_id,_title,_desc,_minAmountUSD,_daystilComplete);
	}

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

 	function withdrawMoney() external{
 		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
 		uint _amt = availableForWithdraw[msg.sender];
 		availableForWithdraw[msg.sender] =0;
		_tellor.transfer(msg.sender,_amt);
 	}

	function getAllOpenProposals() external view returns(uint[] memory){
		return openProposals;
	}

	function getProposalById(uint _id) external view returns(string memory,string memory,address,uint,uint,uint,bool,bool){
		Proposal memory t = idToProposal[_id];
		return (t.title,t.description,t.owner,t.minAmountUSD,t.expirationDate,t.trbBalance,t.open,t.passed);
	}


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

	function getAddressesById(uint _id) public view returns(address[] memory addArray){
			Funder[] memory theseFunders = idToFunders[_id];
			addArray = new address[](theseFunders.length);
			for(uint i=0;i < theseFunders.length;i++){
				addArray[i] = theseFunders[i].funder;
			}
	}

	function percentFunded(uint _id) public view returns(uint){
			Proposal memory thisProp = idToProposal[_id];
			return  100 * (thisProp.trbBalance* viewTellorPrice()/1e18) / thisProp.minAmountUSD ;
	}

	function viewTellorPrice() public view returns(uint){
		bool _didget;
		uint _value;
		uint _timestamp;
		(_didget,_value,_timestamp) = getCurrentValue(tellorPriceID);
		if(_timestamp > now - 60 minutes){
			for(uint i=120;i< 2400;i++){
				(_didget,_value,_timestamp) = getAnyDataAfter(tellorPriceID,now - i * 60);
				if(_didget && _timestamp < now - 60 minutes){
					i = 2400;
				}
			}

		}
		return _value/granularity;
	}

	function getProposalCount() public view returns(uint){
		return proposalCount -1;
	}
}
