// src/PollingMap.jsx
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 12.971598,
  lng: 77.594566
};

// Example polling stations (replace with real data)
const pollingStations = [
  { id: 1, name: 'Polling Station 1', position: { lat: 17.385, lng: 78.486 } },
  { id: 2, name: 'Polling Station 2', position: { lat: 17.39, lng: 78.48 } }
];

function PollingMap() {
  return (
    <LoadScript googleMapsApiKey="AIzaSyB9TjFEgBaPGxYIsmP1529SdVA04lfr86E">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
        {pollingStations.map(station => (
          <Marker key={station.id} position={station.position} title={station.name} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}

export default PollingMap;
