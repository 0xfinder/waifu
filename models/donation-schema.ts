import mongoose, { Schema } from 'mongoose';

const reqString = {
    type: String,
    required: true
}

const donationSchema = new Schema({
    // Guild ID
    _id: reqString,
    channelId: reqString
})

const name = 'guild-donation'
export default mongoose.models[name] ||
    mongoose.model(name, donationSchema, name)
