import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Home } from './Components/Home';
import { LocationA } from './Components/LocationA';
import { LocationB } from './Components/LocationB';
import { SearchLocation } from './Components/SearchLocation';
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path = "/" element = {<Home />}/>
        <Route path = "/LocationA" element = {<LocationA />}/>
        <Route path = "/LocationB" element = {<LocationB />}/>
        <Route path = "/SearchLocation" element = {<SearchLocation />}/>
      </Routes>
       
    </div>
  );
}

export default App;
