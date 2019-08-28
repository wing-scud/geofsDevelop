var express = require("express");
var cors = require("cors");
const crypto = require("crypto");

var path = require("path");
var fs = require("fs");
var fetch = require("node-fetch");
var app = express();

app.use(cors());

var basePath = "./server/tmp";
/**
 *
 * @param {Request} req
 * @param {Response} res
 * @param {*} next
 */
function tileProxy(req, res) {

    //https://www.geo-fs.com

    var baseUrl
    var hashUrl
    if (req.query.baseUrl) {
        baseUrl = req.query.baseUrl.replace("php&", "php?") + "?";
        Object.keys(req.query).map(key => {
                if (key !== "baseUrl") {
                    baseUrl += `${key}=${req.query[key]}&`
                }
            })
            // const hash = crypto.createHash("md5");
            // hash.update(baseUrl);
            // console.log(baseUrl)

    } else {
        baseUrl = 'https://www.geo-fs.com' + req.originalUrl.split("/proxy")[1]
        debugger
    }
    hashUrl = baseUrl.split("/").join("#").split(":").join("#").split(".").join("#").split("?").join("#");
    const filePath = path.resolve(basePath, hashUrl);

    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
    }
    if (fs.existsSync(filePath)) {
        var data = fs.readFileSync(filePath);
        res.send(data);
    } else {
        fetch(baseUrl)
            .then(res => res.buffer())
            .then(data => {
                fs.writeFileSync(filePath, data);
                // console.log("writefile " + filePath)
                res.send(data);
            });
    }
}
app.get("/proxy*", tileProxy);

app.listen(3030, function() {
    console.log("server listen on " + 3030);
});