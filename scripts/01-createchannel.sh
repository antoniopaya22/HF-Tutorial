ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/antonio.com/orderers/orderer.antonio.com/msp/tlscacerts/tlsca.antonio.com-cert.pem
CORE_PEER_LOCALMSPID="microsoftMSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/microsoft.antonio.com/peers/peer0.microsoft.antonio.com/tls/ca.crt
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/microsoft.antonio.com/users/Admin@microsoft.antonio.com/msp
CORE_PEER_ADDRESS=peer0.microsoft.antonio.com:7051
CHANNEL_NAME=laptopschannel
CORE_PEER_TLS_ENABLED=true
ORDERER_SYSCHAN_ID=syschain
peer channel create -o orderer.antonio.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/laptopschannel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
cat log.txt
