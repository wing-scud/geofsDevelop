/* eslint-disable linebreak-style */
const { saveFile, existsFile, getFile } = require('./store');
const fs = require('fs');
const fetch = require('node-fetch');
const HttpsProxyAgent = require('https-proxy-agent');

const proxy = 'http://localhost:1080';
const agent = new HttpsProxyAgent(proxy);
async function requestFileGet(baseUrl, filename, resp, type) {
  const data = await fetch(baseUrl, {
    // agent: agent
  }).then(res => res.buffer());
  saveFile(type, filename, data);
  resp.send(data);
}
// app.get("/google/:type/:z/:x/:y", googleProxy);
async function googleProxy(req, resp) {
  const { type, z, x, y } = req.params;
  let url;
  if (type === 'map') {
    url = `http://mt2.google.cn/vt/x=${x}&y=${y}&z=${z}`;
  } else {
    url = `http://www.google.cn/maps/vt?lyrs=s@709&gl=cn&x=${x}&y=${y}&z=${z}`;
  }
  if (await existsFile(`google${type}`, url)) {
    const data = await getFile(`google${type}`, url);
    resp.end(data);
  } else {
    requestFileGet(url, url, resp, `google${type}`);
  }
}

async function requestFileGet2(baseUrl, filename, resp, type) {
  const data = await fetch(baseUrl, {
    agent,
    headers: {
      Accept: 'application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01,*/*;access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYTdiZmYwOC04NjFjLTQ3ZjQtYjVjZC0zN2MzMmFlMWQ1ODgiLCJpZCI6NjYwLCJhc3NldHMiOnsiMSI6eyJ0eXBlIjoiVEVSUkFJTiIsImV4dGVuc2lvbnMiOlt0cnVlLHRydWUsdHJ1ZV0sInB1bGxBcGFydFRlcnJhaW4iOmZhbHNlfX0sInNyYyI6ImRhNTBjNTU1LTAxNmEtNDA4NS1iZmFlLTFhY2E3NjkyYjQ1NSIsImlhdCI6MTU2NzUzMzMwOCwiZXhwIjoxNTY3NTM2OTA4fQ.toFtIIQ7asgEf-YuzRak8la5FtYYfLMBNykg-6tFg7E',
      DNT: 1,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
    },
  }).then((res) => {
    if (baseUrl.search('json') > -1) {
      return res.text();
    }
    return res.buffer();

  });

  if (baseUrl.search('json') > -1) {
    if (data.search('InvalidCredentials') > -1 || data.search('ResourceNotFound') > -1) {
      console.log('验证失败', data);
    } else {
      saveFile(type, filename, data);
    }
  } else {
    saveFile(type, filename, data);
  }

  resp.send(data);
}
async function terrainProxy(req, resp) {
  const path = req.originalUrl.split('/terrain/')[1];
  const url = `https://assets.cesium.com/${ path}`;
  const id = req.params.id === '1' ? '' : req.params.id;
  console.log(url);
  if (await existsFile(`terrain${id}`, url)) {
    const data = await getFile(`terrain${id}`, url);
    resp.end(data);
  } else {
    requestFileGet2(url, url, resp, `terrain${id}`);
  }
}

/*
Accept:
DNT: 1
Origin: https://cesiumjs.org
Referer: https://cesiumjs.org/Cesium/Build/Apps/Sandcastle/standalone.html
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36
*/
const keys = {
  29328: 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYjY3ZTRlNi0zOGRhLTRjZTgtOGVkMi01ZmMwMGU5MTJjMjAiLCJpZCI6NjYwLCJhc3NldHMiOnsiMjkzMjgiOnsidHlwZSI6IjNEVElMRVMifX0sInNyYyI6ImRhNTBjNTU1LTAxNmEtNDA4NS1iZmFlLTFhY2E3NjkyYjQ1NSIsImlhdCI6MTU2NzUzMzQzMSwiZXhwIjoxNTY3NTM3MDMxfQ.YITQXbeHLq6P1RT5U0ktp2Ofhuwfq-A4hgl-3OYHASo',
  29332: 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYmJlZGU2ZC1kODYyLTQ1NTgtODA0YS0zMGI0ZWRiMTE4MzMiLCJpZCI6NjYwLCJhc3NldHMiOnsiMjkzMzIiOnsidHlwZSI6IjNEVElMRVMifX0sInNyYyI6ImRhNTBjNTU1LTAxNmEtNDA4NS1iZmFlLTFhY2E3NjkyYjQ1NSIsImlhdCI6MTU2NzUzMzU5MywiZXhwIjoxNTY3NTM3MTkzfQ.2yu3qA_sdZlNvY_6NW1fJhPVni43eXlUP3n_vcO_5FY',
  29334: 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NDY3MmM1OC02MzNmLTQyODUtODllNS0yN2E4ZmU3MzU1ZmIiLCJpZCI6NjYwLCJhc3NldHMiOnsiMjkzMzQiOnsidHlwZSI6IjNEVElMRVMifX0sInNyYyI6ImRhNTBjNTU1LTAxNmEtNDA4NS1iZmFlLTFhY2E3NjkyYjQ1NSIsImlhdCI6MTU2NzUzMzY5MiwiZXhwIjoxNTY3NTM3MjkyfQ.alrdKJNi-BwbrmAQDUAOlyK1TcDMoYc3wdgq1ZgYGhw',
};
async function requestFileGet3(baseUrl, filename, resp, type, id) {
  // console.log(keys[id])
  const data = await fetch(baseUrl, {
    agent,
    headers: {
      Accept: keys[id],
      DNT: 1,
      Origin: 'https://cesiumjs.org',
      Referer: 'https://cesiumjs.org/Cesium/Build/Apps/Sandcastle/standalone.html',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
    },
  }).then((res) => {
    if (baseUrl.search('json') > -1) {
      return res.text();
    }
    return res.buffer();

  });

  if (baseUrl.search('json') > -1) {
    if (data.search('InvalidCredentials') > -1 || data.search('ResourceNotFound') > -1) {
      console.log('验证失败', data);
    } else {
      saveFile(type, filename, data);
    }
  } else {
    saveFile(type, filename, data);
  }

  resp.send(data);
}
async function cesiumProxy(req, resp) {
  const path = req.originalUrl.split('/cesium/')[1];
  const url = `https://assets.cesium.com/${ path}`;
  const id = req.params.id === '1' ? '' : req.params.id;
  console.log(url);
  if (await existsFile(`terrain${id}`, url)) {
    const data = await getFile(`terrain${ id}`, url);
    resp.end(data);
  } else {
    requestFileGet3(url, url, resp, `terrain${id}`, id);
  }
}

async function cloudProxy(req, resp) {
  const path = req.originalUrl.split('/cloud/')[1];
  const url = `https://storage.googleapis.com/${path}`;
  // https://storage.googleapis.com/earth-animated-clouds/video/201909050900/2/0/2.webm
  if (await existsFile('googlecloud', url)) {
    const data = await getFile('googlecloud', url);
    resp.end(data);
  } else {
    requestFileGet(url, url, resp, 'googlecloud');
  }
}

module.exports = {
  cloudProxy,
  googleProxy,
  terrainProxy,
  cesiumProxy,
};
