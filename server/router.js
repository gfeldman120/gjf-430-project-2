const controllers = require('./controllers');
const mid = require('./middleware');
const router = (app) => {
    // Picture
    app.get('/getPictures', mid.requiresSecure, controllers.Picture.getPictures);
    app.get('/getMyPictures', mid.requiresLogin, controllers.Picture.getMyPictures);
    app.get('/getPictureData', mid.requiresSecure, controllers.Picture.getPictureData);
    app.get('/getLiked', mid.requiresLogin, controllers.Picture.getLiked);
    
    app.post('/makePicture', mid.requiresLogin, controllers.Picture.makePicture);
    app.post('/likePicture', mid.requiresLogin, controllers.Picture.likePicture);
    app.post('/deletePicture', mid.requiresLogin, controllers.Picture.deletePicture);
    
    // Account
    app.get('/logout', mid.requiresLogin, controllers.Account.logout);
    app.get('/getLoggedIn', mid.requiresSecure, controllers.Account.getLoggedIn);
    
    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
    app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
    app.post('/makePremium', mid.requiresLogin, controllers.Account.makePremium);

    // Pages
    app.get('/mainPage', mid.requiresSecure, controllers.Picture.mainPage);
    app.get('/accountPage', mid.requiresLogin, controllers.Account.accountPage);
    app.get('/loginPage', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.get('/', mid.requiresSecure, controllers.Picture.mainPage);
};
module.exports = router;