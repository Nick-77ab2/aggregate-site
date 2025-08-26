import axios from "axios";
// This function fetches disaster data for a given latitude and longitude
// It retrieves both current and past disasters from a local server
// The API endpoints are expected to return data in JSON format
// The function returns an object containing current and previous disasters
export default async function getDisasters(lat, lon) {
    var baseURL = "http://localhost:5000/query?";
    var finalCurrent = baseURL + "lat=" + lat.toString() + "&long=" + lon.toString() + "&current=1";
    var finalPast = baseURL + "lat=" + lat.toString() + "&long=" + lon.toString() + "&current=0";
    const currentRes = await axios.get(finalCurrent);
    var currentDisasters = null;
    var previousDisasters = null;
    console.log(currentRes);
    if (currentRes.status === 200)
        currentDisasters=currentRes.data;
    const pastRes = await axios.get(finalPast);
    console.log(pastRes);
    if (pastRes.status === 200)
        previousDisasters =pastRes.data;
    console.log("Current disasters are: ",currentDisasters);
    console.log(previousDisasters);
    //parse the disasters here instead. break them into types. so currentDisasters.earthquakes, currentDisasters.floods, etc.
    //same for previousDisasters
    return{
        currentDisasters,
        previousDisasters
    }
    }