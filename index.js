const fs = require('fs');
const _ = require('underscore');
const min = require('minimist')
const c = require('chalk');

const args = min(process.argv.slice(2));
if (args['name'] == null) {
  console.log(c.red('Error: \'name\' parameter required: --name className'));
  return;
}

if (args['attributes'] == null) {
  console.log(c.red('Error: \'attributes\' parameter required: --attributes \'type1 attr1,type2 attr2\''));
  return;
}

let templateStr = fs.readFileSync('./templates/template.cpp').toString();
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

fs.createReadStream('./templates/template.hpp').pipe(fs.createWriteStream(`./${name}/${name}.hpp`));
