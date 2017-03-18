const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const argv = process.argv;
const host = argv[2] || '127.0.0.1';
const port = argv[3] || 81;
console.log(port);

const http = require('http').Server(app);
http.listen(port, function(err) {
     if (err) {
        console.error(err);
        return;
     }
    console.log(`Listening at http://${host}:${port}`);
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/js', express.static(path.resolve(__dirname, './dist/js')));
app.use('/css', express.static(path.resolve(__dirname, './dist/css')));
app.use('/img', express.static(path.resolve(__dirname, './dist/img')));
app.use('/data', express.static(path.resolve(__dirname, './data')));

app.get('/*', function(req, res){
    res.sendFile(path.resolve(__dirname, 'dist/index.html'));
});

app.use(/\/api.*/,function(req, res){
    res.header("Access-Control-Allow-Origin","*");
    var arg = req.body;
    console.log(arg,req.originalUrl)
    res.json(arg);
});
