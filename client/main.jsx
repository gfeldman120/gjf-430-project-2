const shared = require('./shared.jsx');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
// Root is defined here to allow functions to access it
let root;

// Handle searching
const handleSearch = async (e, onParamsGot) => {
    e.preventDefault();

    const name = e.target.querySelector("#pictureName").value.trim();
    const username = e.target.querySelector("#pictureUsername").value.trim();
    // Tags should split on ',', ignore all spaces and remove # (despite display), also removes tags that don't exist following this
    const tags = e.target.querySelector("#pictureTags").value.split(',').map(tag => tag.trim().replace('#', '')).filter(tag => tag.length > 0);
    const minLikes = e.target.querySelector("#pictureMinLikes").value;
    const date = e.target.querySelector("#pictureDate").value;
    const dateFilter = e.target.querySelector("#pictureDateFilter").value;
    const order = e.target.querySelector("#pictureOrder").value;

    // Adding parameters to query, only if they apply
    // Used https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/append to learn how to append after making the URLSearchParams object
    const params = new URLSearchParams();
    if(name.length > 0) {
        params.append("name", name);
    }
    if(username.length > 0) {
        params.append("username", username);
    }
    if(tags.length > 0) {
        params.append("tags", tags);
    }
    if(minLikes > 0) {
        params.append("minLikes", minLikes);
    }
    if(date && dateFilter.length > 0) {
        params.append("date", date);
        params.append("dateFilter", dateFilter);
    }
    params.append("order", order);

    onParamsGot(params.toString());
}

// Form used for searching pictures
const PictureSearch = (props) => {
    // Used https://www.w3schools.com/tags/tag_select.asp to figure out select
    return(
        <form id="pictureSearch"
            onSubmit={(e) => handleSearch(e, props.triggerReload)}
            name="pictureSearch"
            className="pictureSearch"
        >
            <label htmlFor="pictureName">Name: </label>
            <input id="pictureName" type="text" name="name" placeholder="Picture name"/>
            <label htmlFor="pictureUsername">Poster's username: </label>
            <input id="pictureUsername" type="text" name="username" placeholder="Picture username"/>
            <label htmlFor="pictureTags">Tags: </label>
            <input id="pictureTags" type="text" name="tags" placeholder="Tags, separated by commas"/>
            <label htmlFor="pictureMinLikes">Minimum Likes: </label>
            <input id="pictureMinLikes" type="number" min="0" name="minLikes"/>
            <label htmlFor="pictureDate">Date: </label>
            <input id="pictureDate" type="date" name="date"/>
            <label htmlFor="pictureDateFilter">Filter: </label>
            <select id="pictureDateFilter" name="dateFilter">
                <option value="">No Date Filter</option>
                <option value="same">Same Date</option>
                <option value="before">Before Date</option>
                <option value="after">After Date</option>
            </select>
            <label htmlFor="pictureOrder">Order: </label>
            <select id="pictureOrder" name="order">
                <option value="dateDescending">Date, Descending</option>
                <option value="dateAscending">Date, Ascending</option>
                <option value="nameA-Z">Name, A-Z</option>
                <option value="nameZ-A">Name, Z-A</option>
            </select>
            <input id="pictureSubmit" type="submit" value="Search"/>
        </form>
    );
}

// Handle liking (or unliking) an image
const handleLike = async (id, setLiked, setLikesCount, setIsLiking) => {
    setIsLiking(true);
    try {
        const response = await fetch('/likePicture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: id }),
        });
        const data = await response.json();
        setLiked(data.liked);
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (err) {
        console.error('Error liking picture:', err);
    // Finally ensures that this is set to false AFTER everything finishes, successful or not
    } finally {
        setIsLiking(false);
    }
}

// Show user-facing details of an image, must stay seperate from accountPage due to functionality differences
const PictureDetails = (props) => {
    // States for loggedIn and isOwner used to determine if like button should display
    const [picture, setPicture] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    // States for like button, need to update when like button is used (also, updating visual upon component mount)
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    // Need a state to stop users from spamming the like button
    const [isLiking, setIsLiking] = useState(false);

    useEffect(() => {
        const getPicture = async () => {
            try {
                // Get picture, then get logged in, then check if mine
                const response = await fetch (`/getPictureData?_id=${props.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setPicture(data);
                // Also set current likes count
                setLikesCount(data.likes.length);
                // Logged in
                const loginResponse = await fetch('/getLoggedIn', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const loginData = await loginResponse.json();
                setLoggedIn(loginData.loggedIn);
                // Check if mine, only if logged in
                if (loginData.loggedIn) {
                    const ownerResponse = await fetch(`/isMine?_id=${props.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const ownerData = await ownerResponse.json();
                    setIsOwner(ownerData.isMine);
                    // See if currently liked
                    const likedResponse = await fetch(`/getLiked?_id=${props.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const likedData = await likedResponse.json();
                    setLiked(likedData.liked);
                }
            } catch {
                console.log("Error loading picture");
            }
        };
        getPicture();
    }, [props.id]);

    if(picture) {
        return (
            <>
                <div className="pictureDetailsHeader">
                    <button type="button" onClick={() => shared.renderPage(root, <ListApp/>)}>Return</button>
                </div>
                <div className="pictureDetails">
                    <h1>{picture.name}</h1>
                    <img src={picture.image} alt={picture.name}/>
                    <h2>{picture.username}</h2>
                    <h2>{picture.createdDate}</h2>
                    <div>
                        {loggedIn && !isOwner && (
                            // Background color changing is temporary, idealy should use different images
                            // Works due to conditional rendering: https://react.dev/learn/conditional-rendering
                            <button type="button" onClick={() => handleLike(props.id, setLiked, setLikesCount, setIsLiking)} disabled={isLiking} style={{backgroundColor: liked ? 'blue' : 'red', color: 'white',}}>LIKE</button>
                        )}
                        <p>{likesCount}</p>
                    </div>
                    <ul>
                        {picture.tags.map(tag => <li key={tag}>{tag}</li>)}
                    </ul>
                    <p>{picture.description}</p>
                </div>
            </>
        );
    }
    return (
        <>
            <div className="pictureDetailsHeader">
                <button type="button" onClick={() => shared.renderPage(root, <ListApp/>)}>Return</button>
            </div>
            <div className="pictureDetails">
                <h2>Loading picture...</h2>
            </div>
        </>
    );
}

// Container for page when showing images
const ListApp = () => {
    // Give default search params for when page loads, also trigger reload when search params change (only upon submit)
    const [searchParams, setSearchParams] = useState('order=dateDescending');
    const [reload, setReload] = useState(0);

    const triggerReload = (params) => {
        setSearchParams(params);
        setReload(reload + 1);
    };

    return (
        <>
            <PictureSearch triggerReload={triggerReload}/>
            <shared.PictureList url={"/getPictures"} root={root} searchParams={searchParams} reload={reload} Details={PictureDetails}/>
        </>
    );
}

const init = () => {
    root = createRoot(document.getElementById('application'));
    shared.renderPage(root, <ListApp/>);
}

window.onload = init;