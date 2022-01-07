import { MessageEmbed } from 'discord.js'
import { ICommand } from "wokcommands";
import donationsSchema from '../../models/donations-schema';

const donationsData = {} as {
    // userId: [guildId, amount]
    [key: string]: [string, string]
}

export default {
    category: 'Configuration',
    description: 'Shows amount donated.',

    permissions: ['SEND_MESSAGES'],

    slash: 'both',

    callback: async ({ guild, message, interaction }) => {
        if (!guild) {
            return 'Please use this command within a server.'
        }

        let data = donationsData[message.author.id]

        if (!data) {
            const results = await donationsSchema.findById(message.author.id)
            if (!results) {
                return 'You are not registered.'
            }

            const { guildId, amount } = results
            data = donationsData[guild.id] = [guildId, amount]
        }

        const embed = new MessageEmbed()
            .setDescription(`**${parseInt(data[1]).toLocaleString()}**`)
            .setTitle(`Donations for ${message.author.username}#${message.author.discriminator}`)
            .setColor(9567999)
            .setAuthor({
                name: `${message.author.username}`,
                iconURL: `${message.author.displayAvatarURL()}`
            })

        await message.reply({
            embeds: [embed]
        })
    }

} as ICommand