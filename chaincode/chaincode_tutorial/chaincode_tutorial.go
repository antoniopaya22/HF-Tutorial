/*
 * Smart Contract de ejemplo para HF Tutorial
 *
 * Autor: Antonio Paya Gonzalez
 */

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define la estructura del SmartContract
type SmartContract struct {
}

// Define la estructura de Laptop
type Laptop struct {
	Marca       string `json:"marca"`
	Modelo      string `json:"modelo"`
	Color       string `json:"color"`
	Propietario string `json:"propietario"`
}

/*
 * El metodo Init se llama cuando el Smart Contract se instancia por la red blockchain
 */
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
 * El metodo Invoke se llama como resultado de ejecutar el Smart Contract
 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
	function, args := APIstub.GetFunctionAndParameters()

	if function == "queryLaptop" {
		return s.queryLaptop(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "createLaptop" {
		return s.createLaptop(APIstub, args)
	} else if function == "queryAllLaptops" {
		return s.queryAllLaptops(APIstub)
	} else if function == "cambiarPropietarioLaptop" {
		return s.cambiarPropietarioLaptop(APIstub, args)
	}

	return shim.Error("Nombre de funcion del SmartContract invalido o inexistente.")
}

func (s *SmartContract) queryLaptop(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Numero incorrecto de argumentos, se esperaba 1")
	}

	laptopAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(laptopAsBytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	laptops := []Laptop{
		Laptop{Marca: "HP", Modelo: "Omen", Color: "black", Propietario: "Microsoft"},
		Laptop{Marca: "Acer", Modelo: "Aspire", Color: "black", Propietario: "Microsoft"},
		Laptop{Marca: "Asus", Modelo: "N551J", Color: "silver", Propietario: "Apple"},
		Laptop{Marca: "Lenovo", Modelo: "80XL", Color: "white", Propietario: "Apple"},
	}

	i := 0
	for i < len(laptops) {
		fmt.Println("i is ", i)
		laptopAsBytes, _ := json.Marshal(laptops[i])
		APIstub.PutState("LAP"+strconv.Itoa(i), laptopAsBytes)
		fmt.Println("Added", laptops[i])
		i = i + 1
	}

	return shim.Success(nil)
}

func (s *SmartContract) createLaptop(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 5 {
		return shim.Error("Numero incorrecto de argumentos, se esperaban 5")
	}

	var laptop = Laptop{Marca: args[1], Modelo: args[2], Color: args[3], Propietario: args[4]}

	laptopAsBytes, _ := json.Marshal(laptop)
	APIstub.PutState(args[0], laptopAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) queryAllLaptops(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "LAP0"
	endKey := "LAP999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer es un array JSON con los resultados de la consulta
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Guardarlo como un objeto JSON
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllLaptops:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) cambiarPropietarioLaptop(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Numero incorrecto de argumentos, se esperaban 2")
	}

	laptopAsBytes, _ := APIstub.GetState(args[0])
	laptop := Laptop{}

	json.Unmarshal(laptopAsBytes, &laptop)
	laptop.Propietario = args[1]

	laptopAsBytes, _ = json.Marshal(laptop)
	APIstub.PutState(args[0], laptopAsBytes)

	return shim.Success(nil)
}

// Esta funcion solo es relevante para pruebas unitarias.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error al crear el Smart Contract: %s", err)
	}
}
