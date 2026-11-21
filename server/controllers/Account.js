const models = require('../models');
const Account = models.Account;

// Log the user out
const logout = (req, res) => {
    // Destroy has a callback to ensure that the redirect occurs after the session is destroyed: https://github.com/expressjs/session
    req.session.destroy((err) => {
        if(err) {
            return res.status(500).json({ error: "Logout failed! "});
        }
        return res.json({ redirect: '/mainPage' });
    });
}

// Try logging the user in
const login = (req, res) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    if(!username || username.length === 0 || !pass || pass.length === 0) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    return Account.authenticate(username, pass, (err, account) => {
        if(err || !account) {
            return res.status(401).json({ error: 'Wrong username or password!' });
        }
        req.session.account = Account.toAPI(account);
        return res.json({ redirect: '/mainPage' });
    });
}

// Try creating an account for the user (automatically signs the user in)
const signup = async (req, res) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    const pass2 = `${req.body.pass2}`;

    if(!username || username.length === 0 || !pass || pass.length === 0 || !pass2 || pass2.length === 0) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    if(pass !== pass2) {
        return res.status(400).json({ error: 'Passwords do not match!' });
    }

    try {
        const hash = await Account.generateHash(pass);
        const newAccount = new Account({username, password: hash});
        await newAccount.save();
        req.session.account = Account.toAPI(newAccount);
        return res.json({ redirect: '/mainPage' });
    } catch (err) {
        console.log(err);
        if(err.code === 11000) {
            return res.status(400).json({ error: 'Username already in use!' });
        }
        return res.status(500).json({ error: 'An error occured!' });
    }
}

// Change this account's password
const changePassword = async (req, res) => {
    const pass = `${req.body.pass}`;
    const newPass = `${req.body.newPass}`;
    const newPass2 = `${req.body.newPass2}`;

    if(!pass || pass.length === 0 || !newPass || newPass.length === 0 || !newPass2 || newPass2.length === 0) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    if(pass === newPass) {
        return res.status(400).json({ error: 'New password is the same!' });
    }

    if(newPass !== newPass2) {
        return res.status(400).json({ error: 'Passwords do not match!' });
    }

    try {
        const account = await Account.findById(req.session.account._id);
        const valid = await Account.checkPassword(pass, account.password);
        if(!valid) {
            return res.status(401).json({ error: "Incorrect current password!" });
        }
        const hash = await Account.generateHash(newPass);
        account.password = hash;
        await account.save();
        return res.status(201).json({ message: "Password updated!" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'An error occured!' });
    }
}

// Mark this account as premium
const makePremium = async (req, res) => {
    try {
        const account = await Account.findById(req.session.account._id);
        account.premium = true;
        await account.save();
        return res.status(201).json({ message: "Account made premium!" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'An error occured!' });
    }
}

// Check if this account is premium
const getPremium = async (req, res) => {
    try {
        return res.status(200).json({ premium: req.session.account.premium ? true : false });
    } catch {
        return res.status(500).json({ error: "Server error!" });
    }
}

// Check if an account is logged in
const getLoggedIn = (req, res) => {
    try {
        return res.status(200).json({ loggedIn: req.session.account ? true : false });
    } catch {
        return res.status(500).json({ error: "Server error!" });
    }
}

module.exports = {
    login,
    logout,
    signup,
    changePassword,
    makePremium,
    getPremium,
    getLoggedIn,
}