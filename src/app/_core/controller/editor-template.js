/**
 * -----------------------------------------------------------------------------
 * Imports & Settings
 * -----------------------------------------------------------------------------
 */
const permissions   = ['administrator'];

/**
 * -----------------------------------------------------------------------------
 * Functions
 * -----------------------------------------------------------------------------
 */
const template_use = (req, res, next) => {
    jam['rec'] = {};

    /**
     * Permissions
     */
    if (!core.perm_check(permissions)) {
        jam['err'] = {code: '403', message: 'Forbidden'};
        res.render(core.template.theme + '/404', jam);
        return;
    }

    // Get widgets
    core.add_widgets('template-editor');

    // Get template rec if :id specified in url
    if (req.params['id']) {

        let tmp = _.findWhere(jam['templates'], {objectId: req.params.id});
        if (!tmp) {
            res.render(core.template.theme + '/404', jam);
        } else {
            jam['rec'] = tmp;
            next();
        }

    } else {
        next();
    }
};

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

const template_delete = (req, res) => {

    let nonce = req.body.nonce;
    let output = {
        message: `Deleted Template`,
        redirect: `${jam.baseurl}/admin/templates`
    };

    Parse.Cloud.run('nonce_get', {id: nonce}).then(() => {

        delete req.body.nonce;
        return Parse.Cloud.run('template_delete', req.body);

    }, (err) => {

        res.json({error: err});

    }).then(() => {

        res.json(output);

    }, (err) => {
        res.json({error: err});
    });
};

const template_get = (req, res) => {
    jam['content'] = './sections/editor-template';

    // Get nonce
    Parse.Cloud.run('nonce_create').then((result) => {

        jam['nonce'] = result;
        res.render(core.template.admin, jam);

    }, (err) => {

        jam['err'] = {code: 400, message: 'Bad Request'};
        res.status(jam.err.code).render(core.template.theme + '/404', jam);

    });
};
/**
 * -----------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------
 */
exports.use       = template_use;
exports.get       = template_get;
exports.delete    = template_delete;
exports.post      = template_save;
exports.put       = template_save;
