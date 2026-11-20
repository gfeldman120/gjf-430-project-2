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
            <input type="submit" value="Upload Picture" />
        </form>
    );
}

const AccountApp = () => {
    return (
        <>
            <MakeImageWindow/>
            <ChangePasswordWindow/>
        </>
    );
}

const init = () => {
    root = createRoot(document.getElementById('application'));
    shared.renderPage(root, <AccountApp/>);
}

window.onload = init;