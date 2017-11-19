/**
 * Author: Charles.Tide<charlestide@vip.163.com>
 * Date: 2017/11/13.
 */

const
    _ = require('underscore');

exports = module.exports = new ModuleMap();

exports.ModuleMap = ModuleMap;

/**
 * 保存搜索出来的module列表
 * @constructor
 */
function ModuleMap() {
    this.modules = [];
    this.count = 0;
}

/**
 * 添加module
 * @param moduleName
 * @param filePath
 */
ModuleMap.prototype.add = function(moduleName,filePath) {
    if (this.modules.indexOf(moduleName) === -1) {
        moduleFiles = [];
    } else {
        moduleFiles = this.modules[moduleName];
        if (!_.isArray(moduleFiles)) {
            moduleFiles = [];
        }
    }

    moduleFiles.push(filePath);

    this.modules[moduleName] = moduleFiles;
    this.count ++;

};

/**
 * 添加多个module
 * @param moduleNames 用,分隔
 * @param filePath
 */
ModuleMap.prototype.addModules = function (moduleNames,filePath) {
    let self = this;

    if (moduleNames.indexOf(',') !== -1) {
        let modules = moduleNames.split(',');
        if (_.isArray(modules)) {
            modules.forEach(function (moduleName) {
                self.add(moduleName,filePath);
            })
        }
    } else {
        self.add(moduleNames,filePath);
    }
};