import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, MarkerClusterer } from '@react-google-maps/api';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

const MapComponent: React.FC = () => {
  const mapStyles = {
    height: "95vh",
    width: "100%"
  };

  const defaultCenter = {
    lat: 40.748817,
    lng: -73.985428
  };

  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newMarker = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      await addDoc(collection(firestore, "markers"), newMarker);
      setMarkers([...markers, newMarker]);
    }
  };

  const handleMarkerRightClick = (index: number) => {
    setMarkers(markers.filter((_, i) => i !== index));
  };

  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent, index: number) => {
    if (event.latLng) {
      const updatedMarkers = [...markers];
      updatedMarkers[index] = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      setMarkers(updatedMarkers);
    }
  };

 

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "markers"));
        setMarkers(querySnapshot.docs.map(doc => doc.data() as { lat: number; lng: number }));
        console.log("Markers fetched: ", querySnapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching markers: ", error);
      }
    };
  
    fetchMarkers();
  }, []);
  

  return (
    <LoadScript googleMapsApiKey='AIzaSyCwPrFHf7ocdSNu2XRorp-pKq15iHD8vzk'>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={13}
        center={defaultCenter}
        onClick={handleMapClick}
      >
        <MarkerClusterer>
          {(clusterer) => (
            <>
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={marker}
                  onRightClick={() => handleMarkerRightClick(index)}
                  onDragEnd={(event) => handleMarkerDragEnd(event, index)}
                  draggable={true}
                  clusterer={clusterer}
                />
              ))}
            </>
          )}
        </MarkerClusterer>
      </GoogleMap>
      <button onClick={() => setMarkers([])}>Remove All Markers</button>
    </LoadScript>
  );
}

export default MapComponent;
