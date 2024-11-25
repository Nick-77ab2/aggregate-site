import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GetCities from './getCities';
import './Home.css';
import useGeoLocation from './useGeolocation';

export const Home = () => {
    const { city, lat, lon} = useGeoLocation();
    const [cities, setCities] = useState([]);
    const navigate = useNavigate();
    const [type,setType] = useState('Earthquakes');
    const [time,setTime] = useState('Current');
    const [location,setLocation] = useState('');
    useEffect(() => {
        const fetchCities = async () => {
            if (lat != null && lon != null) {
                try {
                    const { otherCities } = await GetCities(lat, lon);
                    setCities(otherCities);
                    console.log("Fetched Cities:", otherCities);
                } catch (error) {
                    console.error("Error fetching cities:", error);
                }
            }
        };
        fetchCities();
    }, [lat, lon]); // Run effect only when lat or lon changes
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
                <h3>{city}</h3>
                <div className="yourlocation" >
                <header className='typeParent'><span className='type' onClick={() =>{setType("Earthquakes");} }>Earthquakes</span> | <span className='type' onClick={() =>{setType("Tropical Cyclones");}}>Tropical-Cyclones</span> | <span className='type' onClick={() =>{setType("Floods");}}>Floods</span> | <span className='type' onClick={() =>{setType("Volcanoes");}}>Volcanoes</span> | <span className='type' onClick={() =>{setType("Droughts");}}>Droughts</span> | <span className='type' onClick={() =>{setType("Forest Fires");}}>Forest-Fires</span></header>
                <div className='data'>
                {time} {type} { /* placeholders */}
                </div>
                <footer className='timeParent'><span className='time' onClick={() =>{setTime("Past");}}>Past</span> | <span className='time' onClick={() =>{setTime("Current");}}>Current</span> | <span className='time' onClick={() =>{setTime("Future");}}>Future</span></footer>
                </div>
            </div>
        </div>
        

    )

}