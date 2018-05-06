const ArgumentParser = require('argparse').ArgumentParser;

let parser = new ArgumentParser({
    version: '1.0',
    addHelp:true,
    description: 'Downloads a file in multiple parts'
});
parser.addArgument(
    'target',
    {
        help: 'Target URL',
        type: 'string',
        require
    }
);
parser.addArgument(
    ['-s', '--size'],
    {
        help: 'Size in bytes to download',
        type: 'int'
    }
);
parser.addArgument(
    ['-c', '--chunks'],
    {
        help: 'Number of chunks split download into. Cannot be called with --chunksize',
        type: 'int',
        require
    }
);
parser.addArgument(
    ['-cs', '--chunksize'],
    {
        help: 'Size in byte of chunks to split download into. Cannot be called with --chunks',
        type: 'int'
    }
);
parser.addArgument(
    ['-n', '--name'],
    {
        help: 'Name of output file',
        type: 'string'
    }
);


module.exports = parser;