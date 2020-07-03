<!--
  @author  Kay <kylrs00@gmail.com>
  @version v1.3.1
-->

# gagbot.js
**GaGBot is a utility bot for discord servers, written in JavaScript for Node.js**

To get the latest stable release, check out [the releases page](https://github.com/kylrs/gagbot.js/releases).

## Features
 - **Module Loader** - GaGBot can dynamically load modules that define new commands and events, making implementing custom features a breeze! _(r20.1.0)_
 - **Permissions** - Fine-tune access to custom commands with simple permission nodes per role. _(r20.1.0)_
 - **Greet Module** - Send new users a welcome message when they join the server. _(r20.2.0)_
 - **Reaction Roles** - Allow users to assign themselves specific roles by reacting to messages. _(r20.2.0)_
### Upcoming Features
 - **Admin Module** - Commands for managing the server, e.g. purging channels, muting users, and so on.
 - **Custom Logging** - Keep track of server activity by choosing what events are logged, and where.
 - **Promotion Tracks** - Allow users to earn roles, with ladders that they can climb automatically.
 
 **Got a good idea?** [Open an issue](https://github.com/kylrs/gagbot.js/issues) and start the discussion! 
 
 Alternatively, you could contribute to one of these features! Look for open [issues that are awaiting your action](https://github.com/kylrs/gagbot.js/issues?q=is%3Aopen+is%3Aissue+label%3As%3Awaiting).

## Getting Started
### Prerequisites
 - Install `git`
 - Install `node`, version 14.0.0 or later
 - Install `npm`
 - A MongoDB server.
 
### Installation
  1. [Create a Discord Application and get a Bot Token](https://discord.com/developers/docs/intro#bots-and-apps)
  2. Invite the bot to your server.
  3. Clone the repo or [grab a stable release (recommended)](https://github.com/kylrs/gagbot.js/releases)
  4. Install the bot
  
```
  cd /gagbot.js
  npm install
```
    
  5. Create an environment variable named `DISCORD_TOKEN`, and set it to your bot's token.
      - If you're using the `admin` module, you should also supply the environment variables `PASTEBIN_DEV_KEY`, `PASTEBIN_USER_NAME` and `PASTEBIN_USER_PASSWORD`, containing your Pastebin API developer key, username and password respectively. This is especially necessary for large servers where the `prune` command may select inactive members in excess of the number the bot is able to list in a MessageEmbed.
  6. Add your MongoDB connection string to an environment variable named `MONGO_DB_URI`.
  7. Run the bot. If all goes well, you'll see the modules being loaded, followed by a message that your bot has logged in to Discord.
  
```
  node src/bot.js
```

  7. You can test your bot using the `ping` command in your server chat, which is included in the `core` module. By default, you can either tag the bot to summon it, or use the prefix `!`.
  
  8. [Configure GaGBot](https://github.com/kylrs/gagbot.js/wiki/Configuration)!

## Built With

  - [Node.js](https://nodejs.org)
  - [discord.js](https://discord.js.org)
  - [MongoDB](https://www.mongodb.com)
  
## Versioning

We use MAJOR.MINOR.PATCH semantic versioning in two different flavours. One for versioning code, and the other for releases. For more information, [visit the wiki](https://github.com/kylrs/gagbot.js/wiki/Versioning).

The latest stable release is `r20.1.0`.

## Contributors

 - **Kay** <kylrs00@gmail.com> - _Product Owner_

## License

This code is licensed under the ISC License - see [LICENSE.md](./LICENSE.md) for details. 
