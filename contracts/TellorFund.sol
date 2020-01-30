pragma solidity >=0.4.21;

contract TellorFund is UsingTellor{

	uint proposalCount;
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

    constructor(address _userContract) public UsingTellor(_userContract){
    	proposalCount + 1;
    	openProposals.length++;
    }


    //be sure to approve first
	function createProposal(string _title, string _desc,uint _minAmountUSD, uint _daystilComplete) public returns(uint _id){
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
        require(_tellor.transferFrom(msg.sender,address(0),1e18), "Virgin Sacrifice Failed");
		require(Tellor.transfer(1 TRB, 0 address));
		require(_daystilComplete < 30);
		_id = proposalCount;
		proposalCount++;
		idToProsal[_id] = Proposal({
			title:_title,
			description:_desc,
			owner:msg.sender,
			minAmountUSD:_minAmountUSD,
			expirationDate:now + _daystilComplete * 86400,
			open:true,
			passed:false
		});
		openProposals.push(_id);

	}

	function fund(uint _id, uint _amountTRB){
		require(_amountTRB > 0);
		Proposal thisProp = idToProposal[_id];
		require(thisProp.open);
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
        require(_tellor.transferFrom(msg.sender,address(this),_amountTRB), "Funding Failed");
        Statement thisStatement=addressToStatements[msg.sender];
        thisStatement[id] = _id;
        thisStatement[amount] = thisStatement[amount] + _amountTRB;
        thisProp.trbBalance += _amountTRB;

        Funder thisFunder = Funder({
        	address:msg.sender,
        	amount:_amountTRB
        });
        idToFunders[_id].push(thisFunder);
        emit ProposalFunded(_id,msg.sender,_amountTRB);

	}

	function closeProposal(uint _id) external{
		Proposal thisProp = idToProposal[_id];
		require(thisProp.open);
		require(now > expirationDate);

		if(percentFunded(_id) > 100){
			thisProp.passed = true;
			_tellor.transfer(thisProp.owner,thisProp.trbBalance);
		}
		else{
			Funders[] theseFunders = idToFunders[_id];
			for(uint i=0;i < theseFunders.length;i++){
				availableForWithdraw[theseFunders.funder] += theseFunders.amount; 
			}
		}
		uint _index = idToOpenIndex[_id];
		if(_index == openProposals.length - 1;){
			openProposals.length--;
		}
		else{
			uint _lastID = openProposals[openProposals.length - 1];
			openProposals[_index] = _lastId;
			idToOpenIndex[_lastId] = _index;
			openProposals.length--;
			idToOpenIndex[_id] = 0;
		}
		thisProp.open = false;
		emit ProposalClosed(_id,thisProp.passed,thisProp.trbBalance)
		thisProp.trbBalance = 0;
	}

 	function withdrawMoney() external{
 		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
 		uint _amt = availableForWithdraw[msg.sender];
 		availableForWithdraw[msg.sender] =0;
		_tellor.transfer(msg.sender,_amt);
 	}

	function getAllOpenProposals() external view returns(uint[]){
		return openProposals;
	}

	function getProposalById(uint _id) external view returns(string,string,uint,uint,bool,bool){
		Proposals t = idToProposal[_id];
		return (t.title,t.description,t.owner,t.minAmountUSD,t.expirationDate,t.trbBalance,t.open,t.passed)
	}


	function getProposalsByAddress(address _funder) public view returns(uint[] propArray,uint[] amountArray){
		Statement[] theseStatements = addressToStatements[_funder];
		for(uint i=0;i < theseStatements.length;i++){
			propArray.push(theseStatements.id);
			amountArray.push(thisStatements.amount);
		}
	}

	function getAddressesById(uint _id) public view returns(address[] addArray){
			Funders[] theseFunders = idToFunders[_id];
			for(uint i=0;i < theseFunders.length;i++){
				addArray.push(theseFunders.funder);
			}
	}

	function percentFunded(uint _id) public view returns(uint){
			return thisProp.minAmountUSD * 100 / (thisProp.trbBalance* viewTellorPrice()/1e18);
	}

	function viewTellorPrice() public view returns(uint){
		bool _didget;
		uint _value;
		uint _timestamp;
		(_didget,_value,_timestamp) = getAnyDataAfter(50,now - 60 minutes);
	}

}
