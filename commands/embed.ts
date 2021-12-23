import { Message, MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";

export default {
    category: 'Testing',
    description: 'sends an embed',

    permissions: ['ADMINISTRATOR'],

    callback: async ({ message, text }) => {
        const json = JSON.parse(text)

        const embed = new MessageEmbed(json)

        return embed
        //     const embed = new MessageEmbed()
        //         .setDescription("hello world")
        //         .setTitle("Title")
        //         .setColor('#ffb347')
        //         .setAuthor('finderrrrr')
        //         .setFooter('gay')
        //         .addFields([
        //             {
        //                 name: 'name',
        //                 value: 'value',
        //                 inline: true
        //             },
        //             {
        //                 name: 'name two',
        //                 value: 'value two',
        //                 inline: true
        //             }
        //         ])
        //         .addField('name 3', 'value 3')

        //     const newMessage = await message.reply({
        //         embeds: [embed]
        //     })

        //     await new Promise(resolve => setTimeout(resolve, 5000))

        //     const newEmbed = newMessage.embeds[0]
        //     newEmbed.setTitle("Edited Title")

        //     newMessage.edit({
        //         embeds: [newEmbed]
        //     })
    }
} as ICommand