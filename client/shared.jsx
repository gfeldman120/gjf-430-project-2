// This file exists to hold React components used across multiple pages
const React = require('react');
const { useState, useEffect } = React;

// Link to the main page, reused across both navigation bar versions
const HomeLink = (props) => {
    return (
        <div class="navlink"><a href="/mainPage">Home</a></div>
    );
}

// Navigation bar, consistent across all screens
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

// Display a page: Surround content with elements found on every page (but not part of handlebars due to these elements being dynamic in some way)
const Page = (props) => {
    return (
        <>
            <Navigation/>
            {props.content}
        </>
    );
}

module.exports = {
    Page,
}