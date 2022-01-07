import DiscordJS, { Guild, TextChannel, Message } from 'discord.js'
import { ICommand } from "wokcommands";
import donationSchema from '../../models/donation-schema';
import donationsSchema from '../../models/donations-schema';

const guildDonationData = {} as {
    // guildId: [channel]
    [key: string]: [TextChannel]
}

export default {
    category: 'Configuration',
    description: 'Registers for donations to be tracked.',

    permissions: ['SEND_MESSAGES'],

    slash: 'both',

    callback: async ({ guild, message, interaction }) => {
        if (!guild) {
            return 'Please use this command within a server.'
        }

        // Check if channel is valid donation channel
        let data = guildDonationData[guild.id]

        if (!data) {
            const results = await donationSchema.findById(guild.id)
            if (!results) {
                return 'A donation channel has not been set.';
            }

            const { channelId } = results
            const channel = guild.channels.cache.get(channelId) as TextChannel
            data = guildDonationData[guild.id] = [channel]
        }

        if (message.channel != data[0]) {
            return 'Please use this command in a donation channel.'
        }

        const results = await donationsSchema.findById(message.author.id)

        if (!results) {
            await donationsSchema.findOneAndUpdate({
                _id: message.author.id
            }, {
                _id: message.author.id,
                guildId: guild.id,
                amount: '0'
            }, {
                upsert: true
            })

            await message.channel.send('Successfully registered. Type \`.donations\` to check your donations.')
            return
        }

        const { guildId, amount } = results
        // If existing results, ask for confirmation to override
        if (guildId != message.guild?.id) {
            await message.reply('You have existing data in a different guild, would you like to overwrite? Type y or n.')

            const filter = (m: Message) => {
                return m.author.id === message.author.id
            }

            const collector = message.channel.createMessageCollector({
                filter,
                max: 1,
                time: 1000 * 60
            })

            collector.on('collect', message => {
                console.log(message.content)
            })

            collector.on('end', collected => {
                if (collected.size === 0) {
                    message.reply('No donation received')
                    return
                }

                collected.forEach(async (message) => {
                    if (message.content.toLowerCase().trim() == 'y') {
                        await donationsSchema.findOneAndUpdate({
                            _id: message.author.id
                        }, {
                            _id: message.author.id,
                            guildId: guild.id,
                            amount: '0'
                        }, {
                            upsert: true
                        })

                        await message.channel.send('Successfully registered. Type \`.donations\` to check your donations.')
                        return
                    } else if (message.content.toLowerCase().trim() == 'n') {
                        await message.channel.send('Command cancelled.')
                        return
                    }
                })
            })
        } else if (guildId == message.guild?.id) {
            return 'You are already registered.'
        }
    }
} as ICommand