import mongoose, { Schema } from 'mongoose'

const reqString = {
    type: String,
    required: true
}

const pokemonSchema = new Schema({
    // Guild ID
    _id: reqString,
    name: reqString,
    generation: reqString,
    type: reqString,
    height: reqString,
    weight: reqString,
    baseStats: reqString,
    ability: reqString,
    hiddenAbility: reqString,
    location: reqString,
    rarity: reqString,
    genderRatio: reqString,
    eggGroup: reqString
})

const name = 'pokemon'
export default mongoose.models[name] ||
    mongoose.model(name, pokemonSchema, name)
