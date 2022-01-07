import mongoose, { Schema } from 'mongoose';

const reqString = {
    type: String,
    required: true
}

const donationsSchema = new Schema({
    // user ID
    _id: reqString,
    guildId: reqString,
    amount: reqString
})

const name = 'donations'
export default mongoose.models[name] ||
    mongoose.model(name, donationsSchema, name)
