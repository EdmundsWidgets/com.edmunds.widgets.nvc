exports.carconfig = function(req, res) {
    res.render('carconfig/carconfig', {
        title: 'Edmunds Widgets - New Vehicle Configurator Widget',
        url: req.protocol + '://' + req.headers.host,
        portal: req.query.portal === 'true',            // used by developers portal to hide some elements from the page
        debug: req.query.debug === 'true'
    });
};

exports.iFrameContent = function(req, res) {
    var query = req.query;
    res.render('carconfig/iframe', {
        themeCssUrl: getThemeCssUrl(query),
        additionalCssUrl: getAdditionalCssUrl(query),
        //
        vehicleApiKey:  query.vak || '',
        dealerApiKey:   query.dak || '',
        widgetOptions:  JSON.stringify({
            includedMakes:  query.im || '',
            colorScheme:    query.cs || 'light',
            zip:            query.zip || '',
            dealerKeywords: JSON.parse(query.dk || '[]'),
            tabs: {
                tab1: query.t1,
                tab2: query.t2,
                tab3: query.t3
            }
        }, null, 4),
        debug: req.query.debug === 'true'
    });
};

function getThemeCssUrl(options) {
    var theme = options.th || 'simple',
        colorScheme = options.cs || 'light';
    return '/css/carconfig/' + theme + '-' + colorScheme + '.css';
}

function getAdditionalCssUrl(options) {
    return '/api/carconfig/less?' + [
        'style[theme]=' + options.th || 'simple',
        'style[colorScheme]=' + options.cs || 'light',
        'style[layout]=vertical',
        'variables[width]=' + options.w,
        'variables[height]=' + options.h,
        'variables[borderWidth]=' + options.b,
        'variables[borderRadius]=' + options.br || '0px',
        'type=css'
    ].join('&');
}