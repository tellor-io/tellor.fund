import React, { Component } from "react";
import TellorFund from "./contracts/TellorFund.json";
import Tellor from "./contracts/Tellor.json";
import getWeb3 from "./getWeb3";
import {openProposalsTable} from "./components/openProposalsTable"
import myProposalsTable from "./components/myProposalsTable"
import "./App.css";
import {
  EmailIcon,
  TelegramIcon,
  TwitterIcon
} from "react-share";

const contractAddress ="0x3d3921A50ba6431bdf866515D92d2F8C99D44Dad";
console.log(contractAddress);


class App extends Component {


  state = { web3: null,
            accounts: null,
            contract: null,
            openTable: null,
            myTable: null, 
            price: 0,
            contractAddress:contractAddress,
            tellorAddress:"",
            tellorInstance:null,
            availableBalance: 0,
            title:"",
            desc:"",
            fundID:0,
            fundAmount:0,
            closeID:0,
            minAmountUSD:0,
            daystilComplete:0 };


  componentDidMount = async () => {
    this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
    this.handleCloseSubmit = this.handleCloseSubmit.bind(this);
    this.handleWithdrawSubmit = this.handleWithdrawSubmit.bind(this);
    this.handleFundSubmit = this.handleFundSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const instance = await new web3.eth.Contract(TellorFund.abi,this.state.contractAddress);
      console.log(instance.methods)

      const availableBalance = await instance.methods.getAvailableForWithdraw(accounts[0]).call();
      console.log("made it to here2")
      const price = await instance.methods.viewTellorPrice().call();
      const tellorAddress = await instance.methods.tellorAddress().call()
      console.log(tellorAddress)
      const tellorInstance = await new web3.eth.Contract(Tellor.abi,tellorAddress);
      console.log("made it to here")

      const openTable = await openProposalsTable(instance);
      const myTable = await myProposalsTable(instance,accounts[0]);

      // Update state with the result.;
      await this.setState({web3,accounts,openTable,myTable,availableBalance,price,tellorAddress,tellorInstance,contract:instance})
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }

  };

  // handleChange(event) {
  //   console.log(event.target)
  //   this.setState({value: event.target.value});
  // }

    handleChange(e) {
    // If you are using babel, you can use ES 6 dictionary syntax
    // let change = { [e.target.name] = e.target.value }
    let change = {}
    change[e.target.name] = e.target.value
    console.log("changing",e.target)
    this.setState(change)
  }
  handleCloseSubmit(event) {
    this.state.contract.methods.closeProposal(this.state.closeID).send({
          from: this.state.accounts[0],
          to: contractAddress,
          value:0,
          gasPrice: '20000000000' 
        }).then(function(res){
          console.log("response: ", res)
    });
  }
  handleWithdrawSubmit(event) {
    this.state.contract.methods.withdrawMoney(this.state.availableBalance).send({
          from: this.state.accounts[0],
          to: contractAddress,
          value:0,
          gasPrice: '20000000000' 
        }).then(function(res){
          console.log("response: ", res)
    });
  }
  handleFundSubmit(event) {
   this.state.tellorInstance.methods.approve(contractAddress,this.state.web3.utils.toWei(this.state.fundAmount)).send({
          from: this.state.accounts[0],
          to:this.state.tellorInstance._address,
          value:0,
          gasPrice: '20000000000' 
   }).once('receipt', (receipt) =>{
      console.log("approved",receipt)
      console.log("funding",this.state.fundID,this.state.fundAmount)
      this.state.contract.methods.fund(this.state.fundID,this.state.web3.utils.toWei(this.state.fundAmount)).send({
          from: this.state.accounts[0],
          to: contractAddress,
          value:0,
          gasPrice: '20000000000' 
        }).then(function(res){
          console.log("response: ", res)
      });
    })
  }

  handleCreateSubmit(event) {
   console.log(this.state.title,this.state.desc,this.state.minAmountUSD,this.state.daystilComplete)
   console.log(this.state.tellorInstance._address)
   console.log(this.state.tellorInstance)
   this.state.tellorInstance.methods.approve(contractAddress,this.state.web3.utils.toWei("1")).send({
          from: this.state.accounts[0],
          to:this.state.tellorInstance._address,
          value:0,
          gasPrice: '20000000000' 
   }).once('receipt', (receipt) =>{
      console.log("approved",receipt)
      this.state.contract.methods.createProposal(this.state.title,this.state.desc,this.state.minAmountUSD,this.state.daystilComplete).send({
          from: this.state.accounts[0],
          to: contractAddress,
          value:0,
          gasPrice: '20000000000' 
        }).then(function(res){
          console.log("response: ", res)
      });
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading tellor.fund</div>;
    }
    return (
      <div className="App">
        <div className="Header">
          <h1>tellor.fund</h1>
        </div>

        <div className ="Price">
          <h3> tellor Price : ${this.state.price} </h3>
        </div>

        <div className="OpenTable">
          {this.state.openTable}
        </div>

        <div className="ButtonContainer">
          <div className="Button">
            <button onClick={this.handleFundSubmit}>Fund</button>
              <label>
                Proposal ID:
                <input type="number" name="fundID" value={this.state.fundID} onChange={this.handleChange}/>
             </label> 
                           <label>
                Amount TRB:
                <input type="number" name="fundAmount" value={this.state.fundAmount} onChange={this.handleChange}/>
             </label> 
          </div>
          <div className="Button">
            <button onClick={this.handleCreateSubmit}>New Proposal</button>
              <label>
                  Title:
                  <input type="text" name="title" value={this.state.title} onChange={this.handleChange}/>
               </label>           
               <label>
                  Description:
                  <input type="text"name="desc" value={this.state.desc} onChange={this.handleChange} />
               </label>
               <label>
                    Min Amount USD:
                  <input type="number" name="minAmountUSD" value={this.state.minAmountUSD} onChange={this.handleChange} />
               </label>
               <label>
                  Days Open:
                  <input type="number" name="daystilComplete" value={this.state.daystilComplete} onChange={this.handleChange} />
               </label>
            </div>
            <div className="Button">
              <button onClick={this.handleCloseSubmit}> Close Proposal</button>
                <label>
                  Proposal ID:
                  <input type="number" name="closeID" value={this.state.closeID} onChange={this.handleChange}/>
                </label> 
            </div>
            <div className="Button"> 
              <p><button onClick={this.handleWithdrawSubmit}>Withdraw</button> {this.state.availableBalance} TRB</p>
            </div>
        </div>

        <div className="MyTable">
          {this.state.myTable}
        </div>

        <div className="Social">
          <TwitterIcon size={32} round={true} />
          <TelegramIcon size={32} round={true} />
          <EmailIcon size={32} round={true} />
      </div>
    </div>
    );
  }
}

export default App;
