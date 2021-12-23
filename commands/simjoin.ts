import { ICommand } from "wokcommands";

export default {
    category: 'testing',
    description: 'simulates  a join',

    slash: 'both',
    testOnly: true,

    callback: ({ member, client }) => {
        client.emit('guildMemberAdd', member)
        return 'Join simulated'
    }
} as ICommand