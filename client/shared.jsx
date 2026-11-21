// This file exists to hold React components used across multiple pages
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
            <img src={picture.image} alt={picture.name} className="pictureImg" onClick={() => shared.renderPage(root, () => <props.Details id={picture._id}/>)}/>
        </div>
    ));

    return (
        <>
            {pictureList}
        </>
    );
}

// Link to the main page, reused across both navigation bar versions
const HomeLink = (props) => {
    return (
        <div className="navlink"><a href="/mainPage">Home</a></div>
    );
}

// Navigation bar, consistent across all screens
const Navigation = (props) => {
    const [loggedIn, setLoggedIn] = useState(false);

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

    if(loggedIn) {
        return (
            <nav>
                <HomeLink/>
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
const ErrorBox = () => {
    return (
        <div id="errorBox" style={{ display: "none" }}>
            <p id="errorBoxMessage"></p>
        </div>
    );
}

// Display a page: Surround content with elements found on every page (but not part of handlebars due to these elements being dynamic in some way)
const Page = (props) => {
    return (
        <>
            <Navigation/>
            {props.content}
            <ErrorBox/>
        </>
    );
}

// Make using Page easier to read
const renderPage = (root, content) => {
    root.render(<Page content={content}/>);
}

// Make an error appear to the user for 5 seconds
const handleError = (message) => {
    const errorBox = document.getElementById('errorBox');
    const errorMessage = document.getElementById('errorBoxMessage');
    if (!errorBox || !errorMessage) return;
    // If error timeout exists, stop it >> Show the block, wait 5 seconds, hide it
    clearTimeout(errorTimeout);
    errorMessage.textContent = message;
    errorBox.style.display = 'block';
    errorTimeout = setTimeout(() => {
        errorBox.style.display = 'none';
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

module.exports = {
    PictureList,
    renderPage,
    handleError,
    sendPost,
}