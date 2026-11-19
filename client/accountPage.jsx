const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');

const handleChangePassword = (e) => {
    const pass = e.target.querySelector('#pass').value;
    const newPass = e.target.querySelector('#newPass').value;
    const newPass2 = e.target.querySelector('#newPass2').value;

    if(!pass || !newPass || !newPass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if(newPass !== newPass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {pass, newPass, newPass2});
    return false;
}

const ChangePasswordWindow = (props) => {
    return (
        <form id="changePasswordForm" name="changePasswordForm" onSubmit={handleChangePassword} action="/changePassword" method="POST" className="mainForm">
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password"/>
            <label htmlFor="newPass">New password: </label>
            <input id="newPass" type="password" name="newPass" placeholder="new password"/>
            <label htmlFor="newPass2">Retype new password: </label>
            <input id="newPass2" type="password" name="newPass2" placeholder="retype new password"/>
            <input className="formSubmit" type="submit" value="Change password"/>
        </form>
    );
}

const init = () => {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const changePasswordButton = document.getElementById('changePasswordButton');

    const root = createRoot(document.getElementById('content'));

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<LoginWindow/>);
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<SignupWindow/>);
        return false;
    });

    changePasswordButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<ChangePasswordWindow/>);
        return false;
    });

    root.render(<LoginWindow/>);
}

window.onload = init;