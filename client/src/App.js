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

const contractAddress ="0x7d67E614d92b9D070839954dfd82ceEc7daFDAeD";
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

      const availableBalance = web3.utils.fromWei(await instance.methods.getAvailableForWithdraw(accounts[0]).call());
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

    handleChange(e,target) {
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
    this.state.contract.methods.withdrawMoney().send({
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
        <div className="HeaderContainer">
          <div className="Header">
            <div className="innerHeader">
               <h1 className="HText">
               <img className="Swoosh" src="./SwooshBlack@2x.png" alt="TellorSwoosh"></img> 
               tellor.fund
               </h1>
            </div>
          </div>
        </div>
        <div className="PriceContainer">
          <div className ="Price">
            <h3> trb price : ${this.state.price} </h3>
          </div>
        </div>
        <div className="OpenTableContainer">
          <div className="OpenTable">
          <div className="inner">
              {this.state.openTable}
            </div>
          </div>
        </div>
        <div className="FormContainer">
            <div className="ButtonContainer">
              <div className="Button">
                <button onClick={this.handleFundSubmit}>fund</button>
                  <input type="number" placeholder="Proposal ID" name="fundID" onChange={this.handleChange}/>
                  <input type="number" placeholder="Amount TRB" name="fundAmount" onChange={this.handleChange}/>
              </div>
              <div className="Button">
                <button onClick={this.handleCreateSubmit}>new</button>
                <input type="text" name="title" placeholder="Title" onChange={this.handleChange}/>
                <input type="text"name="desc" placeholder="Description" onChange={this.handleChange} />
                <input type="number" name="minAmountUSD" placeholder="Min USD" onChange={this.handleChange} />
                <input type="number" name="daystilComplete" placeholder="Days Open" onChange={this.handleChange} />
              </div>
              <div className="Button">
                  <button onClick={this.handleCloseSubmit}>close</button>
                  <input type="number" name="closeID" placeholder="Proposal ID" onChange={this.handleChange}/>
              </div>
              <div className="Button"> 
                  <p><button onClick={this.handleWithdrawSubmit}>withdraw</button> {'\u00A0'} {this.state.availableBalance} TRB</p>
              </div>
              </div>
          </div>
        <div className="OpenTableContainer">
            <div className="MyTable">
              <div className="inner">
              {this.state.myTable}
            </div>
          </div>
        </div>
        <div className="SocialContainer">
          <div className="Social">
            <a href="https://twitter.com/wearetellor">
              <TwitterIcon size={32} round={true} />
            </a>
            <a href="https://t.me/tellorchannel">
              <TelegramIcon size={32} round={true} />
            </a>
            <a href="malito:info@tellor.io">
              <EmailIcon size={32} round={true} />
            </a>
        </div>
       </div>
    </div>
    );
  }
}

export default App;
