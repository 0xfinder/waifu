import { Interaction, Message, MessageActionRow, MessageButton, MessageComponentInteraction } from "discord.js";
import { ICommand } from "wokcommands";

export default {
    category: 'Testing',
    description: 'testy',

    slash: true,
    testOnly: true,

    callback: async ({ interaction: msgInt, channel }) => {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('ban_yes')
                    .setEmoji('🔨')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('ban_no')
                    .setLabel('Cancel')
                    .setStyle('DANGER')
            )

        const linkRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setURL('https://wornoffkeys.com')
                    .setLabel('Visit WOK')
                    .setStyle('LINK')
            )

        await msgInt.reply({
            content: 'Are you sure?',
            components: [row, linkRow],
            ephemeral: true
        })

        const filter = (btnInt: Interaction) => {
            return msgInt.user.id === btnInt.user.id
        }

        const collector = channel.createMessageComponentCollector({
            filter,
            max: 1,
            time: 150000,
        })

        collector.on('collect', (i: MessageComponentInteraction) => {
            i.reply({
                content: 'ypu clicked a button',
                ephemeral: true
            })
        })

        collector.on('end', async (collection) => {
            collection.forEach((click) => {
                console.log(click.user.id, click.customId)
            })

            if (collection.first()?.customId === 'ban_yes') {
                // ban user
            }

            await msgInt.editReply({
                content: 'an action  has alr been taken',
                components: [],
            })
        })
    }
} as ICommand