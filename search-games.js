#!/usr/bin/env node
'use strict';

/*
 * List of all steam apps (4MB JSON file):
 * https://api.steampowered.com/ISteamApps/GetAppList/v2
 */

const fetch = require('node-fetch');
const {JSDOM} = require('jsdom');
const {Providers, BaseURLs} = require('./providers.json');

const parseResults = {
  epic (document) {
    const results = [...document.body.querySelectorAll('a')].filter(a => (
      a.getAttribute('href')
      && a.getAttribute('href').startsWith('/store/en-US/product/')
    ));
    if (!results.length) throw {message: 'No results found'};
    return results.map(a => {
      const id = (() => {
        return undefined;
      })();

      const image = (() => {
        if ([...a.querySelectorAll('img')].filter(img => (
          img.getAttribute('src')
          && img.getAttribute('src').startsWith('https://cdn1.epicgames.com/')
        ))[0]) {
          return [...a.querySelectorAll('img')].filter(img => (
            img.getAttribute('src')
            && img.getAttribute('src').startsWith('https://cdn1.epicgames.com/')
          ))[0].src;
        }
        return undefined;
      })();

      const platforms = (() => {
        return [];
      })();

      const price = (() => {
        if ([...a.querySelectorAll('span')].filter(span => (
          span.getAttribute('class')
          && span.getAttribute('class').startsWith('StoreCard-price')
        ))[0]) {
          return [...a.querySelectorAll('span')].filter(span => (
            span.getAttribute('class')
            && span.getAttribute('class').startsWith('StoreCard-price')
          ))[0].textContent.trim();
        }
        return undefined;
      })();

      const release_date = (() => {
        return undefined;
      })();

      const title = (() => {
        if (a.querySelector('h3')) {
          return a.querySelector('h3').textContent.trim();
        }
        return undefined;
      })();

      const url = (() => {
        if (a.href) {
          return 'https://www.epicgames.com' + a.href;
        }
        return undefined;
      })();

      return {
        id,
        image,
        platforms,
        price,
        release_date,
        title,
        url,
      };
    });
  },

  itch (document) {
    const results = [...document.querySelectorAll('div[data-game_id]')];
    if (!results.length) throw {message: 'No results found'};
    return results.map(div => {
      const id = (() => {
        if (div.dataset.game_id) {
          return div.dataset.game_id;
        }
        return undefined;
      })();

      const image = (() => {
        if (
          div.querySelector('a > div')
          && div.querySelector('a > div').dataset.background_image
        ) {
          return div.querySelector('a > div').dataset.background_image;
        }
        return undefined;
      })();

      const platforms = (() => {
        return [];
      })();

      const price = (() => {
        if (div.querySelector('.price_value')) {
          return div.querySelector('.price_value').textContent.trim();
        }
        return undefined;
      })();

      const release_date = (() => {
        return undefined;
      })();

      const title = (() => {
        if (div.querySelector('.game_cell_data > .game_title > a')) {
          return div.querySelector('.game_cell_data > .game_title > a').textContent.trim();
        }
        return undefined;
      })();

      const url = (() => {
        if (div.querySelector('.game_cell_data > .game_title > a')) {
          return div.querySelector('.game_cell_data > .game_title > a').href;
        }
        return undefined;
      })();

      return {
        id,
        image,
        platforms,
        price,
        release_date,
        title,
        url,
      };
    });
  },

  steam (document) {
    const results = [...document.body.querySelectorAll(
      '#search_result_container a'
    )].filter(
      a => (
        a.getAttribute('href')
        && a.getAttribute('href').startsWith('https://store.steampowered.com/app/')
      )
    );
    if (!results.length) throw {message: 'No results found'};
    return results.map(a => {
      const id = (() => {
        if (a.dataset.dsAppid) {
          return a.dataset.dsAppid;
        }
        return undefined;
      })();

      const image = (() => {
        if (a.querySelector('div > img')) {
          return a.querySelector('div > img').src;
        }
        return undefined;
      })();

      const platforms = (() => {
        const platforms = [];
        const platformList = [
          'android',
          'ios',
          'linux',
          'mac',
          'win',
        ];
        for (const span of a.querySelectorAll('.platform_img')) {
          for (const platform of platformList) {
            if (span.classList.contains(platform)) {
              platforms.push(platform);
            }
          }
        }
        return platforms;
      })();

      const price = (() => {
        if (
          a.querySelector('.search_price_discount_combined')
          && a.querySelector('.search_price_discount_combined').dataset.priceFinal
        ) {
          return '$' + (parseInt(
            a.querySelector('.search_price_discount_combined').dataset.priceFinal
          ) / 100);
        }
        return undefined;
      })();

      const release_date = (() => {
        if (a.querySelector('.search_released')) {
          return a.querySelector('.search_released').textContent.trim();
        }
        return undefined;
      })();

      const title = (() => {
        if (a.querySelector('.title')) {
          return a.querySelector('.title').textContent.trim();
        }
        return undefined;
      })();

      const url = (() => {
        if (a.href) {
          return a.href.split('?')[0].split('#')[0];
        }
        return undefined;
      })();

      return {
        id,
        image,
        platforms,
        price,
        release_date,
        title,
        url,
      };
    });
  },
};

function handleError (err) {
  if (err.message === 'No results found') throw {message: 'No results found. 😅'};
  else throw {
    message: 'There was a network problem. Try again if you\'re feeling lucky. 🎲'
  };
}

module.exports = async function search (provider, query) {
  query = encodeURIComponent(query.trim());
  const baseURL = BaseURLs[Providers[provider]];
  try {
    const res = await fetch(baseURL + query);
    if (res.ok) {
      const text = await res.text();
      const {document} = (new JSDOM(text)).window;
      ['script', 'style'].forEach(
        tag => document.body.querySelectorAll(tag).forEach(el => el.remove())
      );
      return parseResults[Providers[provider]](document);
    }
    else throw new Error('Fetch failed');
  }
  catch (err) {
    handleError(err);
  }
};
