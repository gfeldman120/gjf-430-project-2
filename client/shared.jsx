// This file exists to hold React components used across multiple pages
const React = require('react');
const { useState, useEffect } = React;

const HomeLink = (props) => {
    return (
        <div class="navlink"><a href="/mainPage">Home</a></div>
    );
}

const Navigation = (props) => {
    const [loggedIn, setLoggedIn] = useState(false);

    // Default to not logged in, re-render if loggedIn changes (if request succeeds and returns loggedIn being true)
    useEffect(() => {
        const getLoggedInFromServer = async () => {
            const response = await fetch ('/getLoggedIn');
            const data = await response.json();
            setLoggedIn(data.loggedIn);
        }
        getLoggedInFromServer();
    }, [loggedIn]);

    if(loggedIn) {
        return (
            <nav>
                <HomeLink/>
                <div class="navlink"><a href="/accountPage">Account</a></div>
                <div class="navlink"><a href="/logout">Log out</a></div>
            </nav>
        );
    }
    else {
        return (
            <nav>
                <HomeLink/>
                <div class="navlink"><a id="loginButton" href="/loginPage">Login/Signup</a></div>
            </nav>
        );
    }
}

// Using Page for consistent elements across pages
const Page = (props) => {
    return (
        <Navigation/>
        {props.content}
    );
}

module.exports = {
    Page,
}