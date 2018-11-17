var FabricClient = require('fabric-client');
var fs = require('fs');
var path = require('path');
var util = require('util');
var tx_id = null;

var configFilePath = path.join(__dirname, './ConnectionProfile.yml');
const CONFIG = fs.readFileSync(configFilePath, 'utf8')

class FBClient extends FabricClient {
    constructor(props) {
        super(props);
    }

    submitTransaction(requestData,txid) {
        var _this = this;
        var channel = this.getChannel();
        var peer = this.getPeersForOrg()[0];
        tx_id = txid;
        return channel.sendTransactionProposal(requestData).then(function (results) {
            var proposalResponses = results[0];
	        var proposal = results[1];
	        let isProposalGood = false;
	        if (proposalResponses && proposalResponses[0].response &&
		        proposalResponses[0].response.status === 200) {
			    isProposalGood = true;
			    console.log('Transaction proposal was good');
		    } else {
			    console.error('Transaction proposal was bad');
            }

            if (isProposalGood) {
                console.log(util.format(
                    'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
                    proposalResponses[0].response.status, proposalResponses[0].response.message));

                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal
                };
        
                var transaction_id_string = tx_id.getTransactionID();
                var promises = [];
        
                var sendPromise = channel.sendTransaction(request);
                promises.push(sendPromise);
        
                let event_hub = channel.newChannelEventHub(peer);
        
                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        event_hub.unregisterTxEvent(transaction_id_string);
                        event_hub.disconnect();
                        resolve({event_status : 'TIMEOUT'});
                    }, 3000);
                    console.log(transaction_id_string)
                    event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                        clearTimeout(handle);

                        var return_status = {event_status : code, tx_id : transaction_id_string};
                        if (code !== 'VALID') {
                            console.error('The transaction was invalid, code = ' + code);
                            resolve(return_status);
                        } else {
                            console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
                            resolve(return_status);
                        }
                    }, (err) => {
                        reject(new Error('There was a problem with the eventhub ::'+err));
                    },
                        {disconnect: true}
                    );
                    event_hub.connect();
        
                });
                promises.push(txPromise);
        
                return Promise.all(promises);
            } else {
                console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
            }

        }).then((results) => {
            console.log('Send transaction promise and event listener promise have completed');
            if (results && results[0] && results[0].status === 'SUCCESS') {
                console.log('Successfully sent transaction to the orderer.');
            } else {
                console.error('Failed to order the transaction. Error code: ' + response.status);
            }

            if (results && results[1] && results[1].event_status === 'VALID') {
                console.log('Successfully committed the change to the ledger by the peer');
            } else {
                console.log('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
            }
        }).then(function () {
            return {"trans_id":tx_id["_transaction_id"]};
        })
    }

    query(requestData) {
        var channel = this.getChannel();
        return channel.queryByChaincode(requestData).then((response_payloads) => {
            var resultData = JSON.parse(response_payloads.toString('utf8'));
            return resultData;
        }).then(function(resultData) {
            if (resultData.constructor === Array) {
                resultData = resultData.map(function (item, index) {
                    if (item.data) {
                        return item.data
                    } else {
                        return item;
                    }
                })
            }
            
            return resultData;
        });
    }
}

var fabricClient = new FBClient();
fabricClient.loadFromConfig(configFilePath);

module.exports = fabricClient;