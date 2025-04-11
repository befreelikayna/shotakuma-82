
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const ContactMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox map
    const mapboxToken = 'pk.eyJ1IjoibG92YWJsZS1haS1wdWJsaWMiLCJhIjoiY2x2eGZlaTdlMDBvMTJxbWt5MHlycm1uNyJ9.xz550V2cYCjM8BDSD-TpCA';
    mapboxgl.accessToken = mapboxToken;
    
    // Coordinates for Casablanca, Morocco as a tuple [longitude, latitude]
    const casablancaCoords: [number, number] = [-7.6092, 33.5731];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: casablancaCoords,
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker for festival location
    const marker = new mapboxgl.Marker({ color: '#FF5A5F' })
      .setLngLat(casablancaCoords)
      .addTo(map.current);

    // Add popup to the marker
    new mapboxgl.Popup({ offset: 25, closeButton: false })
      .setLngLat(casablancaCoords)
      .setHTML('<strong>SHOTAKU Festival</strong><p>Le festival d\'anime & manga</p>')
      .addTo(map.current);

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
};

export default ContactMap;
