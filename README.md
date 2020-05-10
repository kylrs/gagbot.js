<!--
  @author  Kay <kylrs00@gmail.com>
  @version v1.0.0 
-->

# gagbot.js
**GaGBot is a utility bot for discord servers, written in JavaScript for Node.js**

## Getting Started
### Prerequisites
 - Install `git`
 - Install `node`, version 14.0.0 or later
 - Install `npm`
 
### Installation
  1. [Create a Discord Application and get a Bot Token](https://discord.com/developers/docs/intro#bots-and-apps)
  2. Invite the bot to your server.
  
  **In Git Bash:**
  
  3. Clone the repo
  
```
  cd /path/to/bot/repo
  git clone https://github.com/kylrs/gagbot.js.git
```
    
  4. Install the bot
  
```
  cd /gagbot.js
  npm install
```
    
  5. Create an environment variable named 'DISCORD_TOKEN', and set it to your bot's token.
  
  6. Run the bot. If all goes well, you'll see the modules being loaded, followed by a message that your bot has logged in to Discord.
  
```
  npm start
```

  7. You can test your bot using the `gb!ping` command in your server chat, which is included in the `core` module.
  
  8. [Configure GaGBot](https://github.com/kylrs/gagbot.js/wiki/Configuration)!
  
## Contributing
GaGBot welcomes new collaborators! If you're interested in chipping in, make sure to take note of the guidelines below.

### Issues & Pull Requests

 - Before contributing anything to GaGBot, discuss the changes you'd like to make in an issue.
   - You should include details about the purpose, scope, justification and, if possible, details of a proposed implementation.
   - Make sure your issues are tagged appropriately.
 - When you're ready to make a pull request, make sure your PR satisfies the following criteria:
   - Build dependencies (e.g. `node_modules`), IDE project files (e.g. `.idea`), etc. are not tracked by the PR branch.
   - `README.md` reflects any changes, where necessary
   - Files are versioned appropriately, using the `MAJOR.MINOR.PATCH` semantic versioning syntax. 
     - New files must use `v1.0.0`, and include the release code of the target GaGBot release.
   - The PR is labeled appropriately, and the title & description are descriptive.
   - Issues closed by this PR are [linked using keywords](https://help.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).

### Code of Conduct

Please make sure you take a look at our [Code of Conduct](./CONTRIBUTING.md) before getting involved with the project. This isn't intended to be too strict, but only to foster a welcoming and tolerant community that is conducive to collaboration.

## Built With

  - [Node.js](https://nodejs.org)
  - [discord.js](https://discord.js.org)
  - [NeDB](https://github.com/louischatriot/nedb)
  
## Versioning

We use MAJOR.MINOR.PATCH semantic versioning in two different flavours. One for versioning code, and the other for releases.

  - Versioning Code
    - Where possible, all code must have labels indicating the iteration of the file. 
    - In JS, this is done in JSDoc style docblocks.
    - Code versions follow the format `vM.m.p`
      - `M` = Major: Incremented for any radical changes, such as total rewrites.
      - `m` = Minor: Incremented for small changes, such as a few new/modified function(s) in a class.
      - `p` = Patch: Incremented for smaller changes, e.g. bug fixes, typo corrections. Patches should not change *intended* functionality.
  
  - Versioning Releases
    - When the `master` branch contains a robust build, a release will be made.
    - Release numbers follow the format `rY.M.m`
      - `Y` = Year: A 2-digit integer indicating what year the release was made, where `00` is the year 2000.
      - `M` = Major: Incremented for big changes, like new features, rewrites, etc.
      - `m` = Minor: Incremented for bug fixes or introduction of smaller features.
 
 We are currently on `r2020.0.0`

## Contributors

 - **Kay** <kylrs00@gmail.com> - _Product Owner_

## License

This code is licensed under the ISC License - see [LICENSE.md](./LICENSE.md) for details. 
