import { useEffect, useState } from "react";
import { Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";


// =====================================================
// User Location Icon
// =====================================================

const userLocationIcon = L.divIcon({
  className: "nivra-user-location-container",

  html: `
    <div class="nivra-user-location">
      <div class="nivra-user-location-dot"></div>
    </div>
  `,

  iconSize: [24, 24],
  iconAnchor: [12, 12],
});


// =====================================================
// User Location
// =====================================================

function UserLocation({ onLocationChange }) {
  const map = useMap();

  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");


  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      return;
    }


    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const userLocation = {
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
        };

        setLocation(userLocation);

        if (onLocationChange) {
          onLocationChange(userLocation);
        }


        // Center map on user the first time
        map.flyTo(
          [latitude, longitude],
          14,
          {
            duration: 1.2,
          }
        );
      },

      (locationError) => {
        console.error(
          "Unable to get user location:",
          locationError
        );

        setError(
          "Location permission was denied or unavailable."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, [map, onLocationChange]);


  if (!location) {
    return null;
  }


  return (
    <>
      <Marker
        position={[
          location.latitude,
          location.longitude,
        ]}
        icon={userLocationIcon}
      >

        <Circle
          center={[
            location.latitude,
            location.longitude,
          ]}
          radius={Math.min(location.accuracy, 100)}
          pathOptions={{
            className: "nivra-location-accuracy",
          }}
        />

      </Marker>


      {/* Accuracy circle */}

      <Circle
        center={[
          location.latitude,
          location.longitude,
        ]}
        radius={Math.min(location.accuracy, 100)}
        pathOptions={{
          className: "nivra-location-circle",
        }}
      />
    </>
  );
}

export default UserLocation;