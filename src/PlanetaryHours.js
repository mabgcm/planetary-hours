import React, { useState, useEffect } from "react";
import axios from "axios";

function PlanetaryHours() {
    const [location, setLocation] = useState({ lat: null, lng: null, city: "Bilinmiyor" });
    const [planetaryHours, setPlanetaryHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPlanet, setCurrentPlanet] = useState("...");
    const [currentTime, setCurrentTime] = useState(new Date());

    const planets = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation((prev) => ({
                        ...prev,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }));
                    fetchCityName(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    alert("Konum alınamadı. Lütfen elle girin.");
                }
            );
        }
    }, []);

    useEffect(() => {
        if (location.lat && location.lng) {
            fetchSunTimes();
        }
    }, [location]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
            updateCurrentPlanet();
        }, 1000); // Saati sürekli güncelle
        return () => clearInterval(interval);
    }, [planetaryHours]);

    const fetchCityName = async (lat, lng) => {
        try {
            const response = await axios.get(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            );
            setLocation((prev) => ({
                ...prev,
                city: response.data.city || "Bilinmiyor",
            }));
        } catch (error) {
            console.error("Şehir bilgisi alınamadı:", error);
        }
    };

    const fetchSunTimes = async () => {
        try {
            const response = await axios.get(
                `https://api.sunrise-sunset.org/json?lat=${location.lat}&lng=${location.lng}&formatted=0`
            );
            calculatePlanetaryHours(response.data.results);
        } catch (error) {
            alert("API'den veri alınamadı. Lütfen tekrar deneyin.");
            setLoading(false);
        }
    };

    const calculatePlanetaryHours = (sunTimes) => {
        const sunrise = new Date(sunTimes.sunrise);
        const sunset = new Date(sunTimes.sunset);

        const localSunrise = new Date(sunrise.toLocaleString());
        const localSunset = new Date(sunset.toLocaleString());

        const dayDuration = (localSunset - localSunrise) / 12;
        const nightDuration = (24 * 60 * 60 * 1000 - (localSunset - localSunrise)) / 12;

        const startingPlanets = [0, 3, 6, 2, 5, 1, 4]; // Haftanın başlangıç gezegenleri
        const startingIndex = startingPlanets[new Date().getDay()];
        const rotatedPlanets = [...planets.slice(startingIndex), ...planets.slice(0, startingIndex)];

        const hours = [];
        for (let i = 0; i < 24; i++) {
            const planetIndex = i % rotatedPlanets.length;
            if (i < 12) {
                hours.push({
                    start: new Date(localSunrise.getTime() + i * dayDuration),
                    planet: rotatedPlanets[planetIndex],
                });
            } else {
                hours.push({
                    start: new Date(localSunset.getTime() + (i - 12) * nightDuration),
                    planet: rotatedPlanets[planetIndex],
                });
            }
        }
        setPlanetaryHours(hours);
        setLoading(false);
    };

    const updateCurrentPlanet = () => {
        if (planetaryHours.length === 0) return;
        const now = currentTime.getTime();
        const current = planetaryHours.find((hour, index) => {
            const next = planetaryHours[index + 1];
            return now >= hour.start.getTime() && (!next || now < next.start.getTime());
        });
        setCurrentPlanet(current ? current.planet : "...");
    };

    return (
        <div className="row">
            <div className="col-4">
                <div className="accordion" id="planetaryHoursAccordion">
                    <div className="accordion-item">
                        <h2 className="accordion-header">
                            <button
                                className="accordion-button"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseHours"
                                aria-expanded="true"
                                aria-controls="collapseHours"
                            >
                                Gezegen Saatleri Listesi
                            </button>
                        </h2>
                        <div id="collapseHours" className="accordion-collapse collapse show">
                            <div className="accordion-body">
                                {loading ? (
                                    <p>Yükleniyor...</p>
                                ) : (
                                    <ul className="list-group">
                                        {planetaryHours.map((hour, index) => (
                                            <li key={index} className="list-group-item">
                                                {hour.start.toLocaleTimeString()} - {hour.planet}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-8">
                <div className="card text-center">
                    <div className="card-header bg-dark text-white">Şu Anki Gezegen Saati</div>
                    <div className="card-body">
                        <h5 className="card-title display-4">{currentPlanet}</h5>
                        <p className="card-text">
                            Şu an {currentTime.toLocaleTimeString()} itibarıyla aktif gezegen saati.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlanetaryHours;
