/**
 *  Chaincode del Tutorial
 * 
 *  autor: Antonio Paya
 */

'use strict';
const shim = require('fabric-shim');
const util = require('util');

var Chaincode = class {

  // El metodo Init se llama cuando el Smart Contract tutorial_antonio es instanciado por la red Blockchain
  async Init(stub) {
    console.info('=========== Chaincode tutorial_antonio instanciado ===========');
    return shim.success();
  }

  // El metodo Invoke se llama como resultado de una solicitud de aplicacion para ejecutar el Smart Contract
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('No se ha encontrado la funcion con nombre:' + ret.fcn);
      throw new Error('Se ha recibido una funcion ' + ret.fcn + ' desconocida');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }

  }

  async initLedger(stub, args) {
    console.info('============= START : Initializar Ledger ===========');
    let laptops = [];
    laptops.push({
      marca: 'HP',
      modelo: 'Omen',
      color: 'black',
      propietario: 'Microsoft'
    });
    laptops.push({
      marca: 'Acer',
      modelo: 'Aspire',
      color: 'black',
      propietario: 'Microsoft'
    });
    laptops.push({
      marca: 'Asus',
      modelo: 'N551J',
      color: 'white',
      propietario: 'Apple'
    });
    laptops.push({
      marca: 'Lenovo',
      modelo: '80XL',
      color: 'silver',
      propietario: 'Apple'
    });

    for (let i = 0; i < laptops.length; i++) {
      laptops[i].docType = 'laptop';
      await stub.putState('Laptop' + i, Buffer.from(JSON.stringify(cars[i])));
      console.info('Añadido <--> ', cars[i]);
    }
    console.info('============= END : Initializar Ledger ===========');
  }


  async queryLaptop(stub, args) {
    if (args.length != 1) {
      throw new Error('Numero incorrecto de argumentos. Se espera el idLaptop ex: LAP01');
    }
    let idLaptop = args[0];

    let laptopAsBytes = await stub.getState(idLaptop); //get the laptop from chaincode state
    if (!laptopAsBytes || laptopAsBytes.toString().length <= 0) {
      throw new Error(idLaptop + ' no existe: ');
    }
    console.log(laptopAsBytes.toString());
    return laptopAsBytes;
  }

  async addLaptop(stub, args) {
    console.info('============= START : Add Laptop ===========');
    if (args.length != 5) {
      throw new Error('Numero incorrecto de argumentos. Se esperan 5');
    }

    var laptop = {
      docType: 'laptop',
      marca: args[1],
      modelo: args[2],
      color: args[3],
      propietario: args[4]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(laptop)));
    console.info('============= END : Add Laptop ===========');
  }

  async queryAllLaptops(stub, args) {

    let startKey = 'LAP01';
    let endKey = 'LAP999';

    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }

  async cambiarPropietarioLaptop(stub, args) {
    console.info('============= START : cambiarPropietarioLaptop ===========');
    if (args.length != 2) {
      throw new Error('Numero incorrecto de argumentos. Se esperan 5');
    }

    let laptopAsBytes = await stub.getState(args[0]);
    let laptop = JSON.parse(laptopAsBytes);
    laptop.propietario = args[1];

    await stub.putState(args[0], Buffer.from(JSON.stringify(laptop)));
    console.info('============= END : cambiarPropietarioLaptop ===========');
  }
};

shim.start(new Chaincode());
