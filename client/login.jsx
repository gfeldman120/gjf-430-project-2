const shared = require('./shared.jsx');
const React = require('react');
const { createRoot } = require('react-dom/client');
// Root is defined here to allow functions to access it
let root;

// Handle logging in
const handleLogin = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if(!username || !pass) {
        shared.handleError('Username or password is empty!');
        return false;
    }

    shared.sendPost(e.target.action, {username, pass});
    return false;
}

// Handle signing up
const handleSignup = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if(!username || !pass || !pass2) {
        shared.handleError('All fields are required!');
        return false;
    }

    if(pass !== pass2) {
        shared.handleError('Passwords do not match!');
        return false;
    }

    shared.sendPost(e.target.action, {username, pass, pass2});
    return false;
}

// Window used to login
const LoginWindow = (props) => {
    return (
        <div>
            <form id="loginForm" name="loginForm" onSubmit={handleLogin} action="/login" method="POST" className="mainForm">
                <label htmlFor="user">Username: </label>
                <input id="user" type="text" name="username" placeholder="username"/>
                <label htmlFor="pass">Password: </label>
                <input id="pass" type="password" name="pass" placeholder="password"/>
                <input className="formSubmit" type="submit" value="Sign in"/>
            </form>
            <button type="button" onClick={() => shared.renderPage(root, <SignupWindow/>)}>Create An Account</button>
        </div>
    );
}

// Window used to sign up
const SignupWindow = (props) => {
    return (
        <div>
            <form id="signupForm" name="signupForm" onSubmit={handleSignup} action="/signup" method="POST" className="mainForm">
                <label htmlFor="user">Username: </label>
                <input id="user" type="text" name="username" placeholder="username"/>
                <label htmlFor="pass">Password: </label>
                <input id="pass" type="password" name="pass" placeholder="password"/>
                <label htmlFor="pass2">Password: </label>
                <input id="pass2" type="password" name="pass2" placeholder="retype password"/>
                <input className="formSubmit" type="submit" value="Create Account"/>
            </form>
            <button type="button" onClick={() => shared.renderPage(root, <LoginWindow/>)}>Use An Existing Account</button>
        </div>
    );
}

const init = () => {
    root = createRoot(document.getElementById('application'));
    shared.renderPage(root, <LoginWindow/>);
}

window.onload = init;