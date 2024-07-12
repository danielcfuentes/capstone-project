import "../../styles/RoutesPage.css";
import React, { useState, useEffect, useRef } from "react";
import { Layout, Form, Input, Button, message, Alert } from "antd";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  initializeMap,
  geocodeLocation,
  generateCircularRouteCoordinates,
  getRouteFromMapbox,
  addRouteToMap,
  addStartMarker,
  fitMapToRouteWithStart,
  removeCurrentMarker,
  clearRoute,
  calculateRouteDistance,
  estimateElevationChange,
  calculateRunningTime,
  extractDirections,
} from "../../utils/mapUtils";
import RouteInfo from "./RouteInfo";

const { Content } = Layout;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const RoutesPage = () => {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  const [form] = Form.useForm();
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const map = initializeMap(mapContainer.current);
    map.on("load", () => setMap(map));
    return () => map.remove();
  }, []);

  const handleSubmit = async (values) => {
    const { startLocation, distance } = values;
    setError(null);
    setRouteData(null);

    try {
      if (map) {
        clearRoute(map);
        removeCurrentMarker();
      }

      const [startLng, startLat] = await geocodeLocation(startLocation);
      const startCoordinates = [startLng, startLat];
      const routeCoordinates = generateCircularRouteCoordinates(
        startLat,
        startLng,
        parseFloat(distance)
      );
      const routeResponse = await getRouteFromMapbox(routeCoordinates);

      if (!routeResponse.routes || routeResponse.routes.length === 0) {
        throw new Error("No route found. Please try different parameters.");
      }

      const route = routeResponse.routes[0];

      if (!route.geometry || !route.geometry.coordinates) {
        throw new Error("Invalid route data received. Please try again.");
      }

      addRouteToMap(map, route.geometry);
      addStartMarker(map, startCoordinates, startLocation);
      fitMapToRouteWithStart(map, route.geometry.coordinates, startCoordinates);

      const actualDistance = calculateRouteDistance(route);
      const { gain, loss } = estimateElevationChange(route);
      const duration = calculateRunningTime(parseFloat(actualDistance));
      const directions = extractDirections(route.legs);

      setRouteData({
        distance: actualDistance,
        duration,
        elevationGain: gain,
        elevationLoss: loss,
        terrain: "Mixed", // This could be improved with more detailed terrain analysis
        directions,
      });

      message.success("Route generated successfully!");
    } catch (error) {
      console.error("Error generating route:", error);
      setError(
        error.message ||
          "An error occurred while generating the route. Please try again."
      );
    }
  };

  return (
    <Layout className="routes-page">
      <Content className="routes-content">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="inline"
          className="route-form"
        >
          <Form.Item
            name="startLocation"
            rules={[
              { required: true, message: "Please enter a starting location" },
            ]}
          >
            <Input placeholder="Starting Location" />
          </Form.Item>
          <Form.Item
            name="distance"
            rules={[{ required: true, message: "Please enter a distance" }]}
          >
            <Input type="number" placeholder="Distance (miles)" step="0.1" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Generate Route
            </Button>
          </Form.Item>
        </Form>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}
        <div ref={mapContainer} className="map-container" />
        {routeData && <RouteInfo routeData={routeData} />}
      </Content>
    </Layout>
  );
};

export default RoutesPage;
