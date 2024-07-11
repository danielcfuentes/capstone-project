import React, { useState, useEffect, useRef } from "react";
import { Layout, Form, Input, Button, message } from "antd";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getHeaders } from "../../utils/apiConfig";
import "../../styles/RoutesPage.css"

const { Content } = Layout;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const RoutesPage = () => {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const initializeMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-74.5, 40], // Default center (New York)
      zoom: 9,
    });

    initializeMap.on("load", () => {
      setMap(initializeMap);
    });

    return () => initializeMap.remove();
  }, []);

  const handleSubmit = async (values) => {
    const { startLocation, distance } = values;

    try {
      // Geocode the starting location
      const geocodeResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          startLocation
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.features.length === 0) {
        message.error("Location not found. Please try a different address.");
        return;
      }

      const [startLng, startLat] = geocodeData.features[0].center;

      // Generate a circular route
      const coordinates = generateCircularRoute(startLat, startLng, distance);

      // Get the route from Mapbox Directions API
      const routeResponse = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates.join(
          ";"
        )}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const routeData = await routeResponse.json();

      if (routeData.routes.length === 0) {
        message.error(
          "Unable to generate a route. Please try different parameters."
        );
        return;
      }

      // Display the route on the map
      if (map.getSource("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: routeData.routes[0].geometry,
        },
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#888",
          "line-width": 8,
        },
      });

      // Fit the map to the route
      const bounds = routeData.routes[0].geometry.coordinates.reduce(
        (bounds, coord) => {
          return bounds.extend(coord);
        },
        new mapboxgl.LngLatBounds(
          routeData.routes[0].geometry.coordinates[0],
          routeData.routes[0].geometry.coordinates[0]
        )
      );

      map.fitBounds(bounds, { padding: 50 });

      message.success("Route generated successfully!");
    } catch (error) {
      console.error("Error generating route:", error);
      message.error(
        "An error occurred while generating the route. Please try again."
      );
    }
  };

  const generateCircularRoute = (startLat, startLng, distanceMiles) => {
    const earthRadiusKm = 6371;
    const distanceKm = distanceMiles * 1.60934;
    const radiusKm = distanceKm / (2 * Math.PI);

    const coordinates = [];
    for (let i = 0; i <= 360; i += 45) {
      const angle = i * (Math.PI / 180);
      const lat =
        startLat +
        (radiusKm / earthRadiusKm) * (180 / Math.PI) * Math.sin(angle);
      const lng =
        startLng +
        ((radiusKm / earthRadiusKm) * (180 / Math.PI) * Math.cos(angle)) /
          Math.cos((startLat * Math.PI) / 180);
      coordinates.push(`${lng},${lat}`);
    }

    // Add the starting point at the end to close the loop
    coordinates.push(`${startLng},${startLat}`);

    return coordinates;
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
