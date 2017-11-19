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
    .action(function(dir,option){
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
    .command('run')
    .description('运行一个模式，输出模块定义')
    .action(function (schema) {
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
});

program.parse(process.argv);