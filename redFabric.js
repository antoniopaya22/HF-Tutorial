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
    return this.connection.query(requestData);
  }

  queryLaptop(id) {
    var tx_id = this.connection.newTransactionID();
    var requestData = {
      chaincodeId: 'mycontract',
      fcn: 'queryLaptop',
      args: [id],
      txId: tx_id
    };
    return this.connection.query(requestData);
  }

  deleteLaptop(id) {
    var tx_id = this.connection.newTransactionID();
    var requestData = {
      chaincodeId: 'mycontract',
      fcn: 'deleteLaptop',
      args: [id],
      txId: tx_id
    };
    return this.connection.submitTransaction(requestData,tx_id);
  }

  add_laptop(laptop) {
    var tx_id = this.connection.newTransactionID();
    var requestData = {
      chaincodeId: 'mycontract',
      fcn: 'createLaptop',
      args: [laptop.id,laptop.marca,laptop.modelo,laptop.color,laptop.propietario],
      txId: tx_id
    };
    return this.connection.submitTransaction(requestData,tx_id);
  }
}

module.exports = RedFabric;