/**
 * A MessageEmbed with red colour and :gagded: thumbnail
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */


const { MessageEmbed } = require('discord.js');

module.exports = class ErrorEmbed extends MessageEmbed {

    constructor(title, message) {
        super();
        this.setColor(0xff0000);
        this.setThumbnail('https://cdn.discordapp.com/emojis/708352247804854285.png');
        this.setTitle(title);
        this.setDescription(message);
    }

};