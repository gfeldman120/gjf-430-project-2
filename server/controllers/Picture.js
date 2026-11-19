const models = require('../models');
const Picture = models.Picture;

const makerPage = async (req, res) => {
    res.render('app');
};

// Make a picture
const makePicture = async (req, res) => {
    // Required fields
    if(!req.body.name || !req.body.image || !req.body.size || !req.body.mimetype) {
        return res.status(400).json({ error: 'All fields are required!' });
    }
    const pictureData = {
        name: req.body.name,
        image: req.body.image,
        size: req.body.size,
        mimetype: req.body.mimetype,
        owner: req.session.account._id,
    };
    // Optional fields
    if(req.body.description) {
        pictureData.description = req.body.description;
    }
    if(req.body.tags) {
        picture.tags = req.body.tags;
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

// Get the photos from the current user,
const getMyPictures = async (req, res) => {
    try {
        const query = { owner: req.session.account._id };
        const docs = await Picture.find(query).lean().exec();
        return res.json({pictures: docs});
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving pictures!' });
    }
}

// Get ONLY images based on filters
const getPictures= async (req, res) => {
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
        if(req.query.minLikes) {
            // Get pictures >= minLikes
            $expr: { $gte: [{ $size: "$likes" }, req.query.minLikes] }
        }
        // Date (images before or after a given date)
        if(req.query.date && req.query.dateFilter) {
            // Turn date into JS date object
            const date = new Date(req.query.date);
            // Date needs to be a valid date, turn into MS
            if(!isNaN(date.getTime())) {
                // If not looking for images after a date, assume before
                if(req.query.dateFilter === 'after') {
                    query.createdDate = { $gte: date };
                }
                else {
                    query.createdDate = { $lte: date };
                }
            }
        }
        // Rest of function
        const docs = await Picture.find(query).select('image').lean().exec();
        return res.json({pictures: docs});
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving pictures!' });
    }
}

// Get all data pertaining to a picture
const getPictureData = async (req, res) => {
    try {
        const query = {
            _id: req.body._id,
        };
        // Rest of function
        const pictureData = await Picture.find(query).lean().exec();
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
        const picture = await Picture.find(query).exec();
        if(!picture) {
            return res.status(400).json({ error: "Picture not found!" });
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
        const picture = await Picture.find(query).exec();
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

module.exports = {
    makerPage,
    makePicture,
    getMyPictures,
    getPictures,
    getPictureData,
    likePicture,
    getLiked,
    deletePicture,
};