/* eslint-disable*/
let levelup = require('levelup');
let leveldown = require('leveldown');
let md5 = require('md5');

const models = {};
const dbs = {};

/**
 *
 * @param {string} id
 * @returns {levelup.default}
 */
async function getLevelDB(id) {
  if (dbs[id]) {
    return dbs[id];
  } 
    var path = "./server/leveldb/" + id;
    var db = levelup(leveldown(path));
    dbs[id] = db;
    return db;
  
}
/**
 *
 */
function getId(url) {
  try {
    const oct = url.split('!1m2!1s')[1].split('!')[0];
    return oct.length > 13 ? oct.slice(0, 14) : 'base';
  } catch (e) {
    return 'base';
  }
}

/**
 *
 * @param {Buffer} buffer
 * @returns {String}
 */
function bufferToString(buffer) {
  try {
    return buffer.toString('hex');
  } catch (e) {
    console.log(e);
    return buffer;
  }
}

/**
 *
 * @param {String} string
 * @returns {Buffer}
 */
function stringToBuffer(string) {
  try {
    return Buffer.from(string, 'hex');
  } catch (e) {
    console.log(e);
    return string;
  }
}

/**
 *
 * @param {String} type
 * @param {string} key
 * @param {Buffer} data
 */
async function saveFileLevel(type, key, data) {
  // const id = getId(key);
  const db = await getLevelDB(type);
  const md5key = md5(key);
  return new Promise(async (resolve, reject) => {
    try {
      db.put(`cache:${md5key}`, data, (err) => {
        if (err) {
          console.log(`存入文件cache ${key}失败`);
          console.log(err);
          reject(err);
        } else {
          // console.log(`存入文件cache ${key}成功`)
          resolve(true);
        }
      });
    } catch (e) {
      console.log(`存入文件cache ${key}失败, ${e}`);
      reject(e);
    }
  });
}

/**
 *
 * @param {String} type
 * @param {string} key
 * @param {Buffer} data
 */
async function existsFileLevel(type, key, data) {
  // const id = getId(key);
  const db = await getLevelDB(type);
  const md5key = md5(key);
  return new Promise(async (resolve, reject) => {
    try {
      db.get(`cache:${md5key}`, (err, value) => {
        if (err) {
          // console.log(err,"existsFileLevel")
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch (e) {
      resolve(false);
      console.log(e, 'existsFileLevel');
    }
  });
}

/**
 *
 * @param {String} type
 * @param {string} key
 * @param {Buffer} data
 */
async function getFileLevel(type, key, data) {
  // const id = getId(key);
  const db = await getLevelDB(type);
  const md5key = md5(key);
  return new Promise(async (resolve, reject) => {
    try {
      db.get(`cache:${md5key}`, (err, value) => {
        if (err) {
          console.log(`读取文件cache ${key}失败`);
          console.log(err);
          reject(err);
        } else {
          // console.log(`读取文件cache ${key}成功`)
          resolve(value);
        }
      });
    } catch (e) {
      console.log(`存入文件cache ${key}失败, ${e}`);
      reject(e);
    }
  });
}

/**
 *
 * @param {String} type
 * @param {string} key
 * @param {Buffer} data
 */
async function removeFileLevel(type, key) {
  // const id = getId(key);
  const db = await getLevelDB(type);
  const md5key = md5(key);
  return new Promise(async (resolve, reject) => {
    try {
      db.del(`cache:${md5key}`, (err) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    } catch (e) {
      reject(e, 'removeFileLevel');
    }
  });
}

// async function test(){
//     let res = await saveFile("obj","1213", "111")

//     await saveFile("obj","12313", "111")
//     await saveFile("obj","12413", "111")
//     await saveFile("obj","12613", "111")
//     await saveFile("obj","12713", "111")
//     await saveFile("obj","12813", "111")
//     // res = await existsFile("obj","1213")
//     // console.log(res)
// }

// test()

const isFinishDownload = async function (oct) {
  let Model = getModel.done;
  try {
    const result = await model.findOne({
      where: { oct },
    });
    return !!result;
  } catch (e) {
    console.log(e, 'isFinishDownload');
    return false;
  }
};

const finishDownload = async function (oct) {
  let Model = getModel.done;
  try {
    const result = await model.findOne({
      where: { oct },
    });
    await model.create({ oct, level: oct.length });
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = {
  saveFile: saveFileLevel,
  existsFile: existsFileLevel,
  getFile: getFileLevel,
  removeFile: removeFileLevel,
  isFinishDownload,
  finishDownload,
};
