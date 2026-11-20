const models = require('../models');
const Picture = models.Picture;

const mainPage = async (req, res) => {
    res.render('app');
};

// Make a picture
const makePicture = async (req, res) => {
    // Required fields
    if(!req.body.name || !req.body.image || req.body.size === undefined || req.body.size <= 0 || !req.body.mimetype) {
        return res.status(400).json({ error: 'All fields are required!' });
    }
    const imageBuffer = convertToBuffer(req.body.image);
    const pictureData = {
        name: req.body.name,
        image: imageBuffer,
        size: req.body.size,
        mimetype: req.body.mimetype,
        owner: req.session.account._id,
    };
    // Optional fields
    if(req.body.description) {
        pictureData.description = req.body.description;
    }
    if(req.body.tags) {
        pictureData.tags = req.body.tags;
    }
    try {
        const newPicture = new Picture(pictureData);
        await newPicture.save();
        return res.status(201).json({
            name: newPicture.name,
            image: newPicture.image,
            size: newPicture.size,
            mimetype: newPicture.mimetype,
            description: newPicture.description,
            tags: newPicture.tags,
            likes: newPicture.likes,
            public: newPicture.public,
            owner: newPicture.owner,
            createdDate: newPicture.createdDate,
        });
    } catch (err) {
        console.log(err);
        // If both name and image are the same, duplicate
        if(err.code === 11000) {
            return res.status(400).json({ error: 'Picture already exists!' });
        }
        return res.status(500).json({ error: 'An error occured making the picture!' });
    }
}

// Get the photos from the current user
// const getMyPictures = async (req, res) => {
    // try {
    //     const query = { owner: req.session.account._id };
    //     const docs = await Picture.find(query).lean().exec();
    //     return res.json({pictures: docs});
    // } catch (err) {
    //     console.log(err);
    //     return res.status(500).json({ error: 'Error retrieving pictures!' });
    // }
// }

// Get ONLY images based on filters
const getPictures = async (req, res) => {
    try {
        const query = {
            public: true,
        };
        // Filters
        // Used https://www.geeksforgeeks.org/mongodb/how-to-query-mongodb-with-like/ as reference for $regex and $options
        // Used https://www.mongodb.com/docs/manual/reference/operator/query/size/ as reference for $size
        // Used https://oneuptime.com/blog/post/2025-12-15-mongodb-query-by-array-size/view as reference for using $gt and its variants, as well as $expr + $size for minLikes
        // Used https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date to figure out how to use dates in JS
        // $gt means greater than, add 'e' to also allow 'equal to', replace 'g' with 'l' to do less than || $size measures length of array, $expr allows usage of both at once
        // Name
        if(req.query.name) {
            query.name = {
                // $regex searches for the given string anywhere in the value
                $regex: req.query.name,
                // "$options: i" makes the search ignore case
                $options: 'i'
            };
        }
        // Tags
        if(req.query.tags) {
            query.tags = {
                $regex: req.query.tags,
                $options: "i",
            }
        }
        // Likes
        const minLikes = Number(req.query.minLikes);
        if(!isNaN(minLikes) && minLikes > 0) {
            // Get pictures >= minLikes
            query.$expr = { $gte: [{ $size: "$likes" }, minLikes] }
        }
        // Date (images before or after a given date)
        if(req.query.date && req.query.dateFilter) {
            // Turn date into JS date object
            const date = new Date(req.query.date);
            // Date needs to be a valid date, turn into MS
            if(!isNaN(date.getTime())) {
                // If not looking for images after or before a date, assume on the date
                if(req.query.dateFilter === 'after') {
                    query.createdDate = { $gte: date };
                }
                else if(req.query.dateFilter === 'before') {
                    query.createdDate = { $lte: date };
                }
                else if(req.query.dateFilter === 'same') {
                    // Need to give a full day's range, not just 1 day at midnight
                    const nextDate = new Date(date);
                    nextDate.setDate(date.getDate() + 1);
                    query.createdDate = {
                        $gte: date,
                        $lt: nextDate,
                    };
                }
            }
        }
        // "order" changes .sort(), "dateDescending" is the default value
        let sort = { createdDate: -1 };
        switch (req.query.order) {
            case 'dateAscending':
                sort = { createdDate: 1 };
                break;
            case 'nameA-Z':
                sort = { name: 1 };
                break;
            case 'nameZ-A':
                sort = { name: -1 };
                break;
        }
        // Rest of function
        const docs = await Picture.find(query).select('image mimetype name').sort(sort).lean().exec();
        const pictures = docs.map(picture => ({
            ...picture,
            image: convertToData(picture.mimetype, picture.image),
        }));
        return res.json({ pictures });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving pictures!' });
    }
}

// Get all data pertaining to a picture
const getPictureData = async (req, res) => {
    try {
        const query = {
            _id: req.query._id,
        };
        // Rest of function
        let pictureData = await Picture.findOne(query).lean().exec();
        if(!pictureData) {
            return res.status(404).json({ error: "Picture not found! "});
        }
        pictureData = {
            ...pictureData,
            image: convertToData(pictureData.mimetype, pictureData.image),
        };
        return res.json({ pictureData });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving picture data!' });
    }
}

// Like or unlike an image
const likePicture = async (req, res) => {
    try {
        const query = {
            _id: req.body._id,
        };
        // No lean(), need to keep this in Mongo's format to update it
        const picture = await Picture.findOne(query).exec();
        if(!picture) {
            return res.status(404).json({ error: "Picture not found!" });
        }
        // If the user has liked, remove like, otherwise add like
        // .some() is akin to something like .contains() (Documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
        let liked = false;
        if(picture.likes.some((id) => id.equals(req.session.account._id))) {
            await Picture.updateOne(
                { _id: picture._id },
                // $pull removes the value from the field (Documentation: https://www.mongodb.com/docs/manual/reference/operator/update/pull/)
                { $pull: { likes: req.session.account._id } },
            );
        }
        else {
            await Picture.updateOne(
                { _id: picture._id },
                // $addToSet does the opposite of $pull and adds to the field (Documentation: https://www.mongodb.com/docs/manual/reference/operator/update/addtoset/#mongodb-update-up.-addToSet)
                { $addToSet: { likes: req.session.account._id } },
            );
            liked = true;
        }
        // Return whether or not this one is liked, used to update the like button
        return res.status(201).json({ liked });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving picture data!' });
    }
}

// Get whether a picture is liked or not
const getLiked = async (req, res) => {
    try {
        const query = {
            _id: req.query._id,
        };
        // No lean(), need to keep this in Mongo's format to update it
        const picture = await Picture.findOne(query).exec();
        if(!picture) {
            return res.status(400).json({ error: "Picture not found!" });
        }
        // Return whether or not this one is liked, used to update the like button
        return res.status(200).json({ liked: picture.likes.some((id) => id.equals(req.session.account._id)) });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving picture data!' });
    }
}

// Delete a picture
const deletePicture = async (req, res) => {
    try {
        const query = { 
            owner: req.session.account._id,
            _id: req.body._id,
        }
        const deletedPicture = await Picture.findOneAndDelete(query);
        if (deletedPicture) {
            return res.status(200).json({ message: "Deleted Picture successfully!" });
        }
        return res.status(404).json({ error: "Picture not found!" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error deleting Picture!' });
    }
}

// Turn image into buffer before storing (https://nodejs.org/api/buffer.html#static-method-bufferfromarray)
const convertToBuffer = (image) => {
    // Remove prefix before converting, images stored without prefix
    const prefixEnd = image.indexOf(',');
    // If image begins with "data:" and the comma after base64 exists, slice the first half off
    if (image.startsWith('data:') && prefixEnd !== -1) {
        image = image.slice(prefixEnd + 1);
    }
    return Buffer.from(image, 'base64');
}

// Turn image into usable data for frontend
// "data:" format: https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data
// Convert buffer to string: https://nodejs.org/api/buffer.html#buftostringencoding-start-end
const convertToData = (mimetype, image) => {
    return `data:${mimetype};base64,${image.toString('base64')}`;
}

module.exports = {
    mainPage,
    makePicture,
    // getMyPictures,
    getPictures,
    getPictureData,
    likePicture,
    getLiked,
    deletePicture,
};