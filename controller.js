
var Fabric_Client = require('fabric-client');
var path          = require('path');
var os            = require('os');

module.exports = (function() {
return{
	get_all_laptops: function(req, res){
		var fabric_client = new Fabric_Client();

		var channel = fabric_client.newChannel('laptopschannel');
		var peer = fabric_client.newPeer('grpc://localhost:7051');
		channel.addPeer(peer);

		var member_user = null;
		var store_path = path.join(os.homedir(), '.hfc-key-store');
		var tx_id = null;

		Fabric_Client.newDefaultKeyValueStore({ path: store_path
		}).then((state_store) => {
		    fabric_client.setStateStore(state_store);
		    var crypto_suite = Fabric_Client.newCryptoSuite();
		    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		    crypto_suite.setCryptoKeyStore(crypto_store);
		    fabric_client.setCryptoSuite(crypto_suite);

		    return fabric_client.getUserContext('user1', true);
		}).then((user_from_store) => {
		    if (user_from_store && user_from_store.isEnrolled()) {
		        console.log('Successfully loaded user1 from persistence');
		        member_user = user_from_store;
		    } else {
		        throw new Error('Failed to get user1.... run registerUser.js');
		    }

		    // queryAllLaptops - sin argumentos , ex: args: [''],
		    const request = {
		        chaincodeId: 'mycontract',
		        txId: tx_id,
		        fcn: 'queryAllLaptops',
		        args: ['']
            };
            
		    return channel.queryByChaincode(request);
		}).then((query_responses) => {
		    // Consulta completada: Comprobando resultados:
		    if (query_responses && query_responses.length == 1) {
		        if (query_responses[0] instanceof Error) {
		            console.error("error from query = ", query_responses[0]);
		        } else {
		            console.log("Response is ", query_responses[0].toString());
		            res.json(JSON.parse(query_responses[0].toString()));
		        }
		    } else {
		        console.log("No payloads were returned from query");
		    }
		}).catch((err) => {
		    console.error('Failed to query successfully :: ' + err);
		});
	},
}
})();