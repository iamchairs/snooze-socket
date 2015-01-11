describe('Socket', function() {
	'use strict';

	var snooze = require('snooze');
	var should = require('should');
	var Module;
	require('../main.js');

	Module = snooze.module('myApp', ['snooze-socket'])
		.wakeup();

	beforeEach(function() {
		Module.runs.length = 0;
	});

	it('should be defined', function() {
		(typeof Module.socket).should.not.equal('undefined');
		Module.EntityManager.entityExists('$socketManager').should.equal(true);
	});

	it('should define a socket on port 9876', function() {
		Module
			.socket('MainSocket', {
				port: 9876
			});
	});

	it('should send a message to the main socket', function(done) {
		var Client = require('socket.io-client')('http://localhost:9876');

		Module
			.run(function(MainSocket) {
				MainSocket.on('connection', function(Sock) {
					Sock.on('hello', function(data) {
						data.name.should.equal('world');

						done();
					});
				});

				Client.emit('hello', {name: 'world'});
			})
			.doRuns();
	});

	it('should send a message to the connected socket', function(done) {
		var Client = require('socket.io-client')('http://localhost:9876');

		Module
			.run(function(MainSocket) {

				Client.on('hello', function(data) {
					data.name.should.equal('world');
					done();
				});

				MainSocket.on('connection', function(Sock) {
					Sock.emit('hello', {name: 'world'});
				});

				Client.disconnect();
				Client.connect('http://localhost:9876');
			})
			.doRuns();
	});

	it('should call methods on the controller', function(done) {
		var waiting = 4;
		var _checkDone = function() {
			waiting--;
			if(waiting <= 0) {
				done();
			}
		};

		snooze.module('chatApp', ['snooze-socket'])
			.controller('Chat', {
				connection: function($opts) {
					(typeof $opts.socket).should.not.equal('undefined');
					_checkDone();
				},
				message: function($opts) {
					$opts.data.message.should.equal('foo');
					_checkDone();
				}
			})
			.controller('Users', {
				connection: function($opts) {
					(typeof $opts.socket).should.not.equal('undefined');
					_checkDone();
				},
				ping: function($opts) {
					$opts.data.uid.should.equal(1);
					_checkDone();
				}
			})
			.socket('ChatSocket', {
				port: 8765,
				controllers: ['Chat', 'Users']
			})
			.config(function() {
				var Client = require('socket.io-client')('http://localhost:8765');

				Client.emit('ping', {uid: 1});
				Client.emit('message', {message: 'foo'});
			})
			.wakeup();
	});

	it('should call methods on the namespace controllers', function(done) {
		var waiting = 4;
		var _checkDone = function() {
			waiting--;
			if(waiting <= 0) {
				done();
			}
		};

		snooze.module('chatApp2', ['snooze-socket'])
			.controller('Chat', {
				connection: function($opts) {
					(typeof $opts.socket).should.not.equal('undefined');
					_checkDone();
				},
				message: function($opts) {
					$opts.data.message.should.equal('foo');
					_checkDone();
				}
			})
			.controller('Users', {
				connection: function($opts) {
					(typeof $opts.socket).should.not.equal('undefined');
					_checkDone();
				},
				ping: function($opts) {
					$opts.data.uid.should.equal(1);
					_checkDone();
				}
			})
			.socket('ChatSocket', {
				port: 7654,
				namespaces: {
					'/chat': {
						controllers: ['Chat']
					},
					'/users': {
						controllers: ['Users']
					}
				}
			})
			.config(function() {
				var Client1 = require('socket.io-client')('http://localhost:7654/chat');
				var Client2 = require('socket.io-client')('http://localhost:7654/users');

				Client1.emit('message', {message: 'foo'});
				Client2.emit('ping', {uid: 1});
			})
			.wakeup();
	});
});