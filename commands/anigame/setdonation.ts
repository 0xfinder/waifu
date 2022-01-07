import DiscordJS from 'discord.js'
import { ICommand } from "wokcommands";
import donationSchema from '../../models/donation-schema';

export default {
    category: 'Configuration',
    description: 'Sets the donation channel.',

    permissions: ['ADMINISTRATOR'],

    minArgs: 1,
    expectedArgs: '<channel>',

    slash: 'both',

    options: [
        {
            name: 'channel',
            description: 'the target channel',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.CHANNEL
        }
    ],

    callback: async ({ guild, message, interaction, args, channel }) => {
        if (!guild) {
            return 'Please use this command within a server.'
        }

        const target = message ? message.mentions.channels.first() : interaction.options.getChannel('channel')
        if (!target || target.type !== 'GUILD_TEXT') {
            return 'Please tag a text channel'
        }

        await donationSchema.findOneAndUpdate({
            _id: guild.id
        }, {
            _id: guild.id,
            channelId: target.id
        }, {
            upsert: true
        })

        return `Successfully set <#${target.id}> as donation channel.`
    }

} as ICommand