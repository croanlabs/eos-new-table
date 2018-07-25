const fs = require('fs');
const _ = require('underscore');
const min = require('minimist')
const c = require('chalk');

const args = min(process.argv.slice(2));
if ((args['n'] || args['name']) == null) {
  console.log(c.red('Error: \'name\' parameter required: --name className'));
  return;
}

if ((args['a'] || args['attributes']) == null) {
  console.log(c.red('Error: \'attributes\' parameter required: --attributes \'type1 attr1,type2 attr2\''));
  return;
}

let templateStr = fs.readFileSync('./templates/template.cpp').toString();
let template = _.template(templateStr);
console.log(
  template({
    name: args['name'],
    tableName: args['table-name'] || args['name'],
    fields: args['attributes'].split(',').map(a => a.trim().split(' '))
  }),
);
