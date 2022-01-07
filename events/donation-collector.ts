import { Channel, Client, Message, TextChannel } from "discord.js";
import donationSchema from "../models/donation-schema";
import donationsSchema from "../models/donations-schema";

const guildDonationData = {} as {
    // guildId: [channel]
    [key: string]: [TextChannel]
}

const donationsData = {} as {
    // userId: [guildId, amount]
    [key: string]: [string, string]
}

export default (client: Client) => {
    client.on('messageCreate', async (message) => {
        const { guild, author } = message

        // Filters
        if (!guild) return;

        // Filter .cl donate functions
        if (!message.content.toLowerCase().includes('cl donate')) {
            return
        }

        // Check if channel is valid donation channel
        let data = guildDonationData[guild.id]

        if (!data) {
            const results = await donationSchema.findById(guild.id)
            if (!results) {
                return;
            }

            const { channelId } = results
            const channel = guild.channels.cache.get(channelId) as TextChannel
            data = guildDonationData[guild.id] = [channel]
        }

        // Returns if .cl donate was not sent in donation channel specified in guild
        if (message.channel != data[0]) {
            return;
        }

        let args = message.content.trim().split(/\s+/);
        if (args.length < 3) {
            return
        }

        // Collect donation success/failure embed from anigame
        const filter = (m: Message) => {
            return m.author.id === '571027211407196161'
        }

        const collector = data[0].createMessageCollector({
            filter,
            max: 1
        })

        collector.on('collect', message => {
            // console.log(message.content)
        })

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.reply('No donation received')
            }

            collected.forEach(async (message) => {
                const { embeds: collected_embeds } = message;
                const collected_embed = collected_embeds[0];
                // console.log(collected_embed)
                const { title, description } = collected_embed;
                // Only execute if successfully donated
                if (!title?.toLowerCase().includes('success')) {
                    return;
                }

                if (!description) {
                    return
                }
                let descriptionArr = description.split(' ')

                // Finding donator and amount donated
                const donatedGold = descriptionArr[descriptionArr.length - 14].replace(/[\*,]/g, '')
                let sliced_name = descriptionArr.slice(1, descriptionArr.length - 17)

                let donator = 'placeholder'
                if (sliced_name.length == 1) {
                    donator = sliced_name[0].slice(2, sliced_name[0].length - 3)
                } else {
                    donator = `${sliced_name[0].slice(2, sliced_name[0].length)} ${sliced_name.slice(1, sliced_name.length - 1).join(' ')} ${sliced_name[sliced_name.length - 1].slice(0, sliced_name[sliced_name.length - 1].length - 3)}`
                }

                // Check message author and donator are same people
                if (author.username != donator) {
                    return
                }

                let userDonationData = donationsData[author.id]

                if (!userDonationData) {
                    const results = await donationsSchema.findById(author.id)

                    if (!results) {
                        return
                    }

                    const { guildId, amount } = results
                    userDonationData = donationsData[author.id] = [guildId, amount]
                }

                // Update new amount donated
                const newAmount = parseInt(userDonationData[1]) + parseInt(donatedGold);

                await donationsSchema.findOneAndUpdate({
                    _id: author.id
                }, {
                    _id: author.id,
                    guildId: message.guild?.id,
                    amount: newAmount
                }, {
                    upsert: true
                })
            })
        })
    })
}

export const config = {
    displayName: 'Donation List',
    dbName: 'ANIGAME_DONATIONS'
}