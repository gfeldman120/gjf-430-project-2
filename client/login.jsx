const helper = require('./helper.js');
const shared = require('./shared.jsx');
const React = require('react');
const {createRoot} = require('react-dom/client');
// Root is defined here to allow functions to access it
let root;

const handleLogin = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if(!username || !pass) {
        helper.handleError('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass});
    return false;
}

const handleSignup = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if(!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if(pass !== pass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass, pass2});
    return false;
}

const LoginWindow = (props) => {
    return (
        <>
            <form id="loginForm" name="loginForm" onSubmit={handleLogin} action="/login" method="POST" className="mainForm">
                <label htmlFor="username">Username: </label>
                <input id="user" type="text" name="username" placeholder="username"/>
                <label htmlFor="pass">Password: </label>
                <input id="pass" type="password" name="pass" placeholder="password"/>
                <input className="formSubmit" type="submit" value="Sign in"/>
            </form>
            <button type="button" onClick={() => root.render(<shared.Page content={<SignupWindow/>}/>)}>Create An Account</button>
        </>
    );
}

const SignupWindow = (props) => {
    return (
        <>
            <form id="signupForm" name="signupForm" onSubmit={handleSignup} action="/signup" method="POST" className="mainForm">
                <label htmlFor="username">Username: </label>
                <input id="user" type="text" name="username" placeholder="username"/>
                <label htmlFor="pass">Password: </label>
                <input id="pass" type="password" name="pass" placeholder="password"/>
                <label htmlFor="pass2">Password: </label>
                <input id="pass2" type="password" name="pass2" placeholder="retype password"/>
                <input className="formSubmit" type="submit" value="Sign in"/>
            </form>
            <button type="button" onClick={() => root.render(<shared.Page content={<LoginWindow/>}/>)}>Use An Existing Account</button>
        </>
    );
}

const init = () => {
    root = createRoot(document.getElementById('application'));
    root.render(<shared.Page content={<LoginWindow/>}/>);
}

window.onload = init;