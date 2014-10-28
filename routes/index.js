//exports.glance = require('./glance/glance');
exports.index = function(req, res) {
    res.render('index', { title: 'Edmunds Widgets', url: req.protocol + '://' + req.headers.host });
};