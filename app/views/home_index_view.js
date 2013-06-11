var BaseView = require('./base_view');

module.exports = BaseView.extend({
	className: 'home_index_view',

	events: {
		'click p': 'handleClick'
	},

	handleClick: function() {}
});

module.exports.id = 'HomeIndexView';