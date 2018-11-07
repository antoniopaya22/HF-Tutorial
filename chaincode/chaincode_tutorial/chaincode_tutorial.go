/*
 * The sample smart contract for documentation topic:
 * Writing Your First Blockchain Application
 */

package main

/* Imports
 * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
 * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
 */
import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

// Define the laptop structure, with 4 properties.  Structure tags are used by encoding/json library
type Laptop struct {
	Marca       string `json:"marca"`
	Modelo      string `json:"modelo"`
	Color       string `json:"color"`
	Propietario string `json:"propietario"`
}

/*
 * The Init method is called when the Smart Contract "fabcar" is instantiated by the blockchain network
 * Best practice is to have any Ledger initialization in separate function -- see initLedger()
 */
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
 * The Invoke method is called as a result of an application request to run the Smart Contract "fabcar"
 * The calling application program has also specified the particular smart contract function to be called, with arguments
 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
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

	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) queryLaptop(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
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
		APIstub.PutState("Laptop"+strconv.Itoa(i), laptopAsBytes)
		fmt.Println("Added", laptops[i])
		i = i + 1
	}

	return shim.Success(nil)
}

func (s *SmartContract) createLaptop(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
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

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
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
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	laptopAsBytes, _ := APIstub.GetState(args[0])
	laptop := Laptop{}

	json.Unmarshal(laptopAsBytes, &laptop)
	laptop.Propietario = args[1]

	laptopAsBytes, _ = json.Marshal(laptop)
	APIstub.PutState(args[0], laptopAsBytes)

	return shim.Success(nil)
}

// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
