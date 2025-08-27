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
		const [cities, setCities] = useState([]);
		const [topCities, setTopCities] = useState([]);
		//const [cityALatLong, setCityALatLong] = useState([]);
		//const [cityBLatLong, setCityBLatLong] = useState([]);
		const [topCitiesObj, setTopCitiesObj] = useState([]);
		const [searchLocation, setSearchLocation] = useState('');
		const [searchCity, setSearchCity] = useState(null);
		const [expanded, setExpanded] = useState(null);
		const alertColors = {
        Green: "#4CAF50",
        Yellow: "#FFEB3B",
        Orange: "#FF9800",
        Red: "#F44336",
        Blue: "#2196F3", // optional, in case you have others
    };
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
							const { parsedCurrent, parsedPrevious } = await getDisasters(lat, lon);
							setCurrentDisasters(parsedCurrent);
							setPreviousDisasters(parsedPrevious);
							console.log("Fetched Current Disasters:", parsedCurrent);
							console.log("Fetched Previous Disasters:", parsedPrevious);
						} catch (error) {
							console.error("Error fetching disasters:", error);
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
									{/* Disaster Type Selection */}
											  <header className="typeParent">
												{["Earthquakes", "Tropical Cyclones", "Floods", "Volcanoes", "Droughts", "Forest Fires"].map(
												  (label) => (
													<span
													  key={label}
													  className="type"
													  onClick={() => setType(label)}
													  style={{ cursor: "pointer", fontWeight: type === label ? "bold" : "normal" }}
													>
													  {label}
													</span>
												  )
												)}
											  </header>
									
											  {/* Disaster Data Table */}
											  <div className="data">
												{(() => {
												  const typeKeyMap = {
													Earthquakes: "earthquakes",
													TropicalCyclones: "tropicalcyclones",
													Floods: "floods",
													Volcanoes: "volcanoes",
													Droughts: "droughts",
													ForestFires: "wildfires",
												  };
									
												  const disastersByTime = time === "Past" ? previousDisasters : currentDisasters;
												  const selectedKey = typeKeyMap[type];
												  const selectedDisasters = disastersByTime?.[selectedKey] || [];
									
												  if (selectedDisasters.length > 0) {
													return (
													  <>
														<p>
														  {time} {type} near {city}:
														</p>
														<div style={{ display: "flex", justifyContent: "center" }}>
														<table className="disaster-table">
														  <thead>
															<tr>
															  <th></th>
															  <th>Title</th>
															  <th>Alert Level</th>
															  <th>Country</th>
															  <th>From</th>
															  <th>To</th>
															</tr>
														  </thead>
														  <tbody>
															{selectedDisasters.map((d, idx) => {
															  const isOpen = expanded === idx;
															  return (
																<React.Fragment key={idx}>
																  <tr onClick={() => setExpanded(isOpen ? null : idx)} style={{ cursor: "pointer" }}>
																	<td style={{ textAlign: "center" }}>
																	  <span className={`chevron ${isOpen ? "open" : ""}`}>▶</span>
																	</td>
																	<td>{d.title || d.name || "Unnamed event"}</td>
																	<td style={{ color: alertColors[d.alertLevel] || "black", fontWeight: "bold" }}>{d.alertLevel}</td>
																	<td>{d.countries?.join(", ")}</td>
																	<td>{new Date(d.fromdate).toLocaleDateString()}</td>
																	<td>{new Date(d.todate).toLocaleDateString()}</td>
																  </tr>
																  {isOpen && (
																	<tr className="expanded-row">
																	  <td colSpan="6">
																		<div className="disaster-details">
																		  <p><strong>ID:</strong> {d.disasterID}</p>
																		  <p><strong>Event ID:</strong> {d.eventID}</p>
																		  <p><strong>Summary:</strong> {d.summary}</p>
																		  <p><strong>Coordinates:</strong> {d.latitude}, {d.longitude}</p>
																		  <p><strong>Reported:</strong> {new Date(d.timestamp).toLocaleString()}</p>
																		</div>
																	  </td>
																	</tr>
																  )}
																</React.Fragment>
															  );
															})}
														  </tbody>
														</table>
														</div>
													  </>
													);
												  } else {
													return <p>There are no {time} {type} near {city}. ur safe, ur good, go outside.</p>;
												  }
												})()}
											  </div>
									
											  {/* Time Selection */}
											  <footer className="timeParent">
												{["Past", "Current"].map((t) => (
												  <span
													key={t}
													className="time"
													onClick={() => setTime(t)}
													style={{ cursor: "pointer", fontWeight: time === t ? "bold" : "normal" }}
												  >
													{t}
												  </span>
												))}
											  </footer>
											</div>
										  </div>
										</div>
									  );
									} 
		else{
			return <h1>Loading....</h1>
		}

}