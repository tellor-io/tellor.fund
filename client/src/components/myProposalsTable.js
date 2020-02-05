import BootstrapTable from 'react-bootstrap-table-next';
import React, { Component }  from 'react';

const myProposalsTable = () =>
  new Promise((resolve, reject) => {
      // Modern dapp browsers...
		const products =  [
      {
        id: 1,
        name: 'TV',
        'price': 1000
      },
      {
        id: 2,
        name: 'Mobile',
        'price': 500
      },
      {
        id: 3,
        name: 'Book',
        'price': 20
      },
    ];
		const columns = [{
      dataField: 'id',
		      text: 'My IDs',
          sort: true
		    },
		    {
		      dataField: 'title',
		      text: 'title'
		    },
        {
          dataField: 'amount',
          text: 'my funds'
        }, {
		      dataField: 'funded',
		      text: '% funded'
		    }];
		resolve(<BootstrapTable keyField='id' data={ products } columns={ columns } />)
  });






export default myProposalsTable
 