#!/usr/bin/env node
'use strict';

const fs = require('fs');
const fetch = require('node-fetch');
const {JSDOM} = require('jsdom');
const {Providers, DataURLs} = require('./providers.json');

module.exports = async function saveSearch (provider, query = '') {
  query = encodeURIComponent(query.trim());
  const res = await fetch(DataURLs[Providers[provider]] + query);
  const text = await res.text();
  const {document} = (new JSDOM(text)).window;
  ['script', 'style'].forEach(
    tag => document.body.querySelectorAll(tag).forEach(el => el.remove())
  );

  if (!fs.existsSync(`${__dirname}/searchResults`)) {
    fs.mkdirSync(`${__dirname}/searchResults`);
  }

  const pathName = (
    __dirname
    + '/searchResults/'
    + Providers[provider]
    + '-'
    + query
    + '.html'
  );

  fs.writeFile(pathName, document.body.innerHTML, err => {
    if (err) throw err;
    console.log(pathName + ' saved');
  });
};
