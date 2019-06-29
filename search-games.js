#!/usr/bin/env node
'use strict';

/*
 * List of all steam apps (4MB JSON file):
 * https://api.steampowered.com/ISteamApps/GetAppList/v2
 */

const fetch = require('node-fetch');
const {JSDOM} = require('jsdom');
const {
  // Providers,
  DataTypes,
  ProviderDataTypes,
  DataURLs,
} = require('./providers.json');

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

  gog (json) {
    // return json; // uncomment this line to see the entire json object
    const results = json.products;
    if (!results.length) throw {message: 'No results found'};
    return results.map(item => {
      const id = (() => {
        if (item.id) {
          return item.id;
        }
        return undefined;
      })();

      const image = (() => {
        if (item.image) {
          return 'https:' + item.image + '_product_tile_304.jpg';
        }
        return undefined;
      })();
      
      const platforms = (() => {
        const platforms = [];
        const platformList = new Map([
          ['android', 'android'],
          ['ios', 'ios'],
          ['linux', 'linux'],
          ['mac', 'mac'],
          ['windows', 'windows'],
        ]);

        if (item.supportedOperatingSystems) {
          for (const platform of item.supportedOperatingSystems) {
            if (platformList.has(platform)) {
              platforms.push(platformList.get(platform));
            }
          }
        }
        return platforms;
      })();
      
      const price = (() => {
        if (
          item.price.symbol
          && item.price.finalAmount
        ) {
          return item.price.symbol + item.price.finalAmount;
        }
        return undefined;
      })();
      
      const release_date = (() => {
        if (!item.releaseDate) return undefined;
        const date = new Date(item.releaseDate * 1000);
        const formatted = (
          `${date.getUTCFullYear()}`
          + '-'
          + `${date.getUTCMonth() + 1}`.padStart(2, '0')
          + '-'
          + `${date.getUTCDate()}`.padStart(2, '0')
        );
        return formatted;
      })();
      
      const title = (() => {
        if (item.title) {
          return item.title;
        }
        return undefined;
      })();

      const url = (() => {
        if (item.url) {
          return 'https://www.gog.com' + item.url;
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

  humble (json) {
    // return json; // uncomment this line to see the entire json object
    const results = json.results;
    if (!results.length) throw {message: 'No results found'};
    return results.map(item => {
      const id = (() => {
        return undefined;
      })();

      const image = (() => {
        if (item.standard_carousel_image) {
          return item.standard_carousel_image;
        }
        return undefined;
      })();

      const platforms = (() => {
        const platforms = [];
        const platformList = new Map([
          ['android', 'android'],
          ['ios', 'ios'],
          ['linux', 'linux'],
          ['mac', 'mac'],
          ['windows', 'windows'],
        ]);

        if (item.platforms) {
          for (const platform of item.platforms) {
            if (platformList.has(platform)) {
              platforms.push(platformList.get(platform));
            }
          }
        }
        return platforms;
      })();

      const price = (() => {
        if (item.current_price) {
          return '$' + item.current_price[0];
        }
        return undefined;
      })();

      const release_date = (() => {
        return undefined;
      })();

      const title = (() => {
        if (item.human_name) {
          return item.human_name;
        }
        return undefined;
      })();

      const url = (() => {
        if (item.human_url) {
          return 'https://www.humblebundle.com/store/' + item.human_url;
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
        const platformList = new Map([
          ['android', 'android'],
          ['ios', 'ios'],
          ['linux', 'linux'],
          ['mac', 'mac'],
          ['win', 'windows'],
        ]);
        const providerPlatforms = new Set();

        for (const span of a.querySelectorAll('span.platform_img')) {
          for (const value of [...span.classList]) {
            providerPlatforms.add(value);
          }
        }
        
        for (const platform of [...providerPlatforms]) {
          if (platformList.has(platform)) {
            platforms.push(platformList.get(platform));
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

function encode (uriComponent) {
  return encodeURIComponent(uriComponent.trim());
}

function handleError (err) {
  if (err.message === 'No results found') throw {message: 'No results found. 😅'};
  else throw {
    message: 'There was a network problem. Try again if you\'re feeling lucky. 🎲'
  };
}

module.exports = async function search (provider, query) {
  const baseURL = DataURLs[provider];
  try {
    const res = await fetch(baseURL + encode(query));
    if (res.ok) {
      switch (ProviderDataTypes[provider]) {
        case DataTypes.html: {
          const text = await res.text();
          const {document} = (new JSDOM(text)).window;
          ['script', 'style'].forEach(
            tag => document.body.querySelectorAll(tag).forEach(el => el.remove())
          );
          return parseResults[provider](document);
        }
        case DataTypes.json: {
          const json = await res.json();
          return parseResults[provider](json);
        }
        default: {
          throw {message: 'No results found'};
        }
      }
    }
    else throw new Error('Fetch failed');
  }
  catch (err) {
    handleError(err);
  }
};
