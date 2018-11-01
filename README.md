# HF-Tutorial
Tutorial para poder crear una red blockchain Hyperledger Fabric junto con una web-app.

## 1.- Prerrequisitos:
Antes de poder comenzar a configurar nuestra red Fabric necesitamos instalar los prerrequisitos en las máquinas que queramos utilizar para el desarrollo de la aplicación.
Puedes ver más información sobre los prerrequisitos [aquí](https://hyperledger-fabric.readthedocs.io/en/release-1.3/prereqs.html).

### 1.1 .- Docker y Docker-Compose
Deber de tener instalado tanto Docker versión 17.06 o mayor como Docker Compose versión 1.14.0 o mayor:

Podemos comprobar que Docker está instalado con el comando: 
```bash
$ docker --version
```

Podemos comprobar que Docker-Compose está instalado con el comando: 
```bash
$ docker-compose --version
```

### 1.2 .- Go
Necesitamos tener instalado el lenguaje Go ya que Hyperledger utiliza dicho lenguaje para muchos de sus componentes.

Además debes añadir la variable de entorno GOPATH apuntando al workspace de Go:
```bash
$ export GOPATH=$HOME/go
``` 

### 1.3 .- NodeJS Runtime y NPM
Si vas a desarrollar aplicaciones con Hyperledger Fabric con NodeJS también necesitas instalar NodeJS versión 8.9.X o superior (la versión 9.x aún no tiene soporte) junto con npm.

Normalmente al instalar NodeJS viene incluido NPM, pero es recomendable confirmar la versión de NPM instalada. Puedes actualizar NPM con el siguiente comando:
```node
$ npm install npm@5.6.0 -g
```

## 2.- Clonar el repositorio
Ahora debes clonar este repositorio donde hay una plantilla con los archivos necesarios para crear una red Fabric.

```bash
$ git clone https://github.com/antonioalfa22/HF-Tutorial.git
$ cd HF-Tutorial
```

## 3.- Imágenes Docker de Fabric y Ejecutables:
El siguiente paso es descargar la última versión de las imágenes Docker de Hyperledger Fabric y añadirles la etiqueta de `latest`. Ejecuta el siguiente comando para descargar dichos archivos.

```bash
$ curl -sSL https://goo.gl/6wtTN5 | bash -s 1.1.0
```

> Es recomendable que la máquina en uso no tenga otras imágenes de Docker de Hyperledger Fabric ya que puede dar lugar a errores. Puedes borrar todas las imagenes de Docker con los siguientes comandos:
> ```bash
> $ docker rm -f $(docker ps -aq)
> $ docker rmi -f $(docker images -q)
> ```

Una vez descargadas las imágenes Docker, tenemos que asegurarnos que estén en su última version (`latest`). Si ejecutamos `$ docker images` deberíamos de tener una salida parecida a esta:
 ![Fabric install](/doc/images/Fabric_install.jpg)

 Si alguna imágen Docker no tiene la etiqueta `latest` puedes añadirla con el siguiente comando:

 ```bash
 $ docker tag hyperledger/<name_image>:<tag> hyperledger/fabric-tools:latest
 ```

 Además de las imágenes Docker se ha descargado una carpeta bin que contiene los ejecutables necesarios para instanciar una red Fabric, como `cryptogen, configtxgen, configxlator, peer`. Ahora debemos de añadir la carpeta bin a nuestra variable de entorno PATH:

 ```bash
 $ export PATH=$PWD/bin:$PATH
 ```

 ## 4.- Primera ejecución:
 Una vez hayas completado todo lo anterior sin problemas, vamos a iniciar por primera vez nuestra red Fabric. Para ello nos situamos en la raíz del repositorio y ejecutamos:

 ```bash
 $ ./byfn.sh -m generate
 ```

 > Al ejecutar aparecerá una pregunta que nos pide `Y/N`. Pulsamos `Y` para continuar.

 Esto genera todos los certificados y llaves (keys) para nuestras diversas entidades de la red Fabric, incluyendo el genesis block que se usa para iniciar el ordering service y las transacciones necesarias para crear un canal.

Una vez generados los certificados vamos a iniciar por fin la red:

 ```bash
 $ ./byfn.sh -m up
 ```

  > Al ejecutar aparecerá una pregunta que nos pide `Y/N`. Pulsamos `Y` para continuar.

Si todo ha salido bien deberíamos de tener levantada nuestra red Fabric.

> Para "apagar" la red debemos ejecutar:
> ```bash
> $ ./byfn.sh -m down
> ```