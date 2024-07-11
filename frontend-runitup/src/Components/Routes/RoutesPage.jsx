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
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = initializeMap(mapContainer.current);
    map.on("load", () => setMap(map));
    return () => map.remove();
  }, []);

  const handleSubmit = async (values) => {
    const { startLocation, distance } = values;

    try {
      const [startLng, startLat] = await geocodeLocation(startLocation);
      const coordinates = generateCircularRoute(startLat, startLng, distance);
      const routeGeometry = await getRouteFromMapbox(coordinates);

      addRouteToMap(map, routeGeometry);
      fitMapToRoute(map, routeGeometry.coordinates);

      message.success("Route generated successfully!");
    } catch (error) {
      console.error("Error generating route:", error);
      message.error(
        error.message ||
          "An error occurred while generating the route. Please try again."
      );
    }
  };

  return (
    <Layout className="routes-page">
      <Content className="routes-content">
        <RouteForm onSubmit={handleSubmit} />
        <div ref={mapContainer} className="map-container" />
      </Content>
    </Layout>
  );
};

export default RoutesPage;
