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
    await mongoose.connect(
        process.env.MONGO_URI || '',
        {
            keepAlive: true
        }
    )

    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        featuresDir: path.join(__dirname, 'events'),
        typeScript: true,
        testServers: ['923555005460520990', '696641419078795284'],
    })

    client.user?.setActivity('with your mom', { type: 'PLAYING' })
})

client.login(process.env.TOKEN)