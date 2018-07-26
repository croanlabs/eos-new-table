#!/usr/bin/env node
const fs = require('fs');
const _ = require('underscore');
const min = require('minimist')

const args = min(process.argv.slice(2));
if (args['name'] == null || args['attributes'] == null || args['help']) {
  console.log( `\nGenerate EOS C++ smart contract to create a table on the blockchain.
  Options:
  --name          Name of the element to be represented. e.g. user
  --attributes    Semicolon separated list of attributes of the element with their types.
                  e.g. 'std::string name; uint64_t token_amount'
  --table-name    Name of the table to be created. If not defined the name parameter will be used.
  --help          Show this help message.
  `);
  process.exit();
}

const name = args['name'];
const className = `${name}_management`;
const tableName = args['table-name'];
const attrs = args['attributes'];

// Generate list: [[type1, prop1], ... , [typen, propn]]
const attrsList = attrs
  .split(';')
  .filter(a => (a != ''))
  .map(a => {
    a = a.trim();
    let i = a.length;
    let found = false;
    while (!found && i >= 0) {
      if (a[i] == ' ') {
        found = true;
      } else {
        i--;
      }
    }
    if (!found) {
      console.log(`Parameter does not have expected format: ${a}`);
      process.exit();
    }
    return [a.substr(0,i), a.substr(i+1, a.length - i - 1)];
  });

// Generate attribute assigns for insert function of the contract
let insertAssigns = '';
attrsList.forEach(attr => {
  insertAssigns += `\n        new_${name}.${attr[1]} = ${attr[1]};`;
});

// Generate param list with the attributes as they would be passed to
// a function.
let attrsParamList = attrs
  .split(';')
  .filter(a => (a != ''))
  .map(a => a.trim())
  .join(', ');

// Generate underscore template and replace values generating cpp's file content
let templateStr = fs.readFileSync(`${__dirname}/templates/template.cpp`).toString();
let template = _.template(templateStr);
const cppContent =
  template({
    name,
    className,
    tableName: tableName || name,
    attrs: attrsList,
    attrsParamList,
    insertAssigns
  });

// Create output folder and files
try {
  fs.mkdirSync(`./${name}`);
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

fs.writeFile(`./${name}/${name}.cpp`, cppContent, (err) => {
  if (err) throw err;
});

fs.createReadStream(`${__dirname}/templates/template.hpp`)
  .pipe(fs.createWriteStream(`./${name}/${name}.hpp`));
