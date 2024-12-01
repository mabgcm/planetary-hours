import React, { useState, useEffect } from "react";
import { useGeolocated } from "react-geolocated";
import "./App.css";

const planetOrder = ["sun", "venus", "mercury", "moon", "saturn", "jupiter", "mars"];
const planetDayList = {
  sunday: planetOrder,
  monday: ["moon", "saturn", "jupiter", "mars", "sun", "venus", "mercury"],
  tuesday: ["mars", "sun", "venus", "mercury", "moon", "saturn", "jupiter"],
  wednesday: ["mercury", "moon", "saturn", "jupiter", "mars", "sun", "venus"],
  thursday: ["jupiter", "mars", "sun", "venus", "mercury", "moon", "saturn"],
  friday: ["venus", "mercury", "moon", "saturn", "jupiter", "mars", "sun"],
  saturday: ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"],
};

const App = () => {
  const [planetaryHours, setPlanetaryHours] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentPlanetaryHour, setCurrentPlanetaryHour] = useState(null);
  const [currentHourStart, setCurrentHourStart] = useState(null);
  const [currentHourEnd, setCurrentHourEnd] = useState(null);

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  });

  useEffect(() => {
    // Update current time every second
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      setCurrentTime(now);
      updateCurrentPlanetaryHour();
    }, 1000);

    return () => clearInterval(interval);
  }, [planetaryHours]);

  useEffect(() => {
    if (coords) {
      calculatePlanetaryHours();
    }
  }, [coords]);

  const calculatePlanetaryHours = () => {
    // Mock sunrise/sunset for simplicity
    const sunrise = new Date();
    sunrise.setHours(6, 0, 0); // 6:00 AM
    const sunset = new Date();
    sunset.setHours(18, 0, 0); // 6:00 PM

    const differenceDay = (sunset - sunrise) / 12;
    const hours = [];

    // Calculate daytime planetary hours
    for (let i = 0; i < 12; i++) {
      const start = new Date(sunrise.getTime() + differenceDay * i);
      const end = new Date(sunrise.getTime() + differenceDay * (i + 1));
      hours.push({
        hour: planetDayList.saturday[i % 7],
        start: start.toLocaleTimeString(),
        end: end.toLocaleTimeString(),
      });
    }

    setPlanetaryHours(hours);
  };

  const updateCurrentPlanetaryHour = () => {
    const now = new Date();
    const current = planetaryHours.find(
      (hour) =>
        now >= new Date(`1970-01-01T${hour.start}`) && now < new Date(`1970-01-01T${hour.end}`)
    );

    if (current) {
      setCurrentPlanetaryHour(current.hour);
      setCurrentHourStart(current.start);
      setCurrentHourEnd(current.end);
    }
  };

  if (!isGeolocationAvailable) {
    return <div className="App-header">Your browser does not support Geolocation</div>;
  }

  if (!isGeolocationEnabled) {
    return <div className="App-header">Geolocation is not enabled</div>;
  }

  if (!coords) {
    return <div className="App-header">Getting the location data&hellip;</div>;
  }

  return (
    <div className="container-fluid bg-dark text-light vh-100 d-flex flex-column">
      <div className="position-absolute top-0 end-0 m-3">
        <h4>{currentTime}</h4>
        <p>
          Lat: {coords.latitude.toFixed(2)}, Lng: {coords.longitude.toFixed(2)}
        </p>
      </div>
      <div className="d-flex flex-grow-1 justify-content-center align-items-center">
        <div className="text-center">
          {currentPlanetaryHour && (
            <>
              <h1 className="display-3 text-warning">{currentPlanetaryHour.toUpperCase()}</h1>
              <p className="small text-muted">
                ({currentHourStart} - {currentHourEnd})
              </p>
            </>
          )}
        </div>
      </div>
      <div className="mb-5 text-center">
        <button
          className="btn btn-primary"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#planetaryHours"
        >
          Show Planetary Hours
        </button>
        <div className="collapse mt-3" id="planetaryHours">
          <ul className="list-group text-dark">
            {planetaryHours.map((hour, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between">
                <strong>{hour.hour.toUpperCase()}</strong>
                <span>
                  {hour.start} - {hour.end}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
