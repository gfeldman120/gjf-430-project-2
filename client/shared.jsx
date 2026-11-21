// This file exists to hold React components and functions used across multiple pages
const React = require('react');
const { useState, useEffect } = React;

// Display a list of pictures and update upon searching
const PictureList = (props) => {
    const [pictures, setPictures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const getPictures = async () => {
            const response = await fetch(`${props.url}?${props.searchParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to load pictures');
            }
            const data = await response.json();
            setPictures(data);
            setLoading(false);
        };
        getPictures();
    // Both reload and search params must have changed
    }, [props.searchParams, props.reload]);
    
    if (loading) {
        return (
            <>
                <h3>Loading pictures</h3>
            </>
        );
    }

    if(pictures.length === 0) {
        return (
            <div className="pictureList">
                <h3 className="noPictures">No pictures found.</h3>
            </div>
        );
    }

    const pictureList = pictures.map(picture => (
        <div key={picture._id} className="picture">
            <img src={picture.image} alt={picture.name} className="pictureImg" onClick={() => renderPage(props.root, <props.Details id={picture._id}/>)}/>
        </div>
    ));

    return (
        <div>
            {pictureList}
        </div>
    );
}

// Link to the main page, reused across both navigation bar versions
const HomeLink = (props) => {
    return (
        <div className="navlink"><a href="/mainPage">Home</a></div>
    );
}

// Handle making an account premium
const handleMakePremium = async (setPremium) => {
    try {
        const response = await fetch('/makePremium', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error("Something went wrong!");
        }
        setPremium(true);
    } catch (err) {
        handleError("Something went wrong!");
    }
}

// Navigation bar, consistent across all screens
const Navigation = (props) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [isPremium, setPremium] = useState(null);

    // Default to not logged in and renders as such upon mounting, re-renders if loggedIn changes (if request succeeds and returns loggedIn being true)
    useEffect(() => {
        const getLoggedInFromServer = async () => {
            const response = await fetch ('/getLoggedIn', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setLoggedIn(data.loggedIn);
        }
        getLoggedInFromServer();
    }, []);
    // If logged in, check premium status (used for button on navbar)
    useEffect(() => {
        if (!loggedIn) return;
        const getPremiumFromServer = async () => {
            const response = await fetch('/getPremium', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error("Something went wrong!");
            }
            setPremium(data.premium);
            console.log(data.premium);
        }
        getPremiumFromServer();
    }, [loggedIn]);

    if(loggedIn) {
        // Only show premium button if not already premium
        return (
            <nav>
                <HomeLink/>
                {isPremium === false && (
                    // Works due to conditional rendering: https://react.dev/learn/conditional-rendering
                    <div className="navlink"><button type="button" onClick={() => handleMakePremium(setPremium)}>Upgrade to Premium</button></div>
                )}
                {isPremium === true && (
                    // Works due to conditional rendering: https://react.dev/learn/conditional-rendering
                    <p>(Using Premium Account)</p>
                )}
                <div className="navlink"><a href="/accountPage">Account</a></div>
                <div className="navlink"><a href="/logout">Log out</a></div>
            </nav>
        );
    }
    else {
        return (
            <nav>
                <HomeLink/>
                <div className="navlink"><a id="loginButton" href="/loginPage">Login/Signup</a></div>
            </nav>
        );
    }
}

// Error box used on all pages
const MessageBox = () => {
    return (
        <div id="messageBox" style={{ display: "none" }}>
            <p id="messageBoxMessage"></p>
        </div>
    );
}

// Display a page: Surround content with elements found on every page (but not part of handlebars due to these elements being dynamic in some way)
const Page = (props) => {
    return (
        <div>
            <Navigation/>
            {props.content}
            <MessageBox/>
        </div>
    );
}

// Make using Page easier to read
const renderPage = (root, content) => {
    root.render(<Page content={content}/>);
}

// Show a message in the style of an error
const handleError = (message) => {
    showMessage(message, "#FFB3B3")
}

// Make a message appear to the user for 5 seconds
// Need to define timeout outside of function so it persists
let messageTimeout;
const showMessage = (message, color) => {
    const messageBox = document.getElementById('messageBox');
    const messageBoxMessage = document.getElementById('messageBoxMessage');
    if (!messageBox || !messageBoxMessage) return;
    messageBox.style.backgroundColor = color;
    // If error timeout exists, stop it >> Show the block, wait 5 seconds, hide it
    clearTimeout(messageTimeout);
    messageBoxMessage.textContent = message;
    messageBox.style.display = 'block';
    messageTimeout = setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

// Send a generic POST request based on inputs, allows for redirects & display of errors
const sendPost = async (url, data, handler) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    // If redirected, do this before trying to parse JSON to avoid errors
    if (response.redirected) {
        window.location.href = response.url;
        return;
    }

    const result = await response.json();

    if(result.redirect) {
        window.location = result.redirect;
    }

    if(result.error) {
        handleError(result.error);
    }

    if(handler) {
        handler(result);
    }
}

// Old export syntax required for ES modules
export {
    PictureList,
    renderPage,
    handleError,
    sendPost,
}