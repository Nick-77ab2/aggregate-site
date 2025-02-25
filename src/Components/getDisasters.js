import axios from "axios";
export default async function getDisasters(lat, lon) {
    var baseURL = "http://localhost:5000/query?";
    var finalCurrent = baseURL + "lat=" + lat.toString() + "&long=" + lon.toString() + "&current=1";
    var finalPast = baseURL + "lat=" + lat.toString() + "&long=" + lon.toString() + "&current=0";
    const currentRes = await axios.get(finalCurrent);
    console.log(currentRes);
    if (currentRes.status === 200)
        var currentDisasters=currentRes.data;
    const pastRes = await axios.get(finalPast);
    console.log(pastRes);
    if (pastRes.status === 200)
        var previousDisasters =pastRes.data;
    console.log(currentDisasters);
    console.log(previousDisasters);
    return{
        currentDisasters,
        previousDisasters
    }
    }