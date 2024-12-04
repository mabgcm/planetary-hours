import React from "react";
import PlanetaryHours from "./PlanetaryHours";
import "./App.css";

function App() {
  return (
    <div className="container mt-5">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          {/* <h3>Lokasyon: </h3> */}
          <p id="location-info">Koordinatlar ve şehir bilgisi geliyor...</p>
        </div>
        <div>
          {/* <h3>Aktif Zaman:</h3> */}
          <p id="current-time">{new Date().toLocaleTimeString()}</p>
        </div>
      </header>
      <PlanetaryHours />
    </div>
  );
}

export default App;
