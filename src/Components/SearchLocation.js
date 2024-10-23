import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const SearchLocation = () => {

    const navigate = useNavigate();
    const {state} = useLocation();
    const {location} = state;

    return (
        <div>
            <h1> Information on {location}:</h1>
            <h2>
                <button onClick={() => navigate('/')}>Home</button>
            </h2>
        </div>

    )

}