exports.about = function(req, res) {
    res.render('carconfig/about', { title: 'About', url: req.protocol + '://' + req.headers.host });
};