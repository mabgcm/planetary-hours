import React, { useState, useEffect } from "react";
import { useGeolocated } from "react-geolocated";
import "./App.css";

const planetDayList = {
  sunday: ["sun", "venus", "mercury", "moon", "saturn", "jupiter", "mars"],
  monday: ["moon", "saturn", "jupiter", "mars", "sun", "venus", "mercury"],
  tuesday: ["mars", "sun", "venus", "mercury", "moon", "saturn", "jupiter"],
  wednesday: ["mercury", "moon", "saturn", "jupiter", "mars", "sun", "venus"],
  thursday: ["jupiter", "mars", "sun", "venus", "mercury", "moon", "saturn"],
  friday: ["venus", "mercury", "moon", "saturn", "jupiter", "mars", "sun"],
  saturday: ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"],
};

const App = () => {
  const [planetaryHours, setPlanetaryHours] = useState([]);
  const [currentPlanetaryHour, setCurrentPlanetaryHour] = useState(null);

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  });

  useEffect(() => {
    if (coords) {
      calculatePlanetaryHours(coords.latitude, coords.longitude);
    }
  }, [coords]);

  //new
  const calculatePlanetaryHours = (lat, lng) => {
    console.log("Fetching sunrise and sunset data...");

    // Step 1: Fetch today's sunrise and sunset times
    fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=today&formatted=0`)
      .then((response) => response.json())
      .then((todayData) => {
        const todaySunrise = new Date(todayData.results.sunrise).getTime();
        const todaySunset = new Date(todayData.results.sunset).getTime();

        // Step 2: Fetch yesterday's sunset time
        fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=yesterday&formatted=0`)
          .then((response) => response.json())
          .then((yesterdayData) => {
            const yesterdaySunset = new Date(yesterdayData.results.sunset).getTime();

            // Step 3: Fetch tomorrow's sunrise time
            fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=tomorrow&formatted=0`)
              .then((response) => response.json())
              .then((tomorrowData) => {
                const tomorrowSunrise = new Date(tomorrowData.results.sunrise).getTime();

                const now = new Date().getTime(); // Current time in milliseconds

                // Step 4: Hardcode planetary sequences
                const planetaryDaySequence = {
                  sunday: ["sun", "venus", "mercury", "moon", "saturn", "jupiter", "mars"],
                  monday: ["moon", "saturn", "jupiter", "mars", "sun", "venus", "mercury"],
                  tuesday: ["mars", "sun", "venus", "mercury", "moon", "saturn", "jupiter"],
                  wednesday: ["mercury", "moon", "saturn", "jupiter", "mars", "sun", "venus"],
                  thursday: ["jupiter", "mars", "sun", "venus", "mercury", "moon", "saturn"],
                  friday: ["venus", "mercury", "moon", "saturn", "jupiter", "mars", "sun"],
                  saturday: ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"],
                };

                // Hardcode planetary day mapping (sequence + time range)
                const planetaryDayMapping = {
                  sunday: { sequence: planetaryDaySequence.sunday, start: todaySunrise, end: tomorrowSunrise },
                  monday: { sequence: planetaryDaySequence.monday, start: todaySunrise, end: tomorrowSunrise },
                  tuesday: { sequence: planetaryDaySequence.tuesday, start: todaySunrise, end: tomorrowSunrise },
                  wednesday: { sequence: planetaryDaySequence.wednesday, start: todaySunrise, end: tomorrowSunrise },
                  thursday: { sequence: planetaryDaySequence.thursday, start: todaySunrise, end: tomorrowSunrise },
                  friday: { sequence: planetaryDaySequence.friday, start: todaySunrise, end: tomorrowSunrise },
                  saturday: { sequence: planetaryDaySequence.saturday, start: todaySunrise, end: tomorrowSunrise },
                };

                // Step 5: Determine the current planetary day
                let planetaryDay = null;

                // If the current time is before today's sunrise, use yesterday's day
                if (now < todaySunrise) {
                  planetaryDay = "saturday"; // Hardcoded for simplicity
                } else {
                  planetaryDay = "sunday"; // Example; this would be dynamic in a real app
                }

                if (!planetaryDay) {
                  console.error("Could not determine planetary day.");
                  return;
                }

                const planetarySequence = planetaryDayMapping[planetaryDay].sequence;
                const planetaryHours = [];

                console.log(`Planetary Day: ${planetaryDay}`);
                console.log(`Planetary Sequence: ${planetarySequence}`);

                // Step 6: Calculate nighttime planetary hours (yesterday sunset to today sunrise)
                const nightDuration = todaySunrise - yesterdaySunset;
                const nightHourLength = nightDuration / 12;
                for (let i = 0; i < 12; i++) {
                  const hourStart = new Date(yesterdaySunset + i * nightHourLength);
                  const hourEnd = new Date(yesterdaySunset + (i + 1) * nightHourLength);

                  planetaryHours.push({
                    hour: planetarySequence[(12 + i) % 7],
                    start: hourStart,
                    end: hourEnd,
                  });
                }

                // Step 7: Calculate daytime planetary hours (today sunrise to today sunset)
                const dayDuration = todaySunset - todaySunrise;
                const dayHourLength = dayDuration / 12;
                for (let i = 0; i < 12; i++) {
                  const hourStart = new Date(todaySunrise + i * dayHourLength);
                  const hourEnd = new Date(todaySunrise + (i + 1) * dayHourLength);

                  planetaryHours.push({
                    hour: planetarySequence[i % 7],
                    start: hourStart,
                    end: hourEnd,
                  });
                }

                // Step 8: Calculate nighttime planetary hours (today sunset to tomorrow sunrise)
                const nextNightDuration = tomorrowSunrise - todaySunset;
                const nextNightHourLength = nextNightDuration / 12;
                for (let i = 0; i < 12; i++) {
                  const hourStart = new Date(todaySunset + i * nextNightHourLength);
                  const hourEnd = new Date(todaySunset + (i + 1) * nextNightHourLength);

                  planetaryHours.push({
                    hour: planetarySequence[(12 + i) % 7],
                    start: hourStart,
                    end: hourEnd,
                  });
                }

                // Store the calculated planetary hours
                setPlanetaryHours(planetaryHours);
                console.log("Planetary Hours Calculated:", planetaryHours);

                // Find and update the current planetary hour
                findCurrentPlanetaryHour(planetaryHours);
              });
          });
      });
  };







  const findCurrentPlanetaryHour = (hoursList) => {
    const now = new Date(); // Current time
    console.log("Finding current planetary hour...");
    console.log("Current Time (Local):", now.toString());
    console.log("Current Time (UTC):", now.toISOString());

    const current = hoursList.find((hour) => {
      const start = hour.start.getTime();
      const end = hour.end.getTime();
      console.log(`Checking Hour: ${hour.hour} | Start: ${hour.start} | End: ${hour.end} | Now: ${now >= start && now < end}`);
      return now >= start && now < end;
    });

    if (current) {
      console.log("Current Planetary Hour Found:", current);
      setCurrentPlanetaryHour(current);
    } else {
      console.log("No current planetary hour found.");
      setCurrentPlanetaryHour(null);
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
    <div className=" body container-fluid bg-dark text-light vh-100 d-flex flex-column">
      <div className="position-absolute top-0 end-0 m-3">
        <h4>{new Date().toLocaleTimeString()}</h4>
        <p>
          Lat: {coords.latitude.toFixed(2)}, Lng: {coords.longitude.toFixed(2)}
        </p>
      </div>

      <div className="d-flex flex-grow-1 justify-content-center align-items-center">
        <div className="text-center">
          {currentPlanetaryHour ? (
            <>
              <h1 className="display-3 text-warning">{currentPlanetaryHour.hour.toUpperCase()}</h1>
              <p className="small text-info">
                ({currentPlanetaryHour.start.toLocaleTimeString()} -{" "}
                {currentPlanetaryHour.end.toLocaleTimeString()})
              </p>
            </>
          ) : (
            <h3 className="text-muted">No current planetary hour found.</h3>
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
                  {hour.start.toLocaleTimeString()} - {hour.end.toLocaleTimeString()}
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
