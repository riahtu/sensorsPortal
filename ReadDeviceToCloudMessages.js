'use strict';

var EventHubClient = require('azure-event-hubs').Client;
//var connectionString = `HostName=bsp4iot.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=OqyO2vcRUYurLu/qBIMpP2gzuwn8RxZjtMogTlbYfbM=`;
//var connectionString =`HostName=BSWAzureIoTHub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=llBYLiEjOqKZrl16CMY5nSL+9MSVkKCZ9Iy0erLFalE=`
var connectionString = `HostName=XDKHub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=L6SOK0MtahYHdnAIcKTlSWscFiF/vpoDx/IwgS1DLoI=`

var printError = function (err) {
    console.log(err.message);
};

var printMessage = function (message) {
    console.log('Message received: ');
    console.log(JSON.stringify(message.body));
    console.log('');
};

var client = EventHubClient.fromConnectionString(connectionString);
client.open()
    .then(client.getPartitionIds.bind(client))
    .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
            return client.createReceiver('$Default', partitionId, { 'startAfterTime': Date.now() }).then(function (receiver) {
                console.log('Created partition receiver: ' + partitionId)
                receiver.on('errorReceived', printError);
                receiver.on('message', printMessage);
            });
        });
    })
    .catch(printError);