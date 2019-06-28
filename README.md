![Discord Hack Week](images/readme-banner.png)

# discord-bot-search-games

A Discord chat bot which scrapes online game marketplace search results and presents its findings

## Usage

> **tl;dr**
> 
> @bot help

**Details**

`@bot` `provider` `query`, where:

  - `@bot` is a mention of the bot
  - `provider` is one of the supported game providers:
     - [`epic`](https://www.epicgames.com/)
     - [`itch`](https://itch.io/)
     - [`steam`](https://store.steampowered.com/)
  - and `query` is the phrase you want to search

> _Example:_
> 
> @bot steam half life
