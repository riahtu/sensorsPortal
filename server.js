'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
global.__base = __dirname + '/';
var routes = require('./routes/index');
var compression = require('compression')
var helmet = require('helmet');
var EventHubClient = require('azure-event-hubs').Client;

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
//io.use(middleware);


app.use(helmet());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression())

app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.method === 'OPTIONS') {
    res.status(200).send('Allow');
  } else {
    next();
  }
});

app.use(express.static(path.join(__dirname, 'public')));


app.get('/style.css',
  function (req, res) {
    res.sendFile('style.css', { root: './views' });
  });

app.get('/supermarket.jpg',
  function (req, res) {
    res.sendFile('supermarket.jpg', { root: './views' });
  });

app.get('/Bosch-logo.png',
  function (req, res) {
    res.sendFile('Bosch-logo.png', { root: './views' });
  });


app.use('/api', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}


// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

io.on('connection', function (socket) {
  console.log('Client Connected')


  socket.on("message", function (event, data) {
    console.log(event);
    console.log(data);
  });


  socket.on("sensorTag", function (event, data) {
    // console.log(event);
    // console.log(data);
    io.emit('tiClient', event, data);
  });

});




/**********Event Hub Socket Message ********************/

var connectionString = `HostName=XDKHub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=L6SOK0MtahYHdnAIcKTlSWscFiF/vpoDx/IwgS1DLoI=`

var printError = function (err) {
  console.log(err.message);
};

var printMessage = function (message) {
  console.log('Message received: ');
  console.log(JSON.stringify(message.body));
  console.log('');
};

/*var client = EventHubClient.fromConnectionString(connectionString);
client.open()
  .then(client.getPartitionIds.bind(client))
  .then(function (partitionIds) {
    return partitionIds.map(function (partitionId) {
      return client.createReceiver('$Default', partitionId, { 'startAfterTime': Date.now() }).then(function (receiver) {
        console.log('Created partition receiver: ' + partitionId)
        receiver.on('errorReceived', printError);
        receiver.on('message', printMessage);
        receiver.on('message', function (data) {
          io.emit('message', data.body);
        });

      });
    });
  })
  .catch(printError);
*/


server.listen(4000);  
