import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, MarkerClusterer } from '@react-google-maps/api';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
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

  const [markers, setMarkers] = useState<{ id: string; lat: number; lng: number }[]>([]);

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newMarker = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      const docRef = await addDoc(collection(firestore, "markers"), newMarker);
      setMarkers([...markers, { id: docRef.id, ...newMarker }]);
    }
  };

  const handleMarkerRightClick = async (markerId: string) => {
    try {
      await deleteDoc(doc(firestore, "markers", markerId));
      setMarkers(markers.filter((marker) => marker.id !== markerId));
    } catch (error) {
      console.error("Error removing marker: ", error);
    }
  };

  const handleMarkerDragEnd = async (event: google.maps.MapMouseEvent, index: number) => {
    if (event.latLng) {
      const updatedMarkers = [...markers];
      const updatedMarker = { ...updatedMarkers[index], lat: event.latLng.lat(), lng: event.latLng.lng() };
      updatedMarkers[index] = updatedMarker;
      setMarkers(updatedMarkers);

      try {
        const markerDoc = doc(firestore, "markers", updatedMarker.id);
        await updateDoc(markerDoc, {
          lat: updatedMarker.lat,
          lng: updatedMarker.lng
        });
      } catch (error) {
        console.error("Error updating marker: ", error);
      }
    }
  };

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "markers"));
        setMarkers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as { id: string; lat: number; lng: number }));
        console.log("Markers fetched: ", querySnapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching markers: ", error);
      }
    };
  
    fetchMarkers();
  }, []);

  const removeAllMarkers = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "markers"));
      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      setMarkers([]);
    } catch (error) {
      console.error("Error removing all markers: ", error);
    }
  };

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
                  key={marker.id}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  onRightClick={() => handleMarkerRightClick(marker.id)}
                  onDragEnd={(event) => handleMarkerDragEnd(event, index)}
                  draggable={true}
                  clusterer={clusterer}
                />
              ))}
            </>
          )}
        </MarkerClusterer>
      </GoogleMap>
      <button onClick={removeAllMarkers}>Remove All Markers</button>
    </LoadScript>
  );
}

export default MapComponent;
