const mongoose = require('mongoose');

const PictureSchema = new mongoose.Schema({
    // Based on filestore.js in Express-File-Upload repo
    name: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: Buffer,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    // End reference from repo
    description: {
        type: String,
        default: "",
    },
    tags: {
        type: [String],
        default: [],
    },
    likes: {
        type: [mongoose.Schema.ObjectId],
        default: []
    },
    public: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

PictureSchema.statics.toAPI = (doc) => ({
    name: doc.name,
    image: doc.image,
    size: doc.size,
    mimetype: doc.mimetype,
    description: doc.description,
    tags: doc.tags,
    likes: doc.likes,
    public: doc.public,
    owner: doc.owner,
    createdDate: doc.createdDate
});

// Pictures are duplicates if they have the same name AND image
// Documentation: https://mongoosejs.com/docs/api/schema.html#Schema.prototype.index()
PictureSchema.index({ name: 1, image: 1 }, { unique: true });

const PictureModel = mongoose.model('Picture', PictureSchema)
module.exports = PictureModel;