// Dispaly the main page
const mainPage = async (req, res) => {
    return res.render('main');
};

// Display the login page
const loginPage = (req, res) => {
    return res.render('login');
}

// Display the account page
const accountPage = (req, res) => {
    return res.render('account');
}

module.exports = {
    mainPage,
    loginPage,
    accountPage,
}