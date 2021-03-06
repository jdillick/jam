const permissions   = ['administrator'];

exports.use = (req, res, next) => {
    /**
     * Permissions
     */
    if (!core.perm_check(permissions)) {
        jam['err'] = {code: '403', message: 'Forbidden'};
        res.render(core.template.theme + '/404', jam);
    }  else {
        next();
    }
};

exports.all = (req, res) => {
    jam.content = './sections/list-templates';

    res.render(core.template.admin, jam);
};
