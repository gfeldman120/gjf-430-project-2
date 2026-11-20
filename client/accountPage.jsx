const helper = require('./helper.js');
const shared = require('./shared.jsx');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
// Root is defined here to allow functions to access it
let root;

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

const ChangePasswordWindow = () => {
    return (
        <form id="changePasswordForm" name="changePasswordForm" onSubmit={handleChangePassword} action="/changePassword">
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

const handlePictureCreation = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const response = await fetch('/makePicture', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if(data) {
            console.log("Picture created");
        }
    } catch(err) {
        console.log("Error making picture");
    }
};

const MakeImageWindow = () => {
    return (
        <form id="makePictureForm" name="makePictureForm" onSubmit={handlePictureCreation}>
            <label htmlFor="pictureName">Name:</label>
            <input id="pictureName" name="name" type="text"/>
            <label htmlFor="pictureImage">Image:</label>
            <input id="pictureImage" name="image" type="file" accept="image/*"/>
            <label htmlFor="pictureDescription">Description:</label>
            <textarea id="pictureDescription" name="description"/>
            <label htmlFor="pictureTags">Tags (comma-separated):</label>
            <input id="pictureTags" name="tags" type="text"/>
            <input className="formSubmit" type="submit" value="Upload picture" />
        </form>
    );
}

const handleAccountPictureSearch = async (e, onPicturesGot) => {
    e.preventDefault();

    const name = e.target.querySelector("#pictureName").value.trim();
    // Tags should split on ',', ignore all spaces and remove # (despite display), also removes tags that don't exist following this
    const tags = e.target.querySelector("#pictureTags").value.split(',').map(tag => tag.trim().replace('#', '')).filter(tag => tag.length > 0);
    const minLikes = e.target.querySelector("#pictureMinLikes").value;
    const date = e.target.querySelector("#pictureDate").value;
    const publicity = e.target.querySelector("#picturePublicity").value;
    const dateFilter = e.target.querySelector("#pictureDateFilter").value;
    const order = e.target.querySelector("#pictureOrder").value;

    // Adding parameters to query, only if they apply
    // Used https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/append to learn how to append after making the URLSearchParams object
    const params = new URLSearchParams();
    if(name.length > 0) {
        params.append("name", name);
    }
    if(tags.length > 0) {
        params.append("tags", tags);
    }
    if(minLikes > 0) {
        params.append("minLikes", minLikes);
    }
    if(date && dateFilter.length > 0) {
        params.append("date", date);
        params.append("dateFilter", date);
    }
    params.append("order", order);
    params.append("publicity", publicity);

    onPicturesGot(params.toString());
}

// Form used for searching pictures, similar to mainPage but less fields
const AccountPictureSearch = (props) => {
    // Used https://www.w3schools.com/tags/tag_select.asp to figure out select
    return(
        <form id="pictureSearch"
            onSubmit={(e) => handleAccountPictureSearch(e, props.triggerReload)}
            name="pictureSearch"
            className="pictureSearch"
        >
            <label htmlFor="pictureName">Name: </label>
            <input id="pictureName" type="text" name="name" placeholder="Picture name"/>
            <label htmlFor="pictureTags">Tags: </label>
            <input id="pictureTags" type="text" name="tags" placeholder="Tags, separated by commas"/>
            <label htmlFor="pictureMinLikes">Minimum Likes: </label>
            <input id="pictureMinLikes" type="number" min="0" name="minLikes"/>
            <label htmlFor="pictureDate">Date: </label>
            <input id="pictureDate" type="date" name="date"/>
            <label htmlFor="picturePublicity">Publicity: </label>
            <select id="picturePublicity" name="publicity">
                <option value="">Show All</option>
                <option value="public">Show Only Public</option>
                <option value="private">Show Only Private</option>
            </select>
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

// Show all details of an image, must stay seperate from mainPage due to functionality differences
const AccountPictureDetails = (props) => {

}

// Container for page when showing images & password change section
const AccountListApp = () => {
    // Give default search params for when page loads, also trigger reload when search params change (only upon submit)
    const [searchParams, setSearchParams] = useState('order=dateDescending');
    const [reload, setReload] = useState(0);

    const triggerReload = (params) => {
        setSearchParams(params);
        setReload(reload + 1);
    };

    return (
        <>
            <MakeImageWindow/>
            <ChangePasswordWindow/>
            <AccountPictureSearch triggerReload={triggerReload}/>
            <shared.PictureList url={"/getPictures"} searchParams={searchParams} reload={reload} Details={AccountPictureDetails}/>
        </>
    );
}

const init = () => {
    root = createRoot(document.getElementById('application'));
    shared.renderPage(root, <AccountListApp/>);
}

window.onload = init;