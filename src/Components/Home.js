import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GetCities from './getCities';
import { GetCityDetails } from './GetCityDetails';
import getDisasters from './getDisasters';
import './Home.css';
import useGeoLocation from './useGeolocation';

export const Home = () => {
    const [cityData, setCityData] = useState(null); // state to hold cityData
    const location = useLocation();  // to get location data (state)
    const { city, lat, lon} = useGeoLocation();
    const [currentDisasters, setCurrentDisasters] = useState(null); // state to hold currentDisasters
    const [previousDisasters, setPreviousDisasters] = useState(null); // state to hold previousDisasters
    const [areDisasters, setAreDisasters] = useState(null); // state to hold are
    const [cities, setCities] = useState([]);
    const [topCities, setTopCities] = useState([]);
    const [cityALatLong, setCityALatLong] = useState([]);
    const [cityBLatLong, setCityBLatLong] = useState([]);
    const [topCitiesObj, setTopCitiesObj] = useState([]);
    const [searchLocation, setSearchLocation] = useState('');
    const [searchCity, setSearchCity] = useState(null);

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
        console.log("The TopCitiesObj is: " + topCitiesObj);
        return topCities;
      };
    const navigate = useNavigate();
    const [type,setType] = useState('Earthquakes');
    const [time,setTime] = useState('Current');
    
    //Used to get the information on the city that was searched
    const searchForCity = async (location) =>{
      try {
        console.log("Fetching city details for:", location);
        const {lat,lng} = await GetCityDetails(location);
        console.log("Got the location: ", lat, lng);
        const newCity = {location: location, lat: lat, lng: lng};
        setSearchCity(newCity);
        } catch (error) {
            console.error("Error fetching city details:", error);
        }
    }
    useEffect(() => {
        if (searchCity) {
            console.log("Search city updated:", searchCity);
            handleSearch(
                topCitiesObj.length > 0 ? topCitiesObj : cityData,
                searchCity,
                '/SearchLocation'
          );
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [searchCity]);

    //Gets all of the cities nearby given lat and long
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cities]); // Runs whenever `cities` changes
    if((cities!=null && cities.length>0 && topCitiesObj!=null && topCitiesObj.length>0) || (cityData!=null && cityData.length>0 && city!=null && city.length>0)){
      return (
          <div>
              <h1>Home</h1>
              <h2>
                  <button onClick={() => handleNavigate(topCitiesObj.length>0 ? topCitiesObj:cityData, '/LocationA')}>{cityData ? cityData[0].city:topCities[0]}</button>
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
                  {
                    areDisasters===true ? time + " " + type + " near " + city + ": ": "There are no " + time + " " + type + " near " + city + ". ur safe, ur good, go outside."
                  }
                  </div>
                  <footer className='timeParent'><span className='time' onClick={() =>{setTime("Past");}}>Past</span> | <span className='time' onClick={() =>{setTime("Current");}}>Current</span></footer>
                  </div>
              </div>
          </div>
          

      )
    }
    else{
      return <h1>Loading....</h1>
    }

}