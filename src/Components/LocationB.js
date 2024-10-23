import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LocationB.css';

export const LocationB = () => {

    const navigate = useNavigate();
    const [type,setType] = useState('');
    const [time,setTime] = useState('');

    return (
        <div>
            <h1>LocationB</h1>
            <h2>
                <button onClick={() => navigate('/')}>Home</button>
                |
                <button onClick={() => navigate('/LocationA')}>Location A</button>
            </h2>
            <div>
                <h3>Location B:</h3>
                <div className="locationB" >
                <header className='typeParent'><span className='type' onClick={() =>{setType("Earthquakes");} }>Earthquakes</span> | <span className='type' onClick={() =>{setType("Tropical Cyclones");}}>Tropical-Cyclones</span> | <span className='type' onClick={() =>{setType("Floods");}}>Floods</span> | <span className='type' onClick={() =>{setType("Volcanoes");}}>Volcanoes</span> | <span className='type' onClick={() =>{setType("Droughts");}}>Droughts</span> | <span className='type' onClick={() =>{setType("Forest Fires");}}>Forest-Fires</span></header>
                <div className='data'>
                {time} {type} at LocationB
                </div>
                <footer className='timeParent'><span className='time' onClick={() =>{setTime("Past");}}>Past</span> | <span className='time' onClick={() =>{setTime("Current");}}>Current</span> | <span className='time' onClick={() =>{setTime("Future");}}>Future</span></footer>
                </div>
            </div>
        </div>

    )

}