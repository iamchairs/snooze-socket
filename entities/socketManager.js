(function() {
	'use strict';

	var snooze = require('snooze');
	var socketio = require('socket.io');

	snooze.module('snooze-socket').service('$socketManager', function($controllerManager) {
		var sockets = [];

		function getSockets() {
			return sockets;
		};

		function createSocket(opts) {
			var socket = null;

			var handler = opts.handler || null;
			var port = opts.port || null;
			var namespaces = opts.namespaces || {};
			var controllers = opts.controllers || [];

			if(handler) {
				socket = socketio(handler);
			} else if (port) {
				socket = socketio(port);
			} else {
				throw new Error('Tried to create a socket without a handler or port.');
			}

			socket.$namespaces = namespaces;
			socket.$controllers = controllers;

			sockets.push(socket);

			return socket;
		};

		function bindSocketNamespace(socket, name, options) {
			var controllers = options.controllers || [];
			var namespace = socket.of(name);

			namespace.on('connection', function(sock) {
				for(var i = 0; i < controllers.length; i++) {
					var controller = controllers[i];
					bindSocketController(namespace, sock, controllers);

					var Ctrl = $controllerManager.$config.getController(controller);
					var methods = Ctrl.getMethods();
					if(methods['connection']) {
						Ctrl.call('connection', {'socket': namespace, 'client': sock});
					}
				}
			});
		};

		function bindSocketController(socket, client, controller) {
			var Ctrl = $controllerManager.$config.getController(controller);
			var methods = Ctrl.getMethods();
			
			for(var method in methods) {
				if(method !== 'connection') {
					(function(method) {
						socket.on(method, function(data) {
							Ctrl.call(method, {'socket': socket, 'client': client, 'data': data});
						});
					})(method);
				}
			}
		};

		function $post() {
			for(var i = 0; i < sockets.length; i++) {
				var socket = sockets[i];
				var namespaces = socket.$namespaces;
				var controllers = socket.$controllers;

				for(var namespace in namespaces) {
					bindSocketNamespace(socket, namespace, namespaces[namespace]);
				}

				socket.on('connection', function(sock) {
					for(var i = 0; i < controllers.length; i++) {
						var controller = controllers[i];
						bindSocketController(socket, sock, controllers[i]);

						var Ctrl = $controllerManager.$config.getController(controller);
						var methods = Ctrl.getMethods();
						if(methods['connection']) {
							Ctrl.call('connection', {'socket': socket, 'client': sock});
						}
					}
				});
			}
		};

		var $config = {
			getSockets: getSockets,
			createSocket: createSocket,
			'$post': $post
		};

		var $get = {
			getSockets: getSockets
		};

		return {
			'$injectable': true,
			'$configurable': true,
			'$private': false,
			'$post': $post,
			'$config': $config,
			'$get': $get
		};
	});
})();