const shared = require('./shared.jsx');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
// Root is defined here to allow functions to access it
let root;

// Handle changing of the password
const handleChangePassword = (e) => {
    e.preventDefault();
    const pass = e.target.querySelector('#pass').value;
    const newPass = e.target.querySelector('#newPass').value;
    const newPass2 = e.target.querySelector('#newPass2').value;

    if(!pass || !newPass || !newPass2) {
        shared.handleError('All fields are required!');
        return false;
    }

    if(newPass !== newPass2) {
        shared.handleError('Passwords do not match!');
        return false;
    }

    shared.sendPost(e.target.action, {pass, newPass, newPass2});
    return false;
}

// Window for changing the password
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

// Handle creating a picture
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

// Window for making a picture
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

// Handle searching of pictures from this account
const handleAccountPictureSearch = (e, onParamsGot) => {
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

    onParamsGot(params.toString());
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

// Handle editing of a picture
const handleAccountPictureEdit = async (e, id, description, tagsInput, isPublic, setPicture, setSaving) => {
    e.preventDefault(); 
    setSaving(true);
    try {
        const tags = tagsInput.split(',').map(tag => tag.trim().replace('#', '')).filter(tag => tag.length > 0);
        const response = await fetch('/editPictureData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: id,
                description,
                tags,
                public: isPublic
            })
        });
        const data = await response.json();
        if(!response.ok) {
            throw new Error("Something went wrong!");
        }
        setPicture(prev => ({
            ...prev,
            description: data.description,
            tags: data.tags,
            public: data.public
        }));
        shared.handleError('Picture updated successfully!');
    } catch (err) {
        shared.handleError('Error editing picture!');
    // No matter what happens, ensure saving is done and can be tried again
    } finally {
        setSaving(false);
    }
}

// Delete picture
const handleDelete = async (id, deleting, setDeleting) => {
    if (deleting) return;
    setDeleting(true);
    try {
        const response = await fetch('/deletePicture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: id
            })
        });
        if(!response.ok) {
            throw new Error("Something went wrong!");
        }
        shared.renderPage(root, <AccountListApp/>);
    } catch (err) {
        shared.handleError('Error deleting picture!');
    // Ensure deleting is done for sake of preventing repeating
    } finally {
        setDeleting(false);
    }
}

// Show all details of an image, must stay seperate from mainPage due to functionality differences
const AccountPictureDetails = (props) => {
    const [picture, setPicture] = useState(null);
    // States for editable fields
    const [description, setDescription] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    // States to prevent spam or repeating
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const getPicture = async () => {
            try {
                const response = await fetch(`/getPictureData?_id=${props.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if(!response.ok) {
                    throw new Error("Something went wrong!");
                }
                setPicture(data);
                // Fill form fields with data
                setDescription(data.description || '');
                setTagsInput((data.tags || []).join(', '));
                setIsPublic(data.public);
            } catch (err) {
                shared.handleError(err.message || 'Error loading picture!');
            }
        };
        getPicture();
    }, [props.id]);

    if(picture) {
        return (
            <>
                <div className="pictureDetailsHeader">
                    <button type="button" onClick={() => shared.renderPage(root, <AccountListApp/>)}>Return</button>
                </div>
                <div className="pictureDetails">
                    <h1>{picture.name}</h1>
                    <img src={picture.image} alt={picture.name} />
                    <h2>{picture.username}</h2>
                    <h2>{new Date(picture.createdDate).toLocaleString()}</h2>
                    <p>Likes: {picture.likes.length}</p>
                    <form onSubmit={e => {handleAccountPictureEdit(e, props.id, description, tagsInput, isPublic, setPicture, setSaving);}}>
                        <label htmlFor="pictureDescription">Description:</label>
                        <input id="pictureDescription" type="text" value={description} onChange={e => setDescription(e.target.value)}/>
                        <label htmlFor="pictureTags">Tags (comma-separated):</label>
                        <input id="pictureTags" type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)}/>
                        <label htmlFor="picturePublic">Public:</label>
                        <input id="picturePublic" type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)}/>
                        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Submit Edits'}</button>
                    </form>
                    <button type="button" onClick={() => handleDelete(props.id, deleting, setDeleting)} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete Picture'}</button>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="pictureDetailsHeader">
                <button type="button" onClick={() => shared.renderPage(root, <AccountListApp/>)}>Return</button>
            </div>
            <div className="pictureDetails">
                <h2>Loading picture...</h2>
            </div>
        </>
    );
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
            <shared.PictureList url={"/getMyPictures"} root={root} searchParams={searchParams} reload={reload} Details={AccountPictureDetails}/>
        </>
    );
}

const init = () => {
    root = createRoot(document.getElementById('application'));
    shared.renderPage(root, <AccountListApp/>);
}

window.onload = init;