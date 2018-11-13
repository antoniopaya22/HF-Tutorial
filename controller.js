
var Fabric_Client = require('./config/FabricClient');
var path          = require('path');
var os            = require('os');


module.exports = (function() {
return{
	get_all_laptops: function(req, res){
		var fabric_client = Fabric_Client;
		var fabric_ca_client = fabric_client.getCertificateAuthority();

		var member_user = null;
		var store_path = path.join(os.homedir(), '.hfc-key-store');
		var tx_id = null;

		fabric_client.initCredentialStores().then(() => {
			fabric_ca_client = fabric_client.getCertificateAuthority();
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