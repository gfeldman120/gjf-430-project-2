const helper = require('./helper.js');
const shared = require('./shared.jsx');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
// Root is defined here to allow functions to access it
let root;

const handleSearch = async (e, onPicturesGot) => {
    e.preventDefault();

    const name = e.target.querySelector("#pictureName").value.trim();
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

    onPicturesGot(params.toString());
}

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const getPictures = async () => {
            const response = await fetch(`/getPictures?${props.searchParams}`);
            const data = await response.json();
            setPictures(data.pictures);
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
            <img src={picture.image} alt={picture.name} className="pictureImg" onClick={() => shared.renderPage(root, () => <PictureDetails id={picture._id}/>)}/>
        </div>
    ));

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

    if(picture) {
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
    // Give default search params for when page loads, also trigger reload when search params change (only upon submit)
    const [searchParams, setSearchParams] = useState('order=dateDescending');
    const [reload, setReload] = useState(0);

    const triggerReload = (params) => {
        setSearchParams(params);
        setReload(reload + 1);
    };

    return (
        <>
            <PictureSearch triggerReload={triggerReload} />
            <PictureList searchParams={searchParams} reload={reload} />
        </>
    );
}

const init = () => {
    root = createRoot(document.getElementById('content'));
    shared.renderPage(root, ListApp);
}

window.onload = init;