import { program } from 'commander';

program
    .name('sandcli')
    .description('A sand simulation and more in the CLI')
    .version('1.0.0')

    .argument('[world]', 'World file to open')

    .option('-v, --verbose', 'Enable verbose logging')
    .option('-n, --new <name>', 'Make a new world file')
    .option('-s, --size <size>', 'Sets the size of the new world. Options are tiny, small, normal, large, giant, or <width>x<height>.');

program.parse();

const options = program.opts();
const args = program.args;

export { options, args };