#!/usr/bin/env node
'use strict';

const Discord = require('discord.js');
const search = require('./search-games.js');
const {Providers, ProvidersFormatted, SearchURLs} = require('./providers.json');

function composeMessagesFromSearchResults (provider, query, ...results) {
  // It seems that Discord bots are rate-limited to 5 messages per 5 seconds
  // and they can't post multiple embeds in a single message
  const maxResults = 5;
  let moreResults = false;
  if (results.length > maxResults) {
    moreResults = true;
    results.splice(maxResults - 1, results.length - (maxResults - 1));
  }

  const messages = [];

  for (const result of results) {
    const embedObj = {};
    if (result.price) embedObj.description = result.price;
    if (result.image) embedObj.thumbnail = {url: result.image};
    if (result.title) embedObj.title = result.title;
    if (result.url) embedObj.url = result.url;
    const embed = new Discord.RichEmbed(embedObj);
    messages.push(embed);
  }

  if (moreResults) messages.push(new Discord.RichEmbed({
    author: {
      name: 'More search results',
      url: SearchURLs[provider] + encodeURIComponent(query),
    },
    description: (
      'See more search results for _'
      + query
      + '_ on **'
      + ProvidersFormatted[provider]
      + '**'
    ),
  }));
  return messages;
}

function handleReady () {
  client.user.setActivity('you type', {type: 'WATCHING'});
  console.log(`Logged in as ${client.user.tag}!`);
}

async function handleMessage (msg) {
  if (
    msg.isMentioned(client.user)
    && msg.author !== client.user
  ) {
    const regexMention = /^<@!?(\d+)>$/;
    const msgParts = msg.content.split(' ').filter(
      part => part.trim()
    ).filter(
      part => !(part.match(regexMention) && part === part.match(regexMention)[0])
    );
    const defaultReply = (
      'Sorry, but I don\'t understand that. For help, try this:'
      + '\n\n'
      + client.user + ' help'
    );
    if (msgParts.length === 0) {
      msg.channel.send(msg.author + ' 👋');
    }
    else if (msgParts.length === 1) {
      const keyword = msgParts[0].toLowerCase();
      switch (keyword) {
        case 'help': {
          msg.channel.send(
            'I can help you search for games on some different websites.'
            + '\n\n'
            + 'Right now, I can find games at:'
            + '\n'
            + '\n' + '  • `epic` (Epic Games)'
            + '\n' + '  • `gog` (GOG)'
            + '\n' + '  • `humble` (Humble Bundle)'
            + '\n' + '  • `itch` (itch.io)'
            + '\n' + '  • `steam` (Steam)'
            + '\n\n'
            + 'To start a search, send a message in this format:'
            + '\n\n'
            + client.user + '  `where to search`' + '  `what to search for`'
            + '\n\n'
            + 'Here\'s an example: _' + client.user + '  steam' + '  half life_'
          );
          break;
        }
        default: {
          if ([
            'hi',
            'hello',
            'hey',
            '👋',
          ].includes(keyword)) msg.channel.send(msg.author + ' 👋');
          else msg.channel.send(defaultReply);
          break;
        }
      }
    }
    else {
      const keyword = msgParts[0].toLowerCase();
      const text = msgParts.slice(1).join(' ');
      switch (keyword) {
        case 'no': {
          if (text.toLowerCase() === 'u') msg.channel.send('no u');
          else msg.channel.send(defaultReply);
          break;
        }
        default: {
          if (Object.keys(Providers).includes(keyword)) {
            const provider = Providers[keyword];
            msg.channel.startTyping();
            try {
              const results = await search(provider, text);
              const messages = composeMessagesFromSearchResults(provider, text, ...results);
              for (const message of messages) {
                msg.channel.send(message).catch(err => console.error(err));
              }
            }
            catch (err) {
              msg.channel.send(err.message);
            }
            msg.channel.stopTyping();
          }
          else msg.channel.send(defaultReply);
          break;
        }
      }
    }
  }
}

const client = new Discord.Client();
client.on('ready', handleReady);
client.on('message', handleMessage);
client.login(process.env.search_games_bot_token);
