# Setting up a Hyperledger Fabric Network #

In the following repository there are basic skeletons for the network creation.

https://github.com/mtnieto/hf-template

### Prerequistes

- Go 1.7 version

- Ubuntu 16.04


## Files ##
The following files will be modified to create the configuration desired.

### crypto-config.yaml ###

In this file is established the definition of the organizations, peers for organization and the configuration of the orederer.

### configtx.yaml ##

In this file is established the channel configurations, how many channel, what organizations are in a channel, etc.

### base/docker-compose-base.yaml ###
It is necessary to change the hosts and the paths of the crypto materials according the configuration of the 2 files previous.

### docker-compose-template.yaml
It is also necessary necessary to change the hosts and the paths of the crypto materials.

### fabricOps.sh ###
Modify the two following methods

1. replacePrivateKey:
Change the paths of the cryptomaterials

2. generateChannelArtifacts: Modify the following command lines

```
$GOPATH/bin/configtxgen -profile SeriesOrdererGenesis -outputBlock ./channel-artifacts/genesis.block

$GOPATH/bin/configtxgen -profile serieschannel -outputCreateChannelTx ./channel-artifacts/serieschannel.tx -channelID "serieschannel"

```
It is necessary to be equal to the variables defined in the configtx.yaml file. Be careful with the channelID, uppercases are considered like ilegal characters.

## Executing the network ##

### Run the network ###
Once the configuration is defined and all the files modified, to run the network execute the following command:

```
./fabricOps.sh start
```

NOTE: Now, you have an environment to deploy and to interact chaincodes. It's very important that the chaincode is deployed in the same docker network than the peers.
To check this execute the following command
```
docker inspect "name_of_a_peer_container
```
With this information, the next step is going to the file /base/peer-base.yaml.

The name of the network must correspond to the following line value. If it is different, when a chaincode will be instanciate its docker container will be created and immediately will be killed.

```
- CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=hf2orgs_default

```
### Delete and modify the network ###
With every change in the configuration it is necessary to execute the following command:

```
./fabricOps.sh clean

```

NOTE: You must not delete the command line in the script where the docker images are removed.

### Interact with the network ####
To interact with the network creating channels, joining peers and interacting with the chaincode, execute the following command:

```
./fabricOps.sh cli
```
Once we are in the docker container of the hyperledger cli tool we can execute the following commands:

```
./scripts/01-createchannel.sh //a channel is created
./scripts/02-joinHBO.sh // An organization joins in to the channel
./scripts/03-joinNetflix.sh //Another organization joins into the channel
./script/04-installHBO.sh // The chaincode is installed in the hbo peer
./script/06-instanciate.sh // The chaincode is instanciated in the network and a docker-container of the chaincode is created
```
# Setting up a Distributed Hyperledger Fabric Network #

Everytime we are going to distribute the network it is very important to generate first of all the certificates, and then distribute the code to the different machines.

With this goal, comment the following lines of the file fabricOps.sh.

```
 generateCerts
 generateChannelArtifacts
 replacePrivateKey
# pullDockerImages
# startNetwork
```

Now, the crypto materials were generated. The next step is to comment and to uncomment the following lines of the fabricOps.sh

```
# generateCerts
# generateChannelArtifacts
# replacePrivateKey
pullDockerImages
# startNetwork
```

It is necessary to modify the following files:

### 1. base/peer-base.yml ###

Append the following lines to the document with the configuration desired:
```
extra_hosts:
  - "orderer.myapp.com:34.240.181.209"
  - "peer0.netflix.myapp.com:34.240.181.209"
  - "peer0.hbo.myapp.com:34.248.224.23"
```


### 2. docker-compose-template.yml ###

Append the same lines in the configuration of the cli container

### NOTE: Everytime we want to connect with a peer it is neccesary to specify its domain name. If we use the IP the certificates won't work.


## Executing the network

We are going to use 2 machines. In the first machine will run the orderer, one peer and its ca, and the cli tool.

In  the second machine will run the other peer and its ca.

The commands to run the distributed network are the following.

First machine:

```
docker-compose up -d cli
```
Second machine:

```
docker-compose up -d peer0.bank1.myapp.com
```

To check if the peers of the networks are seen between them it is necessary to execute the scritps. The scripts create a channel, join banks into the channel, install the chaincode in the peers, and instanciate the chaincode in one peer.

To run the scripts execute the following command:
```
./fabricOps.sh cli
./scripts/01-createchannel.sh //a channel is created
./scripts/02-joinHBO.sh // An organization joins in to the channel
./scripts/03-joinNetflix.sh //Another organization joins into the channel
./script/04-installHBO.sh // The chaincode is installed in the hbo peer
./script/06-instanciate.sh // The chaincode is instanciated in the network and a docker-container of the chaincode is created

```

If the execution is correct and if in the second machine a container is created, the network is running!!
