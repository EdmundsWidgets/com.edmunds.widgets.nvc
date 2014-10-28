var // dependencies
    async = require('async'),
    fs = require('fs'),
    less = require('less'),
    lessApi = require('./api/less.js'),
    path = require('path'),
    temp = require('temp'),
    zipstream = require('zipstream');

// exports
exports.TEMP_DIRECTORY = './temp';

exports.zipOptions = { level: 1 };

exports.zip = function(req, res) {
    var zipFileName = 'tmvwidget-0.1.0.zip',
        zipStream = zipstream.createZip({ level: 1 }),
        requestBody = req.body;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="' + zipFileName + '"');
    zipStream.pipe(res);
    // create temp file
    temp.open('tmv-', function(err, info) {
        var path = info.path,
            files = [
                // js
                { path: './public/js/edm/sdk.js', name: 'js/sdk.js' },
                { path: './public/js/edm/tmvwidget.js', name: 'js/tmvwidget.js' }
            ];
        _buildCSS(requestBody, function(err, css) {
            if (err) throw err;
            fs.write(info.fd, css);
            fs.close(info.fd, function(err) {
                if (err) throw err;
            });
            // add css file
            files.push({
                path: info.path,
                name: 'css/tmvwidget.css'
            });
            // iterator
            function addFile(file, cb) {
                zipStream.addFile(fs.createReadStream(file.path), { name: file.name }, cb);
            };
            // add files to zip
            async.forEachSeries(files, addFile, function(err) {
                if (err) return cb(err);
                zipStream.finalize(function(bytesZipped) {
                    console.log(bytesZipped + ' bytes zippped.');
                    temp.cleanup();
                });
            });
        });

    });
};

function _buildCSS(requestBody, callback) {
    var filename = lessApi.getFileName(requestBody.style);
    fs.readFile(filename, 'utf8', function(error, input) {
        if (error) {
            resp.error('File not found.');
            return console.log(error);
        }
        // add custom variables
        input += lessApi.getVariables(requestBody.variables);
        // compile less to css
        less.render(input, {
            paths: ['src/less/tmvwidget/themes'],
            compress: true
        }, callback);
    });
}

/**
 * Setup temp dir
 * @type {String} path
 */
function _setupTemp(path) {
    try {
        stats = fs.lstatSync(path);
    } catch (err) {
        fs.mkdirSync(path);
    }
    temp.dir = exports.TEMP_DIRECTORY;
}

_setupTemp(exports.TEMP_DIRECTORY);
