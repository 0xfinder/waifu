import DiscordJS, { Intents } from 'discord.js'
import path from 'path'
import WOKCommands from 'wokcommands'
import mongoose from 'mongoose'

import 'dotenv/config'

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

client.on('ready', async () => {
    console.log("Bot is ready")

    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        featuresDir: path.join(__dirname, 'events'),
        typeScript: true,
        testServers: ['923555005460520990', '696641419078795284', '928872810879778856'],
        mongoUri: process.env.MONGO_URI
    })

    client.user?.setActivity('with your mom', { type: 'PLAYING' })
})

client.login(process.env.TOKEN)