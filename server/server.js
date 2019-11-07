/* eslint-disable */
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
let {terrainProxy} = require("./proxy")
const app = express();

app.use(cors());

const basePath = './server/tmp';
/**
 *
 * @param {Request} req
 * @param {Response} res
 * @param {*} next
 */
function tileProxy(req, res) {

  // https://www.geo-fs.com

  let baseUrl;
  let hashUrl;
  if (req.query.baseUrl) {
    baseUrl = `${req.query.baseUrl.replace('php&', 'php?')}?`;
    Object.keys(req.query).map((key) => {
      if (key !== 'baseUrl') {
        baseUrl += `${key}=${req.query[key]}&`;
      }
    });
    // const hash = crypto.createHash("md5");
    // hash.update(baseUrl);
    // console.log(baseUrl)

  } else {
    baseUrl = `https://www.geo-fs.com${req.originalUrl.split('/proxy')[1]}`;
    debugger;
  }
  hashUrl = baseUrl.split('/').join('#').split(':').join('#')
    .split('.')
    .join('#')
    .split('?')
    .join('#');
  const filePath = path.resolve(basePath, hashUrl);

  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
  }
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    res.send(data);
  } else {
    fetch(baseUrl)
      .then(res => res.buffer())
      .then((data) => {
        fs.writeFileSync(filePath, data);
        // console.log("writefile " + filePath)
        res.send(data);
      });
  }
}

app.get("/terrain/:id/*", terrainProxy);
app.get('/proxy*', tileProxy);

app.listen(3030, () => {
  console.log(`server listen on ${  3030}`);
});
