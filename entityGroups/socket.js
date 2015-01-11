(function() {
	var snooze = require('snooze');

	var Socket = new snooze.EntityGroup();
	Socket.type = 'socket';

	Socket.compile = function(entity, entityManager) {
		var $socketManager = entityManager.getEntity('$socketManager').instance.$config;
		
		entity.configurable = false;
		entity.private = entity.constructor.private | false;

		entity.instance = $socketManager.createSocket(entity.constructor);
	};

	Socket.getInject = function(entity, entityManager) {
		return entity.instance;
	};

	Socket.registerDependencies = function(entity, entityManager) {
		if(entity.constructor.controller) {
			entity.dependencies.push(entity.constructor.controller);
		}
	};

	module.exports = Socket;
})();