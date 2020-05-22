/**
 * Functions related to permissions & permission nodes
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.1.0
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

    const doc = await guild.client.db.guild.findOne({"id": guild.id});

    if (!doc) return -1;

    const roles = doc.permissions.roles;

    if (!roles.has(roleID)) return -1;

    const nodes = roles.get(roleID);

    let res = -1;
    let search = node;
    do {
        if (nodes.has(search)) {
            res = nodes.get(search) ? 1 : 0;
            break;
        }
        search = search.substring(0, search.lastIndexOf(':', search.length - 3)) + ":*";
    } while (search.length > 0 && search !== ":*");

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