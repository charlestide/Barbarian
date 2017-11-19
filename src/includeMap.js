/**
 * Author: Charles.Tide<charlestide@vip.163.com>
 * Date: 2017/11/18.
 */

const
    _ = require('underscore'),
    fs = require('fs');

exports = module.exports = new IncludeMap();

exports.IncludeMap = IncludeMap;

/**
 * 输出待JS导入的文件map
 * @constructor
 */
function IncludeMap() {
    this.modules = {};
}

/**
 * 添加module
 * @param moduleName
 * @param fileInfo
 */
IncludeMap.prototype.add = function(moduleName, fileInfo) {
    if (!_.has(this.modules,moduleName)) {
         this.modules[moduleName] = this.createEmptyModule();
    }

    let module = this.modules[moduleName];

    switch (fileInfo.ext) {
        case 'css':
            module.css.push(fileInfo.href);
            break;
        case 'js':
            module.js.push(fileInfo.href);
            break;
        case 'svg':
            module.font.push(fileInfo.href);
            break;
    }
};


/**
 * 返回一个空的module对象
 * @returns {{js: Array, css: Array, font: Array}}
 */
IncludeMap.prototype.createEmptyModule = function () {
    return {
        js: [],
        css: [],
        font: []
    };
};

/**
 * 输出到文件
 * @param filePath
 */
IncludeMap.prototype.toFile = function (filePath) {
    return fs.writeFileSync(filePath, JSON.stringify(this.modules));
};