import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import getDisasters from './getDisasters';
import './LocationA.css';

export const LocationA = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const cityDatas = location.state?.city;
    const localCity = cityDatas[0];
    const lat=localCity.latitude;
    const lon=localCity.longitude;
    const [currentDisasters, setCurrentDisasters] = useState(null); // state to hold currentDisasters
    const [previousDisasters, setPreviousDisasters] = useState(null); // state to hold previousDisasters
    const [areDisasters, setAreDisasters] = useState(null); // state to hold are
    const [type,setType] = useState('Earthquakes');
    const [time,setTime] = useState('Current');
    const handleNavigate = (cityData, location) => {
        //console.log('Navigating with city:', cityData);
        navigate(location, {state: { city: cityData}});
    }
    // Used to get the information on city A nearby
    useEffect(() => {
            const fetchDisasters = async () => {
              if (lat!=null && lon!=null){
                try {
                  const { disasters } = await getDisasters(lat, lon);
                  console.log("Fetched Disasters:", disasters);
                  setCurrentDisasters(disasters[0]);
                  setPreviousDisasters(disasters[1]);
                  console.log("Fetched Current Disasters:", disasters[0]);
                  console.log("Fetched Previous Disasters:", disasters[1]);
                  setAreDisasters(true);
                } catch (error) {
                  console.error("Error fetching disasters:", error);
                  setAreDisasters(false);
                }
              }
            };
            fetchDisasters();
          }, [lat, lon]);
    return (
        <div>
            <h1>Largest Nearby City</h1>
            <h2>
                <button onClick={() => handleNavigate(cityDatas,'/')}>Home</button>
                |
                <button onClick={() => handleNavigate(cityDatas,'/LocationB')}>{cityDatas[1].city}</button>
            </h2>
            { localCity ? (
            <div>
                <h3>{localCity.city}</h3>
                <div className="locationA" >
                <header className='typeParent'><span className='type' onClick={() =>{setType("Earthquakes");} }>Earthquakes</span> | <span className='type' onClick={() =>{setType("Tropical Cyclones");}}>Tropical-Cyclones</span> | <span className='type' onClick={() =>{setType("Floods");}}>Floods</span> | <span className='type' onClick={() =>{setType("Volcanoes");}}>Volcanoes</span> | <span className='type' onClick={() =>{setType("Droughts");}}>Droughts</span> | <span className='type' onClick={() =>{setType("Forest Fires");}}>Forest-Fires</span></header>
                <div className='data'>
                  {
                    areDisasters===true ? time + " " + type + " near " + localCity.city + ": ": "There are no " + time + " " + type + " near " + localCity.city + ". ur safe, ur good, go outside."
                  }
                  </div>
                <footer className='timeParent'><span className='time' onClick={() =>{setTime("Past");}}>Past</span> | <span className='time' onClick={() =>{setTime("Current");}}>Current</span></footer>
                </div>
            </div>
            ) : (
                <p>No nearby cities found</p>
            )}
        </div>

    )

}