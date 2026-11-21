const controllers = require('./controllers');
const mid = require('./middleware');
const router = (app) => {
    // Picture
    app.get('/getPictures', mid.requiresSecure, controllers.Picture.getPictures);
    app.get('/getMyPictures', mid.requiresLogin, controllers.Picture.getMyPictures);
    app.get('/getPictureData', mid.requiresSecure, controllers.Picture.getPictureData);
    app.get('/getLiked', mid.requiresLogin, controllers.Picture.getLiked);
    app.get('/isMine', mid.requiresLogin, controllers.Picture.isMine);
    
    app.post('/makePicture', mid.requiresLogin, controllers.Picture.makePicture);
    app.post('/likePicture', mid.requiresLogin, controllers.Picture.likePicture);
    app.post('/deletePicture', mid.requiresLogin, controllers.Picture.deletePicture);
    app.post('/editPictureData', mid.requiresLogin, controllers.Picture.editPictureData);
    
    // Account
    app.get('/logout', mid.requiresLogin, controllers.Account.logout);
    app.get('/getLoggedIn', mid.requiresSecure, controllers.Account.getLoggedIn);
    app.get('/getPremium', mid.requiresLogin, controllers.Account.getPremium);
    
    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
    app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
    app.post('/makePremium', mid.requiresLogin, controllers.Account.makePremium);

    // Pages
    app.get('/mainPage', mid.requiresSecure, controllers.Pages.mainPage);
    app.get('/accountPage', mid.requiresLogin, controllers.Pages.accountPage);
    app.get('/loginPage', mid.requiresSecure, mid.requiresLogout, controllers.Pages.loginPage);
    app.get('/', mid.requiresSecure, controllers.Pages.mainPage);

    // Fallback
    app.get('/*wild', controllers.Pages.mainPage);
};
module.exports = router;