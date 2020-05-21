/**
 * Functions related to permissions & permission nodes
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.0.0
 */

/**
 * Ensure that a given role in a guild has
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.1.0
 *
 * @param {Guild} guild
 * @param {string} roleID
 * @param {string} node
 * @returns {number} 1 if true, 0 if false, -1 if unset
 */
async function getRolePermission(guild, roleID, node) {
    const client = guild.client;

    let res = -1;

    await new Promise(function(resolve, reject) {
        client.db.guilds.findOne({id: guild.id}, function (err, doc) {
            if (err) reject(err);
            else resolve(doc);
        });
    }).then(function(doc) {
        const roles = doc.permissions.roles;
        if (!roles.hasOwnProperty(roleID)) return;
        const nodes = new Set(Object.keys(roles[roleID]));
        let search = node;
        do {
            if (nodes.has(search)) {
                res = roles[roleID][search] ? 1 : 0;
                break;
            }
            search = search.substring(0, search.lastIndexOf(':', search.length - 3)) + ":*";
        } while (search.length > 0 && search !== ":*");
    }).catch(function(err) {
        console.error(err);
    });

    return res;
}


/**
 * Ensure that a given role in a guild has
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.1.0
 *
 * @param {Guild} guild
 * @param {User} user
 * @param {Command} command
 * @returns {boolean}
 */
async function checkUserCanExecuteCommand(guild, user, command) {
    if(guild.ownerID === user.id) return true;

    const guildMember = guild.member(user);
    const roles = guildMember.roles.cache.sorted((a, b) => b.position - a.position);

    for (let key of roles.keyArray()) {
        const role = roles.get(key);
        const rid = role.id;
        const allowed = await getRolePermission(guild, rid, command.permissionNode);
        if (allowed === -1) continue;
        return !!allowed;
    }

    return command.permissionDefault;
}

module.exports = {
    checkUserCanExecuteCommand: checkUserCanExecuteCommand,
};