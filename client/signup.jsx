const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');

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

const SignupWindow = (props) => {
    return (
        <form id="signupForm" name="signupForm" onSubmit={handleSignup} action="/signup" method="POST" className="mainForm">
            <label htmlFor="username">Username: </label>
            <input id="user" type="text" name="username" placeholder="username"/>
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password"/>
            <label htmlFor="pass2">Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="retype password"/>
            <input className="formSubmit" type="submit" value="Sign in"/>
        </form>
    );
}

// Signup with navigation bar
const SignupApp = (props) => {
    return (
        <div>
            <shared.Navigation/>
            <SignupWindow/>
        </div>
    )
}

const init = () => {
    const root = createRoot(document.getElementById('application'));
    root.render(<SignupApp/>);
}

window.onload = init;