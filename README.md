# modelbuilder-web-service --

Modelbuilder REST API web layer (nodejs)

For user guide refer to wiki [here](https://github.home.247-inc.net/advancedprototypes/orion-web-service/wiki/User-Guide)

For build and deployment guide, please refer to [here](https://github.home.247-inc.net/advancedprototypes/modelbuilder-web-service/wiki/Build-and-Deployment-Guide)



Modelbuilder-webservice is majorly written in node.js which actually interacts with the Modelbuilder.
It has the apis responsible to receive the datasets uploaded in the modeling workbench.
It is responsible for validating the dataset.
It takes care of all the preprocessing and configurations of the training dataset which will be fed to the model.
It is responsible for finally calling the model with proper parameters and training datasets.
It also updates the status of the model that has been built.
It also downloads the final output files(resultant after building the model).

## Pre-requisite

* Node
* Redis (Refer [Redis Doc](https://redis.io/download) for installation)

To install Node please refer below NodeJs documentation:
[Node Documentation](https://nodejs.org/en/download/ "Node Documentation")


## Service Installation Guide

Note: 
* Execute all the below commands from project's root directory.
* Start the redis sentinel and slave as root:
    - Command for starting the sentinel in linux:
        * redis-server /etc/redis/redis-sentinel.conf --sentinel</br>
    - Command for starting the redis slave:
        * redis-server /etc/redis/slave.conf </br>

To install the project's dependancies, execute </br>
`npm install`

To run the web-service, execute </br>
`node index.js --config config/service-template.json`

This will start the modelbuilder-web-service under http://localhost:8080/v1/modelbuilder where it picks the default port from service-template.json.

Swagger doc: http://localhost:8080/v1/modelbuilder/docs