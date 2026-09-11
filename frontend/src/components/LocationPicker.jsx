import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultLocation = [28.6139, 77.2090];

const locationIcon = L.divIcon({
  className: "report-location-marker",
  html: `
    <div class="report-marker-pin">
      <div class="report-marker-dot"></div>
    </div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MoveMapToLocation({ location }) {
  const map = useMap();

  if (location) {
    map.setView(
      [location.latitude, location.longitude],
      16,
      {
        animate: true,
      }
    );
  }

  return null;
}

function LocationPicker({ location, onLocationChange }) {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleMapLocation = (newLocation) => {
    setLocationError("");
    onLocationChange(newLocation);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support location services."
      );
      return;
    }

    setLoadingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        onLocationChange(newLocation);
        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);

        if (error.code === 1) {
          setLocationError(
            "Location permission was denied. You can select the location manually on the map."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Your location could not be determined. Please select it manually."
          );
        } else if (error.code === 3) {
          setLocationError(
            "Location request timed out. Please try again."
          );
        } else {
          setLocationError(
            "Unable to get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const markerPosition = location
    ? [location.latitude, location.longitude]
    : null;

  return (
    <div className="location-picker">

      {/* Location controls */}
      <div className="location-picker-toolbar">

        <div>
          <strong>Choose Issue Location</strong>

          <p>
            Click on the map or use your current location.
          </p>
        </div>

        <button
          type="button"
          className="current-location-button"
          onClick={handleUseCurrentLocation}
          disabled={loadingLocation}
        >
          <span>📍</span>

          {loadingLocation
            ? "Finding Location..."
            : "Use My Current Location"}
        </button>

      </div>

      {/* Map */}
      <div className="location-map-wrapper">

        <MapContainer
          center={defaultLocation}
          zoom={12}
          scrollWheelZoom={true}
          className="location-map"
        >

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            onLocationSelect={handleMapLocation}
          />

          {location && (
            <>
              <Marker
                position={markerPosition}
                icon={locationIcon}
              />

              <MoveMapToLocation location={location} />
            </>
          )}

        </MapContainer>

        {!location && (
          <div className="map-selection-hint">
            <span>📍</span>
            Click anywhere on the map to place the issue
          </div>
        )}

      </div>

      {/* Selected location */}
      {location && (
        <div className="selected-location">

          <div className="selected-location-icon">
            ✓
          </div>

          <div>
            <strong>Location selected</strong>

            <span>
              {location.latitude.toFixed(6)},{" "}
              {location.longitude.toFixed(6)}
            </span>
          </div>

        </div>
      )}

      {/* Location error */}
      {locationError && (
        <div className="location-error">

          <span>!</span>

          <div>
            {locationError}
          </div>

        </div>
      )}

    </div>
  );
}

export default LocationPicker;