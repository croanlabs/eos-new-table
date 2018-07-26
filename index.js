#!/usr/bin/env node
const fs = require('fs');
const _ = require('underscore');
const min = require('minimist')

const args = min(process.argv.slice(2));
if (args['name'] == null || args['attributes'] == null || args['help']) {
  console.log( `\nGenerate EOS C++ smart contract to create a table on the blockchain.
  Options:
  --name          Name of the element to be represented. e.g. user
  --attributes    Comma separated list of attributes of the element with their types.
                  e.g. 'std::string name, uint64_t token_amount'
  --table-name    Name of the table to be created. If not defined the name parameter will be used.
  --help          Show this help message.
  `);
  process.exit();
}

let templateStr = fs.readFileSync(`${__dirname}/templates/template.cpp`).toString();
let template = _.template(templateStr);

const name = args['name'];
const className = `${name}_management`;
const tableName = args['table-name'];
const attrs = args['attributes'];
const attrsList = attrs.split(',').map(a => a.trim().split(' '));

let insertAssigns = '';
attrsList.forEach(attr => {
  insertAssigns += `\n        new_${name}.${attr[1]} = ${attr[1]};`;
});

const cppContent =
  template({
    name,
    className,
    tableName: tableName || name,
    attrs: attrs.split(',').map(a => a.trim().split(' ')),
    attrsParamList: attrs.split(',').map(a => a.trim()).join(', '),
    insertAssigns
  });

try {
  fs.mkdirSync(`./${name}`);
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

fs.writeFile(`./${name}/${name}.cpp`, cppContent, (err) => {
  if (err) throw err;
});

fs.createReadStream(`${__dirname}/templates/template.hpp`).pipe(fs.createWriteStream(`./${name}/${name}.hpp`));
