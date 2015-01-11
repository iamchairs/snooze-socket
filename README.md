# snooze-socket

Entities for using SocketIO in SnoozeJS

## Installation
Install from NPM.
```
    npm install snooze-socket
```
Inject the `snooze-socket` module in your app module. `snooze-socket` depends on `snooze-baselib` and `snooze-controller`. These will automatically get imported when you import `snooze-socket`.
```
    snooze.module('myApp', ['snooze-socket']);
```

## Use
You can create a socket by giving a port or setting the http handler (like Express).

    (function() {
        'use strict';
        
        snooze.module('myApp', ['snooze-socket'])
            .socket('ChatSocket', {
                port: 9876
            })
            .run(function(ChatSocket) {
                ChatSocket.on('message', function() {});
            });
    });
    
The socket constructor takes several properties defining the socket. `port`, `handler`, `controllers`, and `namespaces`. To set a handler, pass the http app object to the handler property:

    var app = require('express')();
    var server = require('http').Server(app);
    
    server.listen(80);

    snooze.module('myApp', ['snooze-socket'])
        .socket('ChatSocket', {
            handler: server
        });
        
You can use the named socket (in this case ChatSocket) as an injectable, however, using the [snooze-controller](https://www.npmjs.com/package/snooze-controller) is recommended.

### Controllers

Using the `snooze-controller` we can easily link socket events to controller methods.

    snooze.module('myApp', ['snooze-socket'])
        .controller('ChatCtrl', {
            'message': function($opts) {
                var message = $opts.data.message;
                $opts.client.emit('response', {message: 'You sent: ' + message});
                $opts.socket.emit('response', {message: 'Hello EVERYONE'});
            }
        })
        .socket('ChatSocket', {
            port: 9876,
            controllers: ['ChatCtrl']
        });
        
After Entities are compiled the socket will go through a post-compile phase that binds controller methods to socket events. Multiple controllers can be assigned to a socket to split responsibility and create better organization.

    snooze.module('myApp', ['snooze-socket'])
        .controller('UserCtrl', {
            'connection': function($opts, UserManager) {
                UserManager.loginUser($opts.client);
            },
            'disconnect': function($opts, UserManager) {
                UserManager.logoutUser($opts.client);
            }
        })
        .controller('ChatCtrl', {
            'message': function($opts, ChatManager) {
                var message = $opts.data.message;
                ChatManager.storeMessage(message);
            }
        })
        .socket('ChatSocket', {
            port: 9876,
            controllers: ['ChatCtrl', 'UserCtrl']
        });
        
In the above example `socket.on('connection')` and `socket.on('disconnect')` events will pass to the `UserCtrl.connection` and `UserCtrl.disconnect` methods. The `socket.on('message')` event will pass to the `ChatCtrl.message` method.

### $opts
The `$opts` injectable passed to the Controller contains the following properties:
* **socket** - The Socket object created through `module.socket`. Use  `socket.emit` to send a message to all clients.
* **client** - The Socket instance the generated the event. Use `client.emit` to send a message to that specific client.
* **data** - The data recieved for the event.

### Namespaces
`socket.io` Namespaces are supported. Each namespace acts like a socket itself. To set a namespaces use the `namespaces` property in the socket constructor.

    snooze.module('myApp', ['snooze-socket'])
        .socket('ChatSocket', {
            port: 9876,
            namespaces: {
                '/chat': {
                    controllers: ['ChatCtrl']
                },
                '/users': {
                    controller: ['UsersCtrl']
                }
            }
        });
        
This example creates two namespaces. One at `http://localhost:9876/chat` and one at `http://localhost:9876/users`. For more information on namespaces see [socket.io namespaces](http://socket.io/docs/rooms-and-namespaces/).

## Demo
See the `socket.io` chat room demo. Then see the `snooze-socket` chat room demo. See how using snooze organization makes setting up a socket.io application easier.

* [Socket.IO Chat Room](https://github.com/iamchairs/snooze-socket-chat) (original)
* [snooze-socket Chat Room](https://github.com/iamchairs/snooze-socket-chat) (improved)

## Contact

We're devoted to making `snooze-socket` and `snooze` better. Please contact us with comments/questions/bugs and we will address them ASAP.