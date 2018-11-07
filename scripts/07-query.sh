ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/antonio.com/orderers/orderer.antonio.com/msp/tlscacerts/tlsca.antonio.com-cert.pem
CORE_PEER_LOCALMSPID="microsoftMSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/microsoft.antonio.com/peers/peer0.microsoft.antonio.com/tls/ca.crt
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/microsoft.antonio.com/users/Admin@microsoft.antonio.com/msp
CORE_PEER_ADDRESS=peer0.microsoft.antonio.com:7051
CHANNEL_NAME=laptopchannel
CORE_PEER_TLS_ENABLED=true

verifyResult () {
	if [ $1 -ne 0 ] ; then
		echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
                echo "================== ERROR !!! FAILED to execute End-2-End Scenario =================="
		echo
   		exit 1
	fi
}
queryChaincode () {
	# while 'peer chaincode' command can get the orderer endpoint from the peer (if join was successful),
	# lets supply it directly as we know it using the "-o" option
	peer chaincode invoke -o orderer.antonio.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n mycontract -c '{"function":"initLedger","Args":[""]}' >&log.txt
	res=$?
	cat log.txt
	verifyResult $res "Fallo al iniciar el Ledger '$CHANNEL_NAME'"
	echo "===================== Chaincode Ledger Iniciado en el canal '$CHANNEL_NAME' correctamente ===================== "
	echo
	peer chaincode query -C $CHANNEL_NAME -n mycontract -c '{"function":"queryAllLaptops","Args":[""]}' >&log.txt
	res=$?
	cat log.txt
	verifyResult $res "Query All Laptops en el canal '$CHANNEL_NAME' fallo"
	echo "===================== Consulta en el canal '$CHANNEL_NAME' correcta ===================== "
	echo
}

queryChaincode
