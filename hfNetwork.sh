#!/bin/bash

# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
# ========= hfNetwork ============
#
# Autor: Antonio Paya Gonzalez
#
# ================================


# ============ VARIABLES =============
set -e

DIR=$PWD
NUM_ARG="$#"
COMMAND="$1"
OS_ARCH=$(echo "$(uname -s|tr '[:upper:]' '[:lower:]'|sed 's/mingw64_nt.*/windows/')-$(uname -m | sed 's/x86_64/amd64/g')" | awk '{print tolower($0)}')
FABRIC_ROOT=$GOPATH/src/github.com/hyperledger/fabric


# ============ FUNCIONES =============


# generarCertificados -> Genera los certificados
function generarCertificados(){
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

    cryptogen generate --config=./crypto-config.yaml
    echo
}

# generarChannelArtifacts -> Genera los certificados
function generarChannelArtifacts(){

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
	echo "#####   Generating anchor peer update for microsoftMSP   ########"
	echo "#################################################################"
	configtxgen -profile laptopschannel -outputAnchorPeersUpdate ./channel-artifacts/microsoftMSPanchors.tx -channelID "laptopschannel" -asOrg microsoftMSP

	echo
	echo "#################################################################"
	echo "#######   Generating anchor peer update for appleMSP   ##########"
	echo "#################################################################"
	configtxgen -profile laptopschannel -outputAnchorPeersUpdate ./channel-artifacts/appleMSPanchors.tx -channelID "laptopschannel" -asOrg appleMSP
	echo
}

# downloadDockerImages -> Descarga las imagenes docker
#  con version 1.2.0
function downloadDockerImages(){
    echo
	echo "**********************************************************"
	echo "*******         Descargando imagenes docker       ********"
	echo "**********************************************************"
    local FABRIC_TAG="1.2.0"
    for IMAGES in peer orderer ccenv tools ca; do
        echo "==> FABRIC IMAGE: $IMAGES"
        echo
        docker pull hyperledger/fabric-$IMAGES:$FABRIC_TAG
        docker tag hyperledger/fabric-$IMAGES:$FABRIC_TAG hyperledger/fabric-$IMAGES
    done
}

# remplazarClavePrivada -> Crea el archivo docker-compose.yaml
#    a partir de docker-compose-template.yaml y remplaza las
#    CAX_PRIVATE_KEY por las claves que se encuentran en la carpeta crypto-config
function remplazarClavePrivada () {
    echo 
    echo "---------- Remplazando clave privada --------------"
    echo
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


# startNetwork -> Inicia la red Fabric
function startNetwork() {
    echo
    echo "================================================="
    echo "---------- Iniciando la red Fabric --------------"
    echo "================================================="
    echo
    cd $DIR
    docker-compose -f docker-compose.yaml up -d
}

# cleanNetwork -> Borra certificados, imagenes docker, etc.
function cleanNetwork() {
    cd $DIR

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

    docker rm -f $(docker ps -aq)
    docker rmi -f $(docker images -q)
    docker volume rm -f $(docker volume ls -q)
}

# networkStatus -> Devuelve el estado de la red
function networkStatus() {
    docker ps --format "{{.Names}}: {{.Status}}" | grep '[peer0* | orderer* | cli ]'
}

# dockerCli -> Inicia un docker cli
function dockerCli(){
    docker exec -it cli /bin/bash
}

# comprobarArg -> Comprueba si el numero de parametros es correcto (arg==1)
function comprobarArg() {
    if [ $NUM_ARG -ne 1 ]; then
        echo "Modo de ejecucion: "
        echo "      # hfNetwork.sh start | status | clean | cli"
        exit 1;
        exit 1;
    fi
}


# ============ RUN =============

# Network operations
comprobarArg
case $COMMAND in
    "start")
        generarCertificados
        generarChannelArtifacts
        remplazarClavePrivada
        downloadDockerImages
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
        echo "Modo de ejecucion: "
        echo "      # hfNetwork.sh start | status | clean | cli"
        exit 1;
esac
