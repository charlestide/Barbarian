/**
 * Author: Charles.Tide<charlestide@vip.163.com>
 * Date: 2017/11/13.
 */


const
    request = require('sync-request'),
    cheerio = require('cheerio'),
    url = require('url'),
    _ = require('underscore'),
    path = require('path'),
    SchemaConfigReader = require('../schemaConfigReader').SchemaConfigReader,
    CDN = require('../cdn').CDN;

exports = module.exports = new BootCDN();

exports.BootCDN = BootCDN;


function BootCDN() {
    CDN.call(this);
}

require('util').inherits(BootCDN,CDN);

/**
 * 显示包的信息
 * @param moduleName
 */
BootCDN.prototype.info = function (moduleName) {

    let info = {
        name: moduleName,
        page: 'http://www.bootcss.com/'+moduleName,
        latest: null,
        stable: null,
        description: null,
        schemas: [],
        versions: [],
        plugins:[],
        docs: [],
    },
    self = this,
    schemaConfigReader = new SchemaConfigReader(moduleName),
    $ = this.request(moduleName);


    let versionInfo = self.parseVersions($);
    info.stable = versionInfo.stable;
    info.latest = versionInfo.latest;
    info.versions = versionInfo.versions;
    info.schemas = versionInfo.alias;


    //description
    info.description = $('h1').next().text();

    //related links
    $('a', 'div.package-info').each(function (index,item) {
        let link = url.parse($(item).attr('href'));

        if (link.protocol) {
            info.docs.push({
                name: $(item).text(),
                link: $(item).attr('href')
            });
        }
    });

    //plugins
    let files = self.getFilesByVersion(info.stable,$);
    files.forEach(function (fileInfo) {
        if (schemaConfigReader.isPlugin(fileInfo.filename,'pro','all')) {

            pluginName = schemaConfigReader.parsePluginName(fileInfo.filename);
            info.plugins.push({
                name: pluginName,
                link: fileInfo.href
            });
        }
    });

    self.printInfo(info);
};

/**
 * 解析版本
 * @param $
 * @returns {{stable: null, latest: null, alias: Array, versions: Array}}
 */
BootCDN.prototype.parseVersions = function ($) {
    let versionInfo = {
        stable: null,
        latest: null,
        alias: [],
        versions: []
    };


    let versionA = $('a.version-anchor');
    if (versionA.length) {
        versionInfo.latest = versionA.attr('id');
        let schemasKeys = [];
        versionA.each(function (index,item) {
            let versionName = $(item).attr('id');
            if (versionInfo.stable === null && versionName.indexOf('beta') === -1 && versionName.indexOf('alpha') === -1) {
                versionInfo.stable = versionName;
            }
            versionInfo.versions.push(versionName);
            let matches = /^[0-9]+\.[0-9]+/.exec(versionName);
            if (matches) {
                if (!_.contains(schemasKeys,matches[0])) {
                    versionInfo.alias.push({name: matches[0], version: versionName});
                }
            }
            schemasKeys.push(matches[0]);
        });
    }

    return versionInfo;
};

/**
 * 返回指定版本的文件信息
 * @param version
 * @param $
 * @returns {Array}
 */
BootCDN.prototype.getFilesByVersion = function(version,$) {

    let versionAnchor = $('#'+version.replace(/\./g,'\\.')),
        versionPackage = versionAnchor.next().next('.package-version'),
        libraries = $('span.library-url',versionPackage),
        result = [];

    if (libraries.length) {
        libraries.each(function (index, item) {
            let link = url.parse($(item).text()),
                pathParts = link.pathname.split('/'),
                basename = path.basename(link.path);

            if (pathParts.length > 2 && version === pathParts[2]) {
                let fileInfo = {
                    version: pathParts[2],
                    category: pathParts[3],
                    filename: basename,
                    path: link.path,
                    href: link.href,
                    ext: path.extname(basename).substring(1)
                };

                result.push(fileInfo);
            }
        });
    }

    return result;
};

/**
 * 请求
 * @param moduleName
 * @returns cheerio
 */
BootCDN.prototype.request = function (moduleName) {
    let
        url = 'http://www.bootcdn.cn/' + moduleName + '/',
        $ = null;

    let result = request('GET',url);

    if (result.statusCode === 200) {
        return cheerio.load(result.getBody().toString());
    } else {
        return false;
    }

};