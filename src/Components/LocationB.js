import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import getDisasters from './getDisasters';
import './LocationB.css';

export const LocationB = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const cityDatas = location.state?.city;
    const localCity = cityDatas[1];
    const lat=localCity.latitude;
    const lon=localCity.longitude;
    const [currentDisasters, setCurrentDisasters] = useState(null); // state to hold currentDisasters
    const [previousDisasters, setPreviousDisasters] = useState(null); // state to hold previousDisasters
    const [type,setType] = useState('Earthquakes');
    const [time,setTime] = useState('Current');
    const [expanded, setExpanded] = useState(null);
    const alertColors = {
        Green: "#4CAF50",
        Yellow: "#FFEB3B",
        Orange: "#FF9800",
        Red: "#F44336",
        Blue: "#2196F3", // optional, in case you have others
    };
    const handleNavigate = (cityData, location) => {
        navigate(location, {state: { city: cityData}});
    }
    // Used to get the information on city B nearby
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
    return (
        <div>
            <h1>Second Largest Nearby City</h1>
            <h2>
                <button onClick={() => handleNavigate(cityDatas,'/')}>Home</button>
                |
                <button onClick={() => handleNavigate(cityDatas,'/LocationA')}>{cityDatas[0].city}</button>
            </h2>
            { localCity ? (
            <div>
                <h3>{localCity.city}</h3>
                <div className="locationA" >
               <header className="typeParent">
                    {["Earthquakes", "Tropical Cyclones", "Floods", "Volcanic eruptions/unrest", "Droughts", "Forest Fires"].map(
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
                                {time} {type} near {localCity.city}:
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
                        return <p>There are no {time} {type} near {localCity.city}. ur safe, ur good, go outside.</p>;
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
            ) : (
                <p>No nearby cities found</p>
            )}
        </div>

    )

}