import React, { Component } from "react";
import TellorFund from "./contracts/TellorFund.json";
import getWeb3 from "./getWeb3";
import openProposalsTable from "./components/openProposalsTable"
import myProposalsTable from "./components/myProposalsTable"
import "./App.css";
import {
  EmailIcon,
  TelegramIcon,
  TwitterIcon
} from "react-share";

const contractAddress = process.env.REACT_APP_CONTRACT;
console.log(contractAddress);


class App extends Component {
  state = { web3: null,
            accounts: null,
            contract: null,
            openTable: null,
            myTable: null, 
            price: 0,
            availableBalance: 0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      const openTable = await openProposalsTable();
      const myTable = await myProposalsTable();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TellorFund.networks[networkId];
      const instance = new web3.eth.Contract(
        TellorFund.abi,
        deployedNetwork && contractAddress,
      );

     const availableBalance = await instance.methods.getAvailableForWithdraw(accounts[0]).call();

      const price = await instance.methods.viewTellorPrice().call();

      // Update state with the result.;
           await this.setState({web3,accounts,openTable,myTable,availableBalance,price,contract:instance})
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

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

        <div className="Buttons">
          <p><button>Fund</button></p>
          <p><button>New Proposal </button></p>
          <p><button> Close Proposal</button></p>
          <p><button> Withdraw</button> {this.state.availableBalance} TRB</p> 
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
