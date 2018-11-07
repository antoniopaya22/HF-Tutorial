ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/antonio.com/orderers/orderer.antonio.com/msp/tlscacerts/tlsca.antonio.com-cert.pem
CORE_PEER_LOCALMSPID="appleMSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/apple.antonio.com/peers/peer0.apple.antonio.com/tls/ca.crt
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/apple.antonio.com/users/Admin@apple.antonio.com/msp
CORE_PEER_ADDRESS=peer0.apple.antonio.com:7051
CHANNEL_NAME=laptopschannel
CORE_PEER_TLS_ENABLED=true
peer chaincode install -n mycontract -v 1.0 -p github.com/hyperledger/fabric/examples/chaincode/go/chaincode_tutorial >&log.txt
cat log.txt
