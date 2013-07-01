var CONFIG = require('../config/config');
var Schema = require('caminte').Schema;
var schema = new Schema(CONFIG.db.engine);

var Models = {};

/* 
 * Setting up the models to represent the data
 */
Models.Options = schema.define('options', {
	site_id:{},
	name:{},
	value: {},
	autoload: {}
});

Models.User = schema.define('user', {
	login: {},
	pass: {},
	nicename: {},
	email: {},
	url: {},
	registered: {},
	activation_key: {},
	status: {},
	display_name: {}
});
Models.UserMeta = schema.define('usermeta', {
	meta_key: {},
	meta_value: {}
});

Models.Post = schema.define('post', {
	date:		{type: Date, 'default': Date.now},
    content:	{type: Schema.Text},
    title:		{type: Scheme.Text},
    excerpt:	{type: Schema.Text},
    status:		{type: String, length: 20},
    comment_status: {type: String, length: 20},
    ping_status: {type: String, length: 20},
    password: {type: String, length: 20},
    name: {type: String, length: 200},
    modified: {type: Date}
});
Models.PostMeta = schema.define('postmeta', {
	meta_key: {},
	meta_value: {}
});

/* 
 * Setting up the relationships between the models.
 */

Models.User.hasMany(Models.Post,   {as: 'posts',  foreignKey: 'userId'});
Models.Post.belongsTo(Models.User, {as: 'author', foreignKey: 'userId'});

Models.User.hasMany(Models.UserMeta,   {as: 'meta',  foreignKey: 'userId'});
Models.UserMeta.belongsTo(Models.User, {as: 'meta', foreignKey: 'userId'});

Models.Post.hasMany(Models.PostMeta,   {as: 'meta',  foreignKey: 'userId'});
Models.PostMeta.belongsTo(Models.Post, {as: 'meta', foreignKey: 'userId'});

/* 
 * Strictly only required for MySQL but safe for others.
 */

schema.autoupdate();



module.exports = Models;