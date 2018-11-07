#!/bin/bash

set -e

PROJECT_DIR=$PWD

ARGS_NUMBER="$#"
COMMAND="$1"

function verifyArg() {

    if [ $ARGS_NUMBER -ne 1 ]; then
        echo "Useage: networkOps.sh start | status | clean | cli | peer"
        exit 1;
    fi
}

OS_ARCH=$(echo "$(uname -s|tr '[:upper:]' '[:lower:]'|sed 's/mingw64_nt.*/windows/')-$(uname -m | sed 's/x86_64/amd64/g')" | awk '{print tolower($0)}')
FABRIC_ROOT=$GOPATH/src/github.com/hyperledger/fabric


function pullDockerImages(){
  local FABRIC_TAG="1.2.0"
  for IMAGES in peer orderer ccenv tools ca; do
      echo "==> FABRIC IMAGE: $IMAGES"
      echo
      docker pull hyperledger/fabric-$IMAGES:$FABRIC_TAG
      docker tag hyperledger/fabric-$IMAGES:$FABRIC_TAG hyperledger/fabric-$IMAGES
  done
}

function replacePrivateKey () {

    echo # Replace key
  
    OPTS="-i"
	cp docker-compose-template.yaml docker-compose.yaml

    CURRENT_DIR=$PWD
    cd crypto-config/peerOrganizations/microsoft.antonio.com/ca/
    PRIV_KEY=$(ls *_sk)
    cd $CURRENT_DIR
    sed $OPTS "s/CA1_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose.yaml
    cd crypto-config/peerOrganizations/apple.antonio.com/ca/
    PRIV_KEY=$(ls *_sk)
    cd $CURRENT_DIR
    sed $OPTS "s/CA2_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose.yaml
}

function generateCerts(){

    if [ ! -f $GOPATH/bin/cryptogen ]; then
        go get github.com/hyperledger/fabric/common/tools/cryptogen
    fi

    echo
	echo "##########################################################"
	echo "##### Generate certificates using cryptogen tool #########"
	echo "##########################################################"
	if [ -d ./crypto-config ]; then
		rm -rf ./crypto-config
	fi

    $GOPATH/bin/cryptogen generate --config=./crypto-config.yaml
    echo
}


function generateChannelArtifacts(){

    if [ ! -d ./channel-artifacts ]; then
		mkdir channel-artifacts
	fi

	if [ ! -f $GOPATH/bin/configtxgen ]; then
        go get github.com/hyperledger/fabric/common/tools/configtxgen
    fi

    echo
	echo "#################################################################"
	echo "### Generating channel configuration transaction 'channel.tx' ###"
	echo "#################################################################"

    configtxgen -profile LaptopsOrdererGenesis -channelID syschain  -outputBlock ./channel-artifacts/genesis.block
    
    echo
	echo "#################################################################"
	echo "#######    Generating anchor peer update for MSP   ##########"
	echo "#################################################################"
    configtxgen -profile laptopschannel -outputCreateChannelTx ./channel-artifacts/laptopschannel.tx -channelID "laptopschannel"

    echo
	echo "#################################################################"
	echo "#######    Generating anchor peer update for Org1MSP   ##########"
	echo "#################################################################"
	configtxgen -profile laptopschannel -outputAnchorPeersUpdate ./channel-artifacts/microsoftMSPanchors.tx -channelID "laptopschannel" -asOrg microsoftMSP

	echo
	echo "#################################################################"
	echo "#######    Generating anchor peer update for Org2MSP   ##########"
	echo "#################################################################"
	configtxgen -profile laptopschannel -outputAnchorPeersUpdate ./channel-artifacts/appleMSPanchors.tx -channelID "laptopschannel" -asOrg appleMSP
	echo
}

function startNetwork() {

    echo
    echo "================================================="
    echo "---------- Starting the network -----------------"
    echo "================================================="
    echo

    cd $PROJECT_DIR
    docker-compose -f docker-compose.yaml up -d
}

function cleanNetwork() {
    cd $PROJECT_DIR

    if [ -d ./channel-artifacts ]; then
            rm -rf ./channel-artifacts
    fi

    if [ -d ./crypto-config ]; then
            rm -rf ./crypto-config
    fi

    if [ -d ./tools ]; then
            rm -rf ./tools
    fi

    if [ -f ./docker-compose.yaml ]; then
        rm ./docker-compose.yaml
    fi

    if [ -f ./docker-compose.yamlt ]; then
        rm ./docker-compose.yamlt
    fi

    # This operations removes all docker containers and images regardless
    #
    docker rm -f $(docker ps -aq)
    docker rmi -f $(docker images -q)
    docker volume rm -f $(docker volume ls -q)

    # This removes containers used to support the running chaincode.
    #docker rm -f $(docker ps --filter "name=dev" --filter "name=peer0.org1.example.com" --filter "name=cli" --filter "name=orderer.example.com" -q)

    # This removes only images hosting a running chaincode, and in this
    # particular case has the prefix dev-*
    #docker rmi $(docker images | grep dev | xargs -n 1 docker images --format "{{.ID}}" | xargs -n 1 docker rmi -f)
}

function networkStatus() {
    docker ps --format "{{.Names}}: {{.Status}}" | grep '[peer0* | orderer* | cli ]'
}

function dockerCli(){
    docker exec -it cli /bin/bash
}

# Network operations
verifyArg
case $COMMAND in
    "start")
        generateCerts
        generateChannelArtifacts
        replacePrivateKey
        pullDockerImages
        startNetwork
        ;;
    "status")
        networkStatus
        ;;
    "clean")
        cleanNetwork
        ;;
    "cli")
        dockerCli
        ;;
    *)
        echo "Useage: networkOps.sh start | status | clean | cli "
        exit 1;
esac
