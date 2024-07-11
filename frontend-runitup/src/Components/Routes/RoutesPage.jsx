import React, { useState, useEffect, useRef } from "react";
import { Layout, message } from "antd";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import RouteForm from "./RouteForm";
import {
  initializeMap,
  geocodeLocation,
  generateCircularRoute,
  getRouteFromMapbox,
  addRouteToMap,
  fitMapToRoute,
} from "../../utils/mapUtils";
import "../../styles/RoutesPage.css";

const { Content } = Layout;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const RoutesPage = () => {
  const [map, setMap] = useState(null); // State to store the map instance
  const mapContainer = useRef(null); // Ref to store the map container DOM element

  // Initialize the map when the component mounts
  useEffect(() => {
    const map = initializeMap(mapContainer.current);
    map.on("load", () => setMap(map)); // Set the map state once it's fully loaded
    return () => map.remove(); // Clean up the map instance when the component unmounts
  }, []);

  // Handle form submission to generate a route
  const handleSubmit = async (values) => {
    const { startLocation, distance } = values;

    try {
      // Geocode the start location to get coordinates
      const [startLng, startLat] = await geocodeLocation(startLocation);

      // Generate a circular route based on start coordinates and distance
      const coordinates = generateCircularRoute(startLat, startLng, distance);

      // Fetch the route geometry from Mapbox API
      const routeGeometry = await getRouteFromMapbox(coordinates);

      // Add the route to the map
      addRouteToMap(map, routeGeometry);

      // Adjust the map view to fit the route
      fitMapToRoute(map, routeGeometry.coordinates);

      // Display success message
      message.success("Route generated successfully!");

    } catch (error) {
      console.error("Error generating route:", error); // Log any errors
      // Display error message
      message.error(
        error.message ||
          "An error occurred while generating the route. Please try again."
      );
    }
  };

  return (
    <Layout className="routes-page">
      <Content className="routes-content">
        <RouteForm onSubmit={handleSubmit} />{" "}
        <div ref={mapContainer} className="map-container" />{" "}
      </Content>
    </Layout>
  );
};

export default RoutesPage;
