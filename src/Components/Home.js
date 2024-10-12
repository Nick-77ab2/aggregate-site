import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {

    const navigate = useNavigate();

    return (
        <div>
            <h1>Home</h1>
            <h2>
                <button onClick={() => navigate('/LocationA')}>Location A</button>
                |
                <button onClick={() => navigate('/LocationB')}>Location B</button>
            </h2>
            <div classname="search">
                <input type="text" placeholder="Search for locations..." />
                <button onClick={() => navigate('/SearchLocation')}>Search</button>
            </div>
        </div>
        

    )

}