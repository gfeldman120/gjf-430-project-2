const models = require('../models');
const Account = models.Account;

const loginPage = (req, res) => {
    return res.render('login');
};

const logout = (req, res) => {
    req.session.destroy();
    return res.redirect('/');
}

const login = (req, res) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    if(!username || !pass) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    return Account.authenticate(username, pass, (err, account) => {
        if(err || !account) {
            return res.status(401).json({ error: 'Wrong username or password!' });
        }
        req.session.account = Account.toAPI(account);
        return res.json({ redirect: '/maker' });
    });
};

const signup = async (req, res) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    const pass2 = `${req.body.pass2}`;

    if(!username || !pass || !pass2) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    if(pass != pass2) {
        return res.status(400).json({ error: 'Passwords do not match!' });
    }

    try {
        const hash = await Account.generateHash(pass);
        const newAccount = new Account({username, password: hash});
        await newAccount.save();
        req.session.account = Account.toAPI(newAccount);
        return res.json({ redirect: '/maker' });
    } catch (err) {
        console.log(err);
        if(err.code === 11000) {
            return res.status(400).json({ error: 'Username already in use!' });
        }
        return res.status(500).json({ error: 'An error occured!' });
    }
};

// Change this account's password
const changePassword = async (req, res) => {
    const pass = `${req.body.pass}`;
    const newPass = `${req.body.newPass}`;
    const newPass2 = `${req.body.newPass2}`;

    if(!pass || !newPass || !newPass2) {
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
        return res.json({ message: "Password updated!" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'An error occured!' });
    }
};

module.exports = {
    loginPage,
    login,
    logout,
    signup,
    changePassword,
}