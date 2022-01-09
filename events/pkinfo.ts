import { Client, TextChannel } from "discord.js";
import pokemonSchema from "../models/pokemon-schema";

const pokemonData = {} as {
    // name: [channel, message]
    [key: string]: [string, string, string, string, string, string, string, string, string, string, string, string]
}

export default (client: Client) => {
    client.on('messageCreate', async (message) => {
        const { guild, author, embeds, channelId } = message

        // Filters
        if (!guild || author.id != '438057969251254293' || embeds.length < 1) return;

        // if (channelId != '882452780961386496') return;
        // Destructure embed
        const { type, title, description, url, color, timestamp, fields, thumbnail, image, video, author: embed_author, provider, footer } = embeds[0];

        const channel = guild.channels.cache.get(channelId) as TextChannel

        if (!embed_author) return;

        // Check embed type
        if (!embed_author.name.includes('#')) {
            // .mypkinfo
            if (!embed_author.name.includes('Lv')) return;

            // Check if embed is .mypkinfo
            if (!fields.find(function (field, index) {
                if (field.name == 'Lock Guarded')
                    return true;
            })?.value.split(' ')[0]) {
                return;
            }

            // Name of pokemon and shiny check
            let embed_author_array = embed_author.name.split(' ');
            let shiny = '';
            if (embed_author_array[0] == '★') {
                embed_author_array.shift()
                shiny = '★ '
            }
            const [pokemonName, ,] = embed_author_array;

            let results = await pokemonSchema.findOne({ name: pokemonName });
            if (!results) {
                // channel.send("Pokemon not in database. Please run `.pkinfo <pokemon>` to add it.");
                return;
            }

            const { _id, name, generation, type, height, weight, baseStats, ability, hiddenAbility, location, rarity, genderRatio, eggGroup } = results

            let data = pokemonData[_id]
            data = pokemonData[_id] = [name, generation, type, height, weight, baseStats, ability, hiddenAbility, location, rarity, genderRatio, eggGroup]

            // Gender
            let gender = fields.find(function (field, index) {
                if (field.name == 'Gender')
                    return true;
            })?.value.split(' ')[0];

            if (gender?.trim().toLowerCase() == 'female') {
                gender = ' ♀️'
            } else if (gender?.trim().toLowerCase() == 'male') {
                gender = ' ♂️'
            } else {
                gender = ''
            }

            // IVs: HP Atk Def SpA SpD Spe
            let pkmnIVs = fields.find(function (field, index) {
                if (field.name == 'IVs')
                    return true;
            })?.value.match(/[0-9]+/g);

            const pkmnIVsCopy = [...pkmnIVs!];

            // Nature
            const nature = fields.find(function (field, index) {
                if (field.name == 'Nature')
                    return true;
            })?.value

            // HA Check
            const pkmnAbility = fields.find(function (field, index) {
                if (field.name == 'Ability')
                    return true;
            })?.value

            // If pokemon has no HA, check if 1 or more abilities -> if yes, write ability, if no, don't include
            // if pokemon has HA, check if ability is HA, if yes -> write HA, if no -> check if there are more than 1 abilities
            let ability_message = '';
            if (hiddenAbility.toLowerCase().includes('none')) {
                if (ability.split('/').length > 1) {
                    ability_message = ` · ${pkmnAbility} · `
                } else if (ability.split('/').length <= 1) {
                    ability_message = ' · '
                }
            } else if (!hiddenAbility.toLowerCase().includes('none')) {
                if (hiddenAbility.includes(pkmnAbility)) {
                    ability_message = ' · HA · '
                } else {
                    if (ability.split('/').length > 1) {
                        ability_message = ` · ${pkmnAbility} NHA · `
                    } else if (ability.split('/').length <= 1) {
                        ability_message = ' · NHA · '
                    }
                }
            }

            // IV category and percentage calculation
            const percentage = (pkmnIVs!.map(function (iv) {
                return parseInt(iv)
            }).reduce((a, b) => a + b, 0) / (31 * 6) * 100).toFixed(2);

            // Reorder to: 
            // IVs: HP Atk Def Spe SpA SpD
            pkmnIVs!.splice(3, 0, pkmnIVs!.splice(5, 1)[0])

            // Hidden Power typing calculation
            // Typing bits
            let ivBits = pkmnIVs!.map(function (iv) {
                if (parseInt(iv) % 2 == 0) {
                    return 0
                } else {
                    return 1
                }
            })

            // Construct typing binary number
            const binaryNumberIvBits = ivBits.reduce((a: number, b: number, index) => (a + b * (2 ** index)), 0)

            const pkmnTypes = ['Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark']
            const hpType = pkmnTypes[Math.floor(binaryNumberIvBits * 5 / 21)]

            // Hidden Power damage calculation
            // Damage bits
            let damageBits = pkmnIVs!.map(function (iv) {
                if (parseInt(iv) % 4 == 2 || parseInt(iv) % 4 == 3) {
                    return 1
                } else {
                    return 0
                }
            })

            // Construct typing binary number
            const binaryNumberDamageBits = damageBits.reduce((a: number, b: number, index) => a + b * (2 ** index), 0)

            const hpDamage = Math.floor(binaryNumberDamageBits * 40 / 63) + 30

            const embed = message.embeds[0]
                .addFields([
                    {
                        name: 'Summary',
                        value: `${shiny}${name}${gender} · ${pkmnIVsCopy.join('/')} · ${percentage}% · ${nature}${ability_message}HP ${hpType} ${hpDamage}`,
                        inline: false
                    }
                ])

            await message.delete()

            await channel.send({
                embeds: [embed]
            })


        } else if (embed_author.name.includes('#')) {
            // .pkinfo
            const pokemonName = embed_author.name.split('#')[0].trim()
            let pokemonId = embed_author.name.split('#')[1].trim()

            if (pokemonId == '658') {
                pokemonId = pokemonId + '_';
            }
            let data = pokemonData[pokemonId]

            if (!data) {

                let results = await pokemonSchema.findById(pokemonId);

                if (!results) {
                    /*
                    // Add pokemon data to database
                    const pokemonInfo = {} as {
                        Id: String,
                        Name: String,
                        Generation: String,
                        Type: String,
                        Height: String,
                        Weight: String,
                        BaseStats: String,
                        Ability: String,
                        HiddenAbility: String,
                        Location: String,
                        Rarity: String,
                        GenderRatio: String,
                        EggGroup: String
                    };

                    pokemonInfo.Name = pokemonName;
                    pokemonInfo.Id = pokemonId;

                    // Add each field to object
                    for (let i = 0; i < fields.length; i++) {
                        switch (fields[i].name) {
                            case 'Gen':
                                pokemonInfo.Generation = fields[i].value;
                            case 'Type':
                                pokemonInfo.Type = fields[i].value;
                            case 'Height':
                                pokemonInfo.Height = fields[i].value;
                            case 'Weight':
                                pokemonInfo.Weight = fields[i].value;
                            case 'Base Stats':
                                pokemonInfo.BaseStats = fields[i].value;
                            case 'Ability':
                                pokemonInfo.Ability = fields[i].value;
                            case 'Hidden Ability':
                                pokemonInfo.HiddenAbility = fields[i].value;
                            case 'Location':
                                pokemonInfo.Location = fields[i].value;
                            case 'Rarity':
                                pokemonInfo.Rarity = fields[i].value;
                            case 'Gender Ratio':
                                pokemonInfo.GenderRatio = fields[i].value;
                            case 'Egg Group':
                                pokemonInfo.EggGroup = fields[i].value;
                        }
                    }

                    // Update
                    await pokemonSchema.findOneAndUpdate({
                        _id: pokemonInfo.Id
                    }, {
                        _id: pokemonInfo.Id,
                        name: pokemonInfo.Name,
                        generation: pokemonInfo.Generation,
                        type: pokemonInfo.Type,
                        height: pokemonInfo.Height,
                        weight: pokemonInfo.Weight,
                        baseStats: pokemonInfo.BaseStats,
                        ability: pokemonInfo.Ability,
                        hiddenAbility: pokemonInfo.HiddenAbility,
                        location: pokemonInfo.Location,
                        rarity: pokemonInfo.Rarity,
                        genderRatio: pokemonInfo.GenderRatio,
                        eggGroup: pokemonInfo.EggGroup
                    }, {
                        upsert: true
                    })

                    // Update results with newly added data
                    results = await pokemonSchema.findById(pokemonId);
                    */
                    return;
                }

                const { name, generation, type, height, weight, baseStats, ability, hiddenAbility, location, rarity, genderRatio, eggGroup } = results
                // Load data into memory
                data = pokemonData[pokemonId] = [name, generation, type, height, weight, baseStats, ability, hiddenAbility, location, rarity, genderRatio, eggGroup]
            }
        } else {
            return;
        }
    })
}

export const config = {
    displayName: 'Pokemon List',
    dbName: 'POKEMONS'
}