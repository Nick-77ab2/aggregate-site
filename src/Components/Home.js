import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home = () => {

    const navigate = useNavigate();
    const [type,setType] = useState('Earthquakes');
    const [time,setTime] = useState('Current');
    const [location,setLocation] = useState('');
    return (
        <div>
            <h1>Home</h1>
            <h2>
                <button onClick={() => navigate('/LocationA')}>Location A</button>
                |
                <button onClick={() => navigate('/LocationB')}>Location B</button>
            </h2>
            <div className="search">
                <input type="text" placeholder="Search for locations..." value= {location} onChange={(e) => setLocation(e.target.value)}/>
                <button onClick={() => navigate('/SearchLocation', {state: {location: location}})}>Search</button>
            </div>
            <div>
                <h3>Your Location:</h3>
                <div className="yourlocation" >
                <header className='typeParent'><span className='type' onClick={() =>{setType("Earthquakes");} }>Earthquakes</span> | <span className='type' onClick={() =>{setType("Tropical Cyclones");}}>Tropical-Cyclones</span> | <span className='type' onClick={() =>{setType("Floods");}}>Floods</span> | <span className='type' onClick={() =>{setType("Volcanoes");}}>Volcanoes</span> | <span className='type' onClick={() =>{setType("Droughts");}}>Droughts</span> | <span className='type' onClick={() =>{setType("Forest Fires");}}>Forest-Fires</span></header>
                <div className='data'>
                {time} {type}
                </div>
                <footer className='timeParent'><span className='time' onClick={() =>{setTime("Past");}}>Past</span> | <span className='time' onClick={() =>{setTime("Current");}}>Current</span> | <span className='time' onClick={() =>{setTime("Future");}}>Future</span></footer>
                </div>
            </div>
        </div>
        

    )

}