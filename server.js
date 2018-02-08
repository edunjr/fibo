const amqp = require('amqplib/callback_api');

var host = 'amqp://localhost';
var queue = 'rpc_queue';
var number;
var result;
var replyTo;

amqp.connect(host, function(error, connection){
  connection.createChannel(function(error, channel){
    channel.assertQueue(queue, {durable: false});

    channel.consume(queue, function reply(message){
      number = parseInt(message.content.toString());
      result = fibonacci(number);
      replyTo = message.properties.replyTo;

      // Por que o 'new Buffer'?
      channel.sendToQueue(replyTo,  new Buffer(result.toString()), {
        correlationId: message.properties.correlationId
      });
      channel.ack(message);
    });
  });
});

function fibonacci(n){
  if (n == 0 || n == 1)
    return n;
  else
    return fibonacci(n - 1) + fibonacci(n - 2);
}
