import { GuildMember, MessageEmbed, User } from 'discord.js'
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

        const target = message ? message.author as User : interaction.member?.user as User

        let data = donationsData[target.id]

        if (!data) {
            const results = await donationsSchema.findById(target.id)
            if (!results) {
                return 'You are not registered.'
            }

            const { guildId, amount } = results
            data = donationsData[guild.id] = [guildId, amount]
        }

        const embed = new MessageEmbed()
            .setDescription(`**${parseInt(data[1]).toLocaleString()}**`)
            .setTitle(`Donations for ${target.username}#${target.discriminator}`)
            .setColor(9567999)
            .setAuthor({
                name: `${target.username}`,
                iconURL: `${target.displayAvatarURL()}`
            })

        if (!message) {
            interaction.reply({
                embeds: [embed]
            })
        } else {
            await message.reply({
                embeds: [embed]
            })
        }
    }

} as ICommand