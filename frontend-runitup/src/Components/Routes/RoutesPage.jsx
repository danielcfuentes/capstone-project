import "../../styles/RoutesPage.css"
import React, { useState, useEffect, useRef } from "react";
import { Layout, Form, Input, Button, message } from "antd";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getHeaders } from "../../utils/apiConfig";
import {
  initializeMap,
  geocodeLocation,
  generateCircularRoute,
  getRouteFromMapbox,
  addRouteToMap,
  addStartMarker,
  fitMapToRouteWithStart,
  removeCurrentMarker,
  clearRoute,
} from "../../utils/mapUtils";

const { Content } = Layout;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const RoutesPage = () => {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const map = initializeMap(mapContainer.current);
    map.on("load", () => setMap(map));
    return () => map.remove();
  }, []);

  const handleSubmit = async (values) => {
    const { startLocation, distance } = values;

    try {
      // Clear previous route and marker
      if (map) {
        clearRoute(map);
        removeCurrentMarker();
      }

      const [startLng, startLat] = await geocodeLocation(startLocation);
      const startCoordinates = [startLng, startLat];
      const coordinates = generateCircularRoute(startLat, startLng, distance);
      const routeGeometry = await getRouteFromMapbox(coordinates);

      addRouteToMap(map, routeGeometry);
      addStartMarker(map, startCoordinates, startLocation);
      fitMapToRouteWithStart(map, routeGeometry.coordinates, startCoordinates);

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
            <Input type="number" placeholder="Distance (miles)" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Generate Route
            </Button>
          </Form.Item>
        </Form>
        <div ref={mapContainer} className="map-container" />
      </Content>
    </Layout>
  );
};

export default RoutesPage;
