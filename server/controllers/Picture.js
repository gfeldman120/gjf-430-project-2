const models = require('../models');
const Picture = models.Picture;

const makerPage = async (req, res) => {
    res.render('app');
};

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
            name: req.query.name
        };
        // Rest of function
        const pictureData = await Picture.find(query).lean().exec();
        return res.json({ pictureData });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving picture data!' });
    }
}

const makeDomo = async (req, res) => {
    if(!req.body.name || !req.body.age || !req.body.level) {
        return res.status(400).json({ error: 'Name, age and level are required!' });
    }

    const domoData = {
        name: req.body.name,
        age: req.body.age,
        level: req.body.level,
        owner: req.session.account._id,
    };

    try {
        const newDomo = new Domo(domoData);
        await newDomo.save();
        return res.status(201).json({ name: newDomo.name, age: newDomo.age, level: newDomo.level });
    } catch (err) {
        console.log(err);
        if(err.code === 11000) {
            return res.status(400).json({ error: 'Domo already exists!' });
        }
        return res.status(500).json({ error: 'An error occured making domo!' });
    }
}

const deleteDomo = async (req, res) => {
    try {
        const query = { 
            owner: req.session.account._id,
            _id: req.body._id,
        };
        const deletedDomo = await Domo.findOneAndDelete(query);
        if (deletedDomo) {
            return res.status(200).json({ message: "Deleted Domo successfully!" });
        }
        return res.status(404).json({ error: "Domo not found!" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error deleting Domo!' });
    }
}

module.exports = {
    makerPage,
    getDomos,
    makeDomo,
    deleteDomo,
};