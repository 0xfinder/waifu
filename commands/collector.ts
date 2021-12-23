import { Message, MessageReaction, User } from "discord.js";
import { ICommand } from "wokcommands";

export default {
    category: 'Testing',
    description: 'testing',

    callback: ({ message, channel }) => {
        message.reply('eplease cfm this acton:')
        message.react('❤')

        // const filter = (m: Message) => {
        //     return m.author.id === message.author.id
        // }
        //
        // const collector = channel.createMessageCollector({
        //     filter,
        //     max: 1,
        //     time: 1000 * 10
        // })

        const filter = (reaction: MessageReaction, user: User) => {
            return user.id === message.author.id
        }

        const collector = message.createReactionCollector({
            filter,
            max: 1,
            time: 1000 * 10
        })

        collector.on('collect', (reaction) => {
            console.log(reaction.emoji)
        })

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                message.reply('you idd nto react in time')
                return
            }

            let text = 'Collected:\n\n'

            collected.forEach((message) => {
                text += `${message.emoji.name}\n`
            })

            message.reply(text)
        })
    }
} as ICommand