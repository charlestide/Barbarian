/**
 * Author: Charles.Tide<charlestide@vip.163.com>
 * Date: 2017/11/11.
 */

const
    program = require('commander'),
    util = require('util'),
    _ = require('underscore'),
    colors = require('colors');

const
    appInfo = require('./package.json'),
    config = require('./config/default.json'),
    scan = require('./src/scan');

program.allowUnknownOption();
program.version(appInfo.version);
program.description(appInfo.description);

program
    .command('scan <dir>')
    .description('扫描指定目录，并输出需要的模块定义')
    .option('-o,--output <outputFile>','输出文件')
    .option('-c,--config <configFile>','指定配置文件')
    .action(function(dir,option){
        console.log(option.config);
        process.exit();
        if (dir) {
            console.log('Path：'+dir.green);
            console.log('Start to Scan..'.yellow);
            let files = scan.scan(dir),
                adapterName = config.adapter,
                adapter = require('./src/cdn/' + adapterName.toLowerCase() + '.js');

            console.log('=>'.blue + ' schemas');
            _.mapObject(files.modules,function (files,schema) {
                console.log(schema + '：' + files.length.toString().green.bold + ' files');

                if (adapter) {
                    adapter.run(schema, null, option.output ? option.output : null);
                }

            });

        } else {
            console.error('Unknown Dir that should be scanned');
        }
    });

program
    .command('run <schema>')
    .description('运行一个模式，输出模块定义')
    .option('-c,--configFile <configFile>','指定配置文件')
    .action(function (schema,options) {
        let config = getConfig(options.configFile);
        console.log(config);
        process.exit();
        if (schema && util.isString(schema)) {
            let adapterName = config.adapter;
            let adapter = require('./src/cdn/' + adapterName.toLowerCase() + '.js');

            adapter.run(schema);
        } else {
            console.error('Unknown Schema'.red+': '+ schema);
        }
    });

program
    .command('info <module>')
    .description('show information about module')
    .action(function (module) {
        if (util.isString(module)) {
            let adapterName = config.adapter;
            let adapter = require('./src/cdn/' + adapterName.toLowerCase() + '.js');

            adapter.info(module);
        }
    });


program.on('--help', () => {
    console.log('  Examples:');
    console.log('');
    console.log('    $ createDOC --help');
    console.log('    $ createDOC -h');
    console.log('    $ createDOC show');
    console.log('');
    checkConfig();
});

program.parse(process.argv);

function getConfig(userConfigFile) {

    if (!userConfigFile) {
        console.log('[warn]'.yellow + ' no user defined config file specified'.bold);
        console.log('specify a own config file is recommended'.blue.bold);
        console.log('');
        console.log('you can specify some thing below in that config file:');
        console.log('');
        console.log('    specify a few folder to scan where ' + 'scan'.green + ' section');
        console.log('    specify a few extname to filter files with ' + 'exts'.green + ' section');
        console.log('    specify a file to store schema file');

    }

    return new require('./src/userConfig')(userConfigFile);
}