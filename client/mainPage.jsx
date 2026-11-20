const helper = require('./helper.js');
const shared = require('./shared.jsx');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
// Root is defined here to allow functions to access it
let root;

// const handleDomo = (e, onDomoAdded) => {
//     e.preventDefault();
//     helper.hideError();

//     const name = e.target.querySelector('#domoName').value;
//     const age = e.target.querySelector('#domoAge').value;
//     const level = e.target.querySelector('#domoLevel').value;

//     if(!name || !age || !level) {
//         helper.handleError('All fields are required!');
//         return false;
//     }

//     helper.sendPost(e.target.action, {name, age, level}, onDomoAdded);
//     return false;
// }

// const handleDelete = (e, onDomoDeleted, _id) => {
//     e.preventDefault();
//     helper.hideError();
//     helper.sendPost('/deleteDomo', { _id }, onDomoDeleted);
//     return false;
// }

const handleSearch = async (e, onPicturesGot) => {
    e.preventDefault();

    const name = e.target.querySelector("#pictureName").value.trim();
    // Tags should split on ',', ignore all spaces and remove # (despite display), also removes tags that don't exist following this
    const tags = e.target.querySelector("#pictureTags").split(',').map(tag => tag.trim().replace('#', '')).filter(tag => tag.length > 0);
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
    order.append("order", order);

    helper.sendGet(e.target.action, params, onPicturesGot);
    return false;
}

const PictureSearch = (props) => {
    // Used https://www.w3schools.com/tags/tag_select.asp to figure out select
    return(
        <form id="pictureSearch"
            onSubmit={() => handleSearch(e, props.triggerReload)}
            name="pictureSearch"
            action="/getPictures"
            method="GET"
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
            <label htmlFor="pictureDateFilter">Filter: </label>
            <select id="pictureDateFilter" name="dateFilter">
                <option value="">Ignore Date</option>
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

const PictureList = (props) => {
    const [pictures, setPictures] = useState([]);

    useEffect(() => {
        const getPictures = async () => {
            const response = await fetch ('/getPictures?order=dateDescending', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setPictures(data);
        }
        getPictures();
    }, []);
    
    if(pictures.length === 0) {
        return (
            <div className="pictureList">
                <h3 className="noPictures">No pictures found.</h3>
            </div>
        );
    }

    const pictureList = pictures.map(picture =>{
        return (
            <div key={picture._id} className="picture">
                <img src={picture.image} alt="Picture" className="pictureImg" onClick={() => shared.renderPage(root, PictureDetails(picture._id))}/>
            </div>
        );
    });

    return (
        <>
            {pictureList}
        </>
    );
}

const PictureDetails = (props) => {
    const [picture, setPicture] = useState({});

    useEffect(() => {
        const getPicture = async () => {
            const response = await fetch (`/getPictureData?_id=${props.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setPicture(data);
        }
        getPicture();
    }, []);

    if(picture.image) {
        return (
            <>
                <h1>{picture.name}</h1>
                <img src={picture.image} alt="Picture"/>
                <h2>{picture.owner}</h2>
                <h2>{picture.createdDate}</h2>
                <p>{picture.likes.length}</p>
                <ul>
                    {picture.tags.map(tag => <li key={tag}>{tag}</li>)}
                </ul>
                <p>{picture.description}</p>
            </>
        );
    }
    return (
        <>
            <h2>Loading picture...</h2>
        </>
    );
}

const ListApp = () => {
    const [reloadPictures, setReloadPictures] = useState(false);

    return (
        <>
            <PictureSearch triggerReload={() => setReloadPictures(!reloadPictures)}/>
            <PictureList triggerReload={() => setReloadPictures(!reloadPictures)}/>
        </>
    );
}

const init = () => {
    root = createRoot(document.getElementById('content'));
    shared.renderPage(root, ListApp);
}

window.onload = init;