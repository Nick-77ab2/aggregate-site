import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GetCities from './getCities';
import GetCityDetails from './GetCityDetails';
import './Home.css';
import useGeoLocation from './useGeolocation';

export const Home = () => {
    const [cityData, setCityData] = useState(null); // state to hold cityData
    const location = useLocation();  // to get location data (state)
    const { city, lat, lon} = useGeoLocation();
    const [cities, setCities] = useState([]);
    const [topCities, setTopCities] = useState([]);
    const [topCitiesObj, setTopCitiesObj] = useState([]);
    const [searchLocation, setSearchLocation] = useState();
    const [searchCity, setSearchCity] = useState([]);

    const handleNavigate = (cityData, location) => {
        console.log('sending over data: ', cityData)
        navigate(location, {state: { city: cityData}});
    }
    const handleSearch = (cityData, searchLocation, location) => {
      navigate(location, {state: {city: cityData, search: searchLocation}});
    }
    const removeCity = (cityToRemove) => {
        setCities((prevCities) =>
          prevCities.filter((cityObj) => cityObj.city !== cityToRemove)
        );
      };
    const getTopCities = (cities) => {
        // Sort the cities by population in descending order
        const sortedCities = cities.sort((a, b) => b.population - a.population);
      
        // Get the names of the top two cities
        const topCities = sortedCities.slice(0, 2).map((cityObj) => cityObj.city);
        setTopCitiesObj(sortedCities.slice(0, 2));
      
        return topCities;
      };
    const navigate = useNavigate();
    const [type,setType] = useState('Earthquakes');
    const [time,setTime] = useState('Current');
    
    const searchForCity = async (location) =>{
      try {
        console.log("Fetching city details for:", searchLocation);
        const theCity = await GetCityDetails(searchLocation);
        setSearchCity(theCity);
        console.log("Fetched city:", theCity);
        handleSearch(topCitiesObj.length>0? topCitiesObj:cityData, searchLocation, '/SearchLocation');
        } catch (error) {
            console.error("Error fetching city details:", error);
        }
    }

    useEffect(() => {
        // Only call the API if lat, lon are available and cityData is null
        const fetchCities = async () => {
            console.log('cityData:',cityData);
          if (lat != null && lon != null && !cityData) {
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
      }, [lat, lon, cityData]); // Run effect when lat, lon, or cityData changes // Run effect only when lat or lon changes
    
      useEffect(() => {
        if (location.state?.city) {
          setCityData(location.state.city);
        }
      }, [location]);

    // Remove the city from the cities array when the city exists
    useEffect(() => {
        if (city && cities.some((cityObj) => cityObj.city === city)) {
            removeCity(city);
        }
    }, [city, cities]); // Runs whenever `city` or `cities` changes

    // Update the top cities whenever the cities list changes
    useEffect(() => {
        setTopCities(getTopCities(cities));
    }, [cities]); // Runs whenever `cities` changes
    if((cities!=null && cities.length>0 && topCitiesObj!=null && topCitiesObj.length>0) || (cityData!=null && cityData.length>0 && city!=null && city.length>0)){
      return (
          <div>
              <h1>Home</h1>
              <h2>
                  <button onClick={() => handleNavigate(topCitiesObj.length>0 ? topCitiesObj:cityData,'/LocationA')}>{cityData ? cityData[0].city:topCities[0]}</button>
                  |
                  <button onClick={() => handleNavigate(topCitiesObj.length>0? topCitiesObj:cityData,'/LocationB')}>{cityData ? cityData[1].city:topCities[1]}</button>
              </h2>
              <div className="search">
                  <input type="text" placeholder="Search for locations..." value= {searchLocation} onChange={(e) => setSearchLocation(e.target.value)}/>
                  <button onClick={() => searchForCity(searchLocation) }>Search</button>
              </div>
              <div>
                  <h3>{city}</h3>
                  <div className="yourlocation" >
                  <header className='typeParent'><span className='type' onClick={() =>{setType("Earthquakes");} }>Earthquakes</span> | <span className='type' onClick={() =>{setType("Tropical Cyclones");}}>Tropical-Cyclones</span> | <span className='type' onClick={() =>{setType("Floods");}}>Floods</span> | <span className='type' onClick={() =>{setType("Volcanoes");}}>Volcanoes</span> | <span className='type' onClick={() =>{setType("Droughts");}}>Droughts</span> | <span className='type' onClick={() =>{setType("Forest Fires");}}>Forest-Fires</span></header>
                  <div className='data'>
                  {time} {type} near {city} { /* placeholders */}
                  </div>
                  <footer className='timeParent'><span className='time' onClick={() =>{setTime("Past");}}>Past</span> | <span className='time' onClick={() =>{setTime("Current");}}>Current</span> | <span className='time' onClick={() =>{setTime("Future");}}>Future</span></footer>
                  </div>
              </div>
          </div>
          

      )
    }
    else{
      return <h1>Loading....</h1>
    }

}