const amqp = require('amqplib/callback_api');
const uuid = require('uuid/v4');

var host = 'amqp://localhost';
var requestCorrelationId;
var number;

//console.log('lo')
number = parseInt(process.argv.slice(2));

amqp.connect(host, function(error, connection){
  connection.createChannel(function(error, channel){
    channel.assertQueue('', {exclusive: true}, function(error, assertedQueue){

      requestCorrelationId = uuid();

      channel.sendToQueue('rpc_queue', new Buffer(number.toString()), {
        correlationId: requestCorrelationId,
        replyTo: assertedQueue.queue
      });

      channel.consume(assertedQueue.queue, function(message){
        if(message.properties.correlationId == requestCorrelationId){
          console.log(message.content.toString());
          close(connection);
          process.exit(0)
        }
      }, {noAck: true}); // rever sobre isso
    });
  });
});


function close(connection){
  connection.close();
}
