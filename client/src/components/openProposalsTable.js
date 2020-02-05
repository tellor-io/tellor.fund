import BootstrapTable from 'react-bootstrap-table-next';
import React, { Component }  from 'react';

const openProposalsTable = () =>
  new Promise((resolve, reject) => {
      // Modern dapp browsers...
		const products =  [
      {
        id: 1,
        title: 'AMA',
        details:"fund an AMA",
        amount:1000,
        funded:10,
        time: "01:22:35"
      },
      {
        id: 2,
        title: 'listing',
        details:"list Tellor",
        amount:1000,
        funded:10,
        time: "01:22:35"
      },
      {
        id: 4,
        title: 'Podcast',
        details:"have a podcast",
        amount:1000,
        funded:10,
        time: "01:22:35"
      },
    ];
		const columns = [{
      		  dataField: 'id',
		      text: '',
		      sort: true
		    },
		    {
		      dataField: 'title',
		      text: 'title'
		    }, 
		    {
		      dataField: 'details',
		      text: 'details'
		    },
		    {
		      dataField: 'amount',
		      text: 'amount'
		    },
		    		    {
		      dataField: 'funded',
		      text: '% funded'
		    },
		    {
		      dataField: 'time',
		      text: 'time left',

		    }];
		resolve(<BootstrapTable keyField='id' data={ products } columns={ columns } />)
  });






export default openProposalsTable
 