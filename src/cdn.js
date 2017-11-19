/**
 * Author: Charles.Tide<charlestide@vip.163.com>
 * Date: 2017/11/13.
 */

const
    config = require('../config/default.json'),
    fs = require('fs'),
    _ = require('underscore'),
    path = require('path'),
    cheerio = require('cheerio'),
    SchemaConfigReader = require('./schemaConfigReader').SchemaConfigReader,
    colors = require('colors');


exports = module.exports = new CDN();

exports.CDN = CDN;

function CDN() {
    this.includeMap = require('./includeMap');
}

/**
 * 输出匹配的文件
 * @param schema
 * @param $ cheerio
 * @param outputFile
 */
CDN.prototype.run = function (schema,$ = null,outputFile = null) {
    let schemaInfo = this.parseSchema(schema),
        schemaConfigReader = new SchemaConfigReader(schemaInfo.moduleName),
        self = this;


    if (_.isEmpty($)) {
        this.runWith$(schemaInfo,$);
        $ = this.request(schemaInfo.moduleName);
    }

    let versionInfo = this.parseVersions($);

    switch (schemaInfo.version) {
        case 'stable':
            schemaInfo.version = versionInfo.stable;
            break;
        case 'latest':
            schemaInfo.version = versionInfo.latest;
            break;
    }

        files = this.getFilesByVersion(schemaInfo.version,$);


    files.forEach(function (fileInfo) {
        if (schemaConfigReader.isBase(fileInfo.filename,schemaInfo.env)) {
            self.includeMap.add(schemaInfo.schema,fileInfo);
        }

        if (schemaInfo.plugins.length && schemaConfigReader.isPlugin(fileInfo.filename,schemaInfo.env,schemaInfo.plugins)) {
            self.includeMap.add(schemaInfo.schema,fileInfo);
        }
    });

    this.output(outputFile);

    return self.includeMap;

};

/**
 * 根据已经转为cheerio对象html，来输出匹配的文件
 * @param schemaInfo
 * @param $
 * @param outputFile
 * @returns {IncludeMap}
 */
CDN.prototype.runWith$ = function (schemaInfo,$, outputFile = null) {



};

/**
 * 打印module信息
 * @param info
 */
CDN.prototype.printInfo = function(info) {

    console.log(colors.green(info.name) + ' stable v' + info.stable);
    console.log(info.description);
    console.log('From: '+ colors.underline(info.page));

    console.log('==>'.blue + ' Schemas');
    console.log('stable => ' + info.stable);
    console.log('latest => ' + info.latest);
    info.schemas.forEach(function (version) {
       console.log(version.name + ' => ' + version.version);
    });
    console.log('==>'.blue + ' Document');
    info.docs.forEach(function (item) {
       console.log(item.name+' : '+item.link);
    });
    console.log('==>'.blue + ' Plugins of stable');
    info.plugins.forEach(function (plugin) {
        console.log(plugin.name,plugin.link);
    })
};

/**
 * 分析schema，返回schemaInfo对象
 * @param schema
 * @returns {{schema: *, moduleName: *, version: *, env: *, plugins: (Item[]|Array|*)}}
 */
CDN.prototype.parseSchema = function (schema) {
    let result = _.without(schema.split(/([#@\%]?[^\%#@]+)/),'');
    let schemaInfo = {
        schema: schema,
        moduleName: null,
        version: null,
        env: null,
        plugins: []
    };

    result.forEach(function (item) {
        let initial = item.substring(0,1),
            name = item.substring(1);

        switch (initial) {
            case '#':
                schemaInfo.env = name;
                break;
            case '@':
                schemaInfo.version = name;
                break;
            case '%':
                schemaInfo.plugins = _.without(name.split(','),'',null);
                break;
            default:
                schemaInfo.moduleName = initial+name;
        }
    });

    if (!schemaInfo.version) {
        schemaInfo.version = 'stable';
    }

    if (['pro','dev'].indexOf(schemaInfo.env) === -1) {
        schemaInfo.env = 'pro';
    }

    return schemaInfo;

};

/**
 * 输出到文件
 * @param filename
 */
CDN.prototype.output = function(filename = null) {
    if (filename) {
        let modules = this.includeMap.modules;

        try {
            fs.accessSync(filename, fs.constants.F_OK);

            let tmpModules = JSON.parse(fs.readFileSync(filename));
            if (tmpModules) {
                modules = _.extend(tmpModules,modules);
            }

        } catch (error) {
            console.error('cannot write to output file: '+filename);
        }

        fs.writeFileSync(filename, JSON.stringify(modules));
    } else {
        console.log(JSON.stringify(this.includeMap.modules));
    }
};