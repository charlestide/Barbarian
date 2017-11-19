/**
 * Author: Charles.Tide<charlestide@vip.163.com>
 * Date: 2017/11/16.
 */

const
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore');

const
    SchemaConfigEnv = {
        Production: 'pro',
        Development: 'dev'
    };

exports = module.exports = new SchemaConfigReader('default');

exports.SchemaConfigReader = SchemaConfigReader;
exports.SchemaConfigEnv = SchemaConfigEnv;


/**
 * 创建一个reader
 * @param moduleName
 * @constructor
 */
function SchemaConfigReader(moduleName) {
    this.moduleName = moduleName;

    /**
     * 分析config
     * @param config
     * @returns {*}
     */
    this.parse = function (config) {
        let getSchemaConfig = _.propertyOf(config),
            schemaConfig = getSchemaConfig(this.moduleName),
            defaultConfig = getSchemaConfig('default'),
            self = this;


        if (_.isUndefined(schemaConfig)) {
            schemaConfig = {};
        }

        ['base','plugin','pro'].forEach(function (key) {
             if (!_.has(schemaConfig,key)) {
                 schemaConfig[key] = [];
             } else if (!_.isArray(schemaConfig[key])) {
                 schemaConfig[key] = [key];
             }

             if (_.isArray(defaultConfig[key])) {
                 defaultConfig[key].forEach(function (defaultValue) {

                     //如果schemaConfig中不存在default中的正则，则加入
                     if (!_.find(schemaConfig[key],function (moduleValue) {
                             return _.isEqual(moduleValue,defaultValue);
                         })) {

                        if (_.isRegExp(defaultValue)) {
                            let part = defaultValue.toString().split('/');

                            defaultValue = new RegExp(part[1].replace('module-name',self.moduleName),part[2]);
                        }


                         schemaConfig[key].push(defaultValue);
                     }
                 });
             }
        });

        return schemaConfig;
    };

    this.config = this.parse(require('../data/schemas'));
}

/**
 * 添加schemaConfig
 * @param configFilePath
 */
SchemaConfigReader.prototype.addConfig = function (configFilePath) {
    if (path.accessSync(configFilePath)) {
        try {
            let config = JSON.parse(fs.readFileSync(configFilePath));
        } catch (error) {
            throw error;
        }

        this.config = _.extendOwn(this.config,config);
    } else {
        console.error('cannot access schema config file: ' + configFilePath);
    }
};

/**
 * 获取类型信息
 * @param typeName
 * @returns {{include: Array, except: Array}}
 */
SchemaConfigReader.prototype.getTypeInfo = function(typeName) {
    let
        getType = _.propertyOf(this.config),
        type = getType(typeName),
        typeInfo = {
            include: [],
            except: []
        },
        self = this;

    // if (!_.isArray(type)) {
    //     type = {
    //         include: [type]
    //     }
    // }
    //
    // if (_.has(type,'include')) {
    //     typeInfo.include = type.include;
    // } else if (typeName === 'base') {
    //     typeInfo.include.push(this.moduleName);
    // }
    //
    // if (typeName === 'base') {
    //     productionTypeInfo = this.getTypeInfo(SchemaConfigEnv.Production);
    //
    //     if (_.isString(productionTypeInfo.include)) {
    //         productionTypeInfo.include = [productionTypeInfo.include];
    //     }
    //
    //     if (_.isArray(productionTypeInfo.include)) {
    //         productionTypeInfo.include.forEach(function (includeString) {
    //             let includeReg = new RegExp('^' + self.moduleName + '('+includeString.replaced('.','\.') + ')?$','g');
    //             if (!_.find(typeInfo.include,function (item) {
    //                     return _.isEqual(item,includeReg);
    //                 })) {
    //                 typeInfo.include.push(includeReg);
    //             }
    //         })
    //     }
    // }

    // if (_.has(type,'except')) {
    //     typeInfo.except.push(type.except);
    // }

    return typeInfo;
};

/**
 * 判断文件是否是某种类型
 * @param type
 * @param filename
 * @returns {boolean}
 */
SchemaConfigReader.prototype.is = function (type,filename) {
    let typeInfo = this.config[type],
        pathInfo = path.parse(filename),
        result = false;


    if (_.isArray(typeInfo) && typeInfo.length) {
        typeInfo.forEach(function (includeString) {
            if (_.isRegExp(includeString) && pathInfo.name.match(includeString) !== null) {
                result = true;
            } else if (_.isString(includeString) && pathInfo.name.indexOf(includeString) !== -1) {
                result = true;
            }
        });
    }

    return result;
};

/**
 * 是否是基本文件
 * @param filename
 * @param env
 * @returns {boolean}
 */
SchemaConfigReader.prototype.isBase = function (filename,env = null) {
    if (env !== null) {
        if (env === SchemaConfigEnv.Production === !this.isProduction(filename)) {
            return false;
        }
    }

    return this.is('base',filename);
};

/**
 * 是否是生产环境文件
 * @param filename
 * @returns {boolean}
 */
SchemaConfigReader.prototype.isProduction = function (filename) {
    return this.is(SchemaConfigEnv.Production,filename);
};

/**
 * 是否是插件文件
 * @param filename
 * @param env
 * @param pluginNames
 * @returns {boolean}
 */
SchemaConfigReader.prototype.isPlugin = function (filename, env = null, pluginNames = []) {
    if (env !== null) {
        if (env === SchemaConfigEnv.Production === !this.isProduction(filename)) {
            return false;
        }
    }

    let
        pathInfo = path.parse(filename),
        result = false;

    if (this.is('plugin',filename)) {

        if (pluginNames === 'all') {
            return true;
        } else if (_.isArray(pluginNames)) {
            pluginNames.forEach(function (pluginName) {
                if (pathInfo.name.indexOf(pluginName) !== -1) {
                    return result = true;
                }
            });
        }
    }

    return result;
};

/**
 * 解析插件名称
 * @param filename
 * @returns {Array}
 */
SchemaConfigReader.prototype.parsePluginName = function (filename) {
    let result = null;

    if (!_.isArray(this.config.plugin)) {
        this.config.plugin = [this.config.plugin];
    }

    this.config.plugin.forEach(function (regexp) {
        let matchResult = regexp.exec(filename);
        if (matchResult.length > 1) {
            result = matchResult[1];
        }
    });

    return result;
};





