(function() {
	'use strict';

	var snooze = require('snooze');
	snooze.module('snooze-socket', ['snooze-controller', 'snooze-baselib'])
		.registerEntityGroupsFromPath('entityGroups/*.js')
		.registerEntitiesFromPath('entities/*.js');
})();