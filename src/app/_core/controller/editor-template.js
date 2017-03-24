/**
 * -----------------------------------------------------------------------------
 * Imports & Settings
 * -----------------------------------------------------------------------------
 */
const _             = require('underscore');
const permission    = 'administrator';


/**
 * -----------------------------------------------------------------------------
 * Functions
 * -----------------------------------------------------------------------------
 */
const template_save = (req, res) => {
    let nonce = req.body.nonce;
    let output = {data: null, nonce: null};

    Parse.Cloud.run('nonce_get', {id: nonce}).then(() => {

        delete req.body.nonce;
        return Parse.Cloud.run('template_post', req.body);

    }, (err) => {

        res.json({error: err});

    }).then((result) => {

        output.data = result.toJSON();
        return Parse.Cloud.run('nonce_create');

    }, (err) => {

        res.json({error: err});

    }).then((nonce) => {

        output.nonce = nonce;
        res.json(output);

    }, (err) => {
        res.json({error: err});
    });
};


/**
 * -----------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------
 */
exports.use = (req, res, next) => {
    jam['rec'] = {};

    /**
     * Permissions
     * Minimum user level: administrator
     */
    if (!core.is_role(permission)) {
        jam['err'] = {code: '403', message: 'Forbidden'};
        res.render('themes/' + jam['theme'] + '/templates/404', jam);
        return;
    }

    // Get template rec if :id specified in url
    if (req.params['id']) {

        let tmp = _.findWhere(jam['templates'], {objectId: req.params.id});
        if (!tmp) {
            res.render('themes/' + jam['theme'] + '/templates/404');
        } else {
            jam['rec'] = tmp;
            next();
        }

    } else {
        next();
    }
};

exports.get = (req, res) => {
	jam['content'] = './sections/editor-template';

	// Get nonce
	Parse.Cloud.run('nonce_create').then((result) => {

		jam['nonce'] = result;
		res.render(appdir + '/_core/view/admin/admin', jam);

	}, (err) => {

		jam['err'] = {code: 400, message: 'Bad Request'};
		res.status(jam.err.code).render('themes/' + jam.theme + '/templates/404', jam);

	});
};

exports.post    = template_save;
exports.put     = template_save;
