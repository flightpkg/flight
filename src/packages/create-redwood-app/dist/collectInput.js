#!/usr/bin/env node

const { create } = require('../../../cmds/create')
const prompts = require('prompts');
  
async function init() {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: 'What is your project called?',
    validate: value => create('redwoodjs', value)
  });

  console.log(response); 
};

module.exports = { init }
