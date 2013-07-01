var CONFIG = require('../../config');
var crypto = require('crypto');

var Nonce = {
	tick : function () {
		var life = 86400000; // milliseconds
		return Math.ceil(Date.now() / (life / 2));
	},
	create : function () {
		// TODO
	},
	hash : function (data, scheme) {
		if (!scheme) {
			scheme = 'auth';
		}
		var salt = this.salt(scheme);
		return crypto.createHmac('sha1', salt).update(data).digest('hex');
	},
	salt : function (scheme) {
		var secret_key = '';
		var salt = '';
		if ( 'nonce' == scheme ) {
			if (CONFIG.keys('NONCE_KEY') && '' !== CONFIG.keys('NONCE')) {
				secret_key = NONCE_KEY;
			}
			if (CONFIG.keys('NONCE_SALT') && '' !== CONFIG.keys('NONCE_SALT')) {
				salt = NONCE_SALT;
			} else {
				salt = get_site_option('nonce_salt');
				if ( empty($salt) ) {
					salt = wp_generate_password( 64, true, true );
					update_site_option('nonce_salt', $salt);
				}
			}
		} else {
			// ensure each auth scheme has its own unique salt
			salt = crypto.createHmac('sha1', secret_key).update(scheme).digest('hex');
		}
		return secret_key + salt;
	},
	generate_password : function (length, special_chars, $extra_special_chars) {
		var i;
		if (length === undefined) {length = 12;}
		if (special_chars === undefined) {special_chars = true;}
		if (extra_special_chars === undefined) {extra_special_chars = true;}
		var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		if (special_chars) {
			chars += '!@#$%^&*()';
		}
		if (extra_special_chars) {
			chars += '-_ []{}<>~`+=,.;:/?|';
		}
		password = '';
		for (i = 0;i<length;i++) {
			password += chars.substr(this.random(0, chars.length), 1);
		}
		return password;
	},
	random : function (min, max) {
		/* this is a function that uses the javascript random function to seed itself.
		 * Is this overkill? Maybe, but it should have more entroy than the limited JS 
		 * Math.random function has. For security this is a good thing.
		 * It also regenerates the random sequence regularly but not EVERY request
		 */
		if (min === undefined) { min = 0;}
		if (max === undefined) { max = 0;}
		var rnd_value, uniqid, value;

		rnd_value = global.journal_rnd_value;

		uniqid = Math.floor(Math.random() * 2147483647); // Max signed 32bit value. 
		// Reset rnd_value after 14 uses
		// 32(md5) + 40(sha1) + 40(sha1) / 8 = 14 random numbers from rnd_value
		if (global.journal_rnd_value.length < 8 ) {
			if (this.seed === undefined) {
				this.seed = this.generate_password();
			}
			rnd_value = crypto.createHash('md5').update(Date.now() + '' + uniqid + '' + this.seed).digest('hex');
			rnd_value += crypto.createHash('sha1').update(rnd_value).digest('hex');
			rnd_value += crypto.createHash('sha1').update(rnd_value + this.seed).digest('hex');
			this.seed = md5(this.seed + rnd_value);
			global.journal_rnd_value = rnd_value;
		}
		// Take the first 8 digits for our value
		value = global.journal_rnd_value.substr(0, 8);
		// Strip the first eight, leaving the remainder for the next call.
		global.journal_rnd_value = global.journal_rnd_value.substr(8);
		value = Math.abs(parseInt(value, 16));
		// Reduce the value to be within the min - max range
		// 4294967295 = 0xffffffff = max random number
		if (max !== 0) {
			value = min + ((max - min + 1) * (value / (4294967295 + 1)));
		}
		return Math.abs(parseInt(value, 10));
	}
};

function wp_create_nonce($action = -1) {
    $user = wp_get_current_user();
    $uid = (int) $user->ID;
    $i = wp_nonce_tick();
 	return substr(wp_hash($i . $action . $uid, 'nonce'), -12, 10);
}

function wp_salt($scheme = 'auth') {
    global $wp_default_secret_key;
    $secret_key = '';
    if ( defined('SECRET_KEY') && ('' != SECRET_KEY) && ( $wp_default_secret_key != SECRET_KEY) )
        $secret_key = SECRET_KEY;
    if ( 'auth' == $scheme ) {
        if ( defined('AUTH_KEY') && ('' != AUTH_KEY) && ( $wp_default_secret_key != AUTH_KEY) )
            $secret_key = AUTH_KEY;
        if ( defined('AUTH_SALT') && ('' != AUTH_SALT) && ( $wp_default_secret_key != AUTH_SALT) ) {
            $salt = AUTH_SALT;
        } elseif ( defined('SECRET_SALT') && ('' != SECRET_SALT) && ( $wp_default_secret_key != SECRET_SALT) ) {
            $salt = SECRET_SALT;
        } else {
            $salt = get_site_option('auth_salt');
            if ( empty($salt) ) {
                $salt = wp_generate_password( 64, true, true );
                update_site_option('auth_salt', $salt);
            }
        }
    } elseif ( 'secure_auth' == $scheme ) {
        if ( defined('SECURE_AUTH_KEY') && ('' != SECURE_AUTH_KEY) && ( $wp_default_secret_key != SECURE_AUTH_KEY) )
            $secret_key = SECURE_AUTH_KEY;
        if ( defined('SECURE_AUTH_SALT') && ('' != SECURE_AUTH_SALT) && ( $wp_default_secret_key != SECURE_AUTH_SALT) ) {
            $salt = SECURE_AUTH_SALT;
        } else {
            $salt = get_site_option('secure_auth_salt');
            if ( empty($salt) ) {
                $salt = wp_generate_password( 64, true, true );
                update_site_option('secure_auth_salt', $salt);
            }
        }
    } elseif ( 'logged_in' == $scheme ) {
        if ( defined('LOGGED_IN_KEY') && ('' != LOGGED_IN_KEY) && ( $wp_default_secret_key != LOGGED_IN_KEY) )
            $secret_key = LOGGED_IN_KEY;
        if ( defined('LOGGED_IN_SALT') && ('' != LOGGED_IN_SALT) && ( $wp_default_secret_key != LOGGED_IN_SALT) ) {
            $salt = LOGGED_IN_SALT;
        } else {
            $salt = get_site_option('logged_in_salt');
            if ( empty($salt) ) {
                $salt = wp_generate_password( 64, true, true );
                update_site_option('logged_in_salt', $salt);
            }
        }
    } elseif ( 'nonce' == $scheme ) {
        if ( defined('NONCE_KEY') && ('' != NONCE_KEY) && ( $wp_default_secret_key != NONCE_KEY) )
            $secret_key = NONCE_KEY;
        if ( defined('NONCE_SALT') && ('' != NONCE_SALT) && ( $wp_default_secret_key != NONCE_SALT) ) {
            $salt = NONCE_SALT;
        } else {
            $salt = get_site_option('nonce_salt');
            if ( empty($salt) ) {
                $salt = wp_generate_password( 64, true, true );
                update_site_option('nonce_salt', $salt);
            }
        }
    } else {
        // ensure each auth scheme has its own unique salt
        $salt = hash_hmac('md5', $scheme, $secret_key);
    }
    return apply_filters('salt', $secret_key . $salt, $scheme);
}