import React, { Component } from 'react';
import Utils from '@pegasus/lib/utils';


class Transactions extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            transactions: []
        };
    }

    componentDidMount() {
        this.updateData();
    }

    /* async updateData(){

        //get all txs
        console.log(this.props.addresses);
        const txs = await getAllTransactions(this.props.addresses);
        console.log("txxx");
        console.log(txs);

        //separate txs in base of their bundle
        // per check txs basta che almeno una tx all'interno di un bundle sia confirmed
        let obj = {};
        txs.forEach((tx,index) => {
            obj[tx.bundle] = txs.filter( item => item.bundle === tx.bundle);
        })
        console.log(obj);

        //prepare hashed
        const hashes = Array.from(txs , tx => tx.hash );

        //set the status
        const states = await getLatestInclusion(hashes);
        txs.forEach ( (tx , index) => tx['confirmed'] = states[index]);
        this.setState({transactions : txs});

    }*/

    async updateData() {
        const arr = [];
        const doubleBundle = [];
        this.setState({ transactions: [] });
        this.props.transfers.forEach(transfer => {
            //https://domschiener.gitbooks.io/iota-guide/content/chapter1/bundles.html
            //da gestire le meta tx

            if ( transfer.length === 0 )
                return;

            let value;
            if ( transfer[ 0 ].value < 0 ) { //RECEIVED
                value = -(transfer[ 0 ].value + transfer[ 3 ].value);
            }else{ //SENT
                value = -transfer[ 0 ].value;
            }

            const obj = {
                timestamp: transfer[ 0 ].attachmentTimestamp,
                value,
                status: transfer[ 0 ].persistence,
                bundle: transfer[ 0 ].bundle,
                index: transfer[ 0 ].currentIndex,
                transfer
            };

            //remove double bundle (reattachemen txs)
            //arr = arr.filter ( item => item.bundle != obj.bundle );
            //in questo modo prendo la prima transazione con stesso bundle
            //cosi da escludere le reattachment transaction
            let add = true;
            for ( const tx of doubleBundle )
            { if ( tx.bundle === obj.bundle )
                add = false; }
            if ( add ) {
                arr.push(obj);
                doubleBundle.push(obj);
            }
        });
        this.setState({ transactions: arr });
    }

    render() {
        return (
            <div className="container">
                <div className='row'>
                    <div className='col-6 text-left text-black text-gray text-xs'>History</div>
                    <div className='col-6 text-right'>
                        <button onClick={() => this.props.onReload()} className='btn btn-icon-inverted'><i className='fa fa-refresh' ></i></button>
                    </div>
                </div>
                <hr/>
                <div className='transaction-list'>
                    {this.state.transactions.length > 0 ? this.state.transactions.map((transaction, index) => {
                        return (
                            <div key={index} onClick={() => this.props.onGoDetails(transaction.transfer)} className='transaction-list-item' >
                                <div className='row'>
                                    <div className='col-3 text-left'>
                                        <div className='transaction-date'>{Utils.timestampToDate(transaction.timestamp)}</div>
                                    </div>
                                    <div className='col-3 text-center'>
                                        <div className='transaction-list-item-action'>{transaction.value > 0 ? 'received ' : 'sent'}</div>
                                    </div>
                                    <div className='col-3 text-center'>
                                        <div className={transaction.status ? 'transaction-list-item-status-confirmed' : 'transaction-list-item-status-not-confirmed'} >{transaction.status ? 'confirmed ' : 'pending'}</div>
                                    </div>
                                    <div className='col-3 text-right'>
                                        <div className='transaction-list-item-value'>
                                            { Utils.iotaReducer(transaction.value) }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) :
                        
                    <div className='row mt-9'>
                        <div className='col-12 text-center text-xs  text-black'>
                            No Transactions
                        </div>
                    </div>
                    }
                </div>
            </div>
        );
    }
}

export default Transactions;