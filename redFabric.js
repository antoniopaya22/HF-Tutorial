'use strict';
var fabricClient = require('./config/FabricClient');

class RedFabric {

  constructor(userName) {
    this.currentUser;
    this.issuer;
    this.userName = userName;
    this.connection = fabricClient;
  }

  init() {
    var isAdmin = false;
    if (this.userName == "admin") {
      isAdmin = true;
    }
    return this.connection.initCredentialStores().then(() => {
      return this.connection.getUserContext(this.userName, true)
    }).then((user) => {
      this.issuer = user;
      if (isAdmin) {
        return user;
      }
      return this.ping();
    }).then((user) => {
      this.currentUser = user;
      return user;
    })
  }

   queryAllLaptops() {
    var tx_id = this.connection.newTransactionID();
    var requestData = {
      chaincodeId: 'mycontract',
      fcn: 'queryAllLaptops',
      args: [],
      txId: tx_id
    };
    var channel = this.connection.getChannel();
    return channel.queryByChaincode(requestData);
  }
}

module.exports = RedFabric;