import "../../styles/RoutesPage.css";
import React, { useState, useEffect, useRef } from "react";
import { Layout, Form, Input, Button, message, Alert, Spin } from "antd";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  initializeMap,
  geocodeLocation,
  generateRouteWithinDistance,
  addRouteToMap,
  addStartMarker,
  fitMapToRouteWithStart,
  removeCurrentMarker,
  clearRoute,
  getBasicRouteInfo,
  getDetailedTerrainInfo,
  calculatePersonalizedRunningTime,
} from "../../utils/mapUtils";
import RouteInfo from "./RouteInfo";
import { getHeaders } from "../../utils/apiConfig";

const { Content } = Layout;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const RoutesPage = () => {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  const [form] = Form.useForm();
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
  const [isLoadingBasicInfo, setIsLoadingBasicInfo] = useState(false);
  const [isLoadingTerrainInfo, setIsLoadingTerrainInfo] = useState(false);
  const [basicRouteData, setBasicRouteData] = useState(null);

  useEffect(() => {
    const map = initializeMap(mapContainer.current);
    map.on("load", () => setMap(map));
    fetchUserProfile();
    return () => map.remove();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/profile`,
        {
          headers: getHeaders(),
        }
      );
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      message.error("Error fetching user profile:", error);
    }
  };

  const handleSubmit = async (values) => {
    const { startLocation, distance } = values;
    setError(null);
    setWarning(null);
    setRouteData(null);
    setBasicRouteData(null);
    setIsGeneratingRoute(true);

    try {
      if (map) {
        clearRoute(map);
        removeCurrentMarker();
      }

      const [startLng, startLat] = await geocodeLocation(startLocation);
      const startCoordinates = [startLng, startLat];

      const { route, actualDistance } = await generateRouteWithinDistance(
        startLat,
        startLng,
        parseFloat(distance)
      );

      if (!route.geometry || !route.geometry.coordinates) {
        throw new Error("Invalid route data received. Please try again.");
      }

      addRouteToMap(map, route.geometry);
      addStartMarker(map, startCoordinates, startLocation);
      fitMapToRouteWithStart(map, route.geometry.coordinates, startCoordinates);

      setIsGeneratingRoute(false);
      setIsLoadingBasicInfo(true);

      // Get basic route info
      const basicInfo = await getBasicRouteInfo(route);
      const duration = calculatePersonalizedRunningTime(
        actualDistance,
        basicInfo.elevationData.gain,
        userProfile || {
          age: 30,
          fitnessLevel: "intermediate",
          runningExperience: "recreational",
          weight: 150,
          height: 5.8,
          healthConditions: [],
        }
      );

      setBasicRouteData({
        ...basicInfo,
        duration,
      });

      setIsLoadingBasicInfo(false);
      setIsLoadingTerrainInfo(true);

      // Get detailed terrain info
      const terrainInfo = await getDetailedTerrainInfo(
        route.geometry.coordinates
      );

      setRouteData({
        ...basicInfo,
        duration,
        terrain: terrainInfo,
      });

      setIsLoadingTerrainInfo(false);

      if (Math.abs(actualDistance - distance) > 0.5) {
        setWarning(
          `Note: The generated route is ${actualDistance.toFixed(
            2
          )} miles, which differs from your requested ${distance} miles. This is due to the constraints of available roads and paths.`
        );
      }

      message.success("Route generated successfully!");
    } catch (error) {
      setError(
        error.message ||
          "An error occurred while generating the route. Please try again."
      );
      setIsGeneratingRoute(false);
      setIsLoadingBasicInfo(false);
      setIsLoadingTerrainInfo(false);
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
        {warning && (
          <Alert
            message="Warning"
            description={warning}
            type="warning"
            showIcon
            closable
            onClose={() => setWarning(null)}
          />
        )}
        <div ref={mapContainer} className="map-container" />
        {isGeneratingRoute && <Spin tip="Generating route..." />}
        {(basicRouteData || routeData) && (
          <RouteInfo
            routeData={routeData || basicRouteData}
            isLoadingTerrain={isLoadingTerrainInfo}
          />
        )}
      </Content>
    </Layout>
  );
};

export default RoutesPage;
