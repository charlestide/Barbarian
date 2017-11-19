/**
 * Author: Charles.Tide<charlestide@vip.163.com>
 * Date: 2017/11/11.
 */

const
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    slog = require('single-line-log').stdout;
    config = require('config');

    let moduleMap = require('./moduleMap');

exports = module.exports = new Scan();

exports.Scan = Scan;

/**
 * 搜索指定目录下的require语句
 * @constructor
 */
function Scan() {
    this.path = '';
    this.files = [];
    this.modules = new moduleMap.ModuleMap();
}

/**
 * 搜索指定目录
 * @param dirPath
 */
Scan.prototype.scan = function(dirPath = null) {
    if (dirPath !== null) {
        dirPath = "/Users/yuyu/Documents/workspace/AnotherWorld/Admin/public/js";
    }

    this.path = dirPath;

    this.scanDir(dirPath);
    console.log(this.files.length.toString().green.bold + ' Files to be Scan');

    return this.scanModules();
};

/**
 * 递归搜索指定目录
 * @param dirPath
 */
Scan.prototype.scanDir = function(dirPath = null) {
    self = this;
    let files = fs.readdirSync(dirPath);

    files.forEach(function (file) {
        filePath = dirPath+'/'+file;
        let stats = fs.statSync(filePath);
        // slog('Scanning dir：'+dirPath);
        if (stats.isDirectory()) {
            self.scanDir(filePath);
        } else if (stats.isFile() && path.extname(filePath) === '.js') {
             self.files.push(filePath);
        }
    });

};

/**
 * 在this.files中搜索require语句，并将找到的保存在this.modules中
 * @returns {Array}
 */
Scan.prototype.scanModules = function () {
    let self = this;
    let reg = /require\([\'\"]{1}([\w,]+)[\'\"]{1}\)/g;

    this.files.forEach(function (filePath) {
        if (fs.existsSync(filePath)) {
            // slog('Scanning File: '+filePath);
            let fileContent = fs.readFileSync(filePath);
            let result = reg.exec(fileContent);
            if (result && result.length) {
                // let module = {
                //     name: result[1],
                //     ori: result[0],
                //     index: result.index,
                //     file: filePath
                // };
                self.modules.addModules(result[1],filePath);
            }
        }
    });

    return self.modules;
};

