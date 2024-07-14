import React, { useState, useEffect, useRef } from "react";
import { Layout, Form, Input, Button, message, Alert, Spin } from "antd";
import { PlayCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
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
  addMileMarkers,
  clearMileMarkers,
} from "../../utils/mapUtils";
import RouteInfo from "./RouteInfo";
import { getHeaders } from "../../utils/apiConfig";
import "../../styles/RoutesPage.css";

const { Content } = Layout;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const RoutesPage = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState(null); // State for the map instance
  const mapContainer = useRef(null); // Ref for the map container
  const [form] = Form.useForm(); // Ant Design form instance
  const [routeData, setRouteData] = useState(null); // State for route data
  const [error, setError] = useState(null); // State for error messages
  const [warning, setWarning] = useState(null); // State for warning messages
  const [userProfile, setUserProfile] = useState(null); // State for user profile
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false); // State for route generation status
  const [isLoadingBasicInfo, setIsLoadingBasicInfo] = useState(false); // State for loading basic info
  const [isLoadingTerrainInfo, setIsLoadingTerrainInfo] = useState(false); // State for loading terrain info
  const [basicRouteData, setBasicRouteData] = useState(null); // State for basic route data
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isStartingRun, setIsStartingRun] = useState(false);

  // Effect to initialize the map and fetch user profile on component mount
  useEffect(() => {
    const map = initializeMap(mapContainer.current); // Initialize the map
    map.on("load", () => setMap(map)); // Set map instance in state on load
    fetchUserProfile(); // Fetch user profile
    return () => map.remove(); // Clean up map instance on unmount
  }, []);

  const handleSelectRoute = () => {
    if (!selectedRoute) {
      message.error("No route generated to select.");
      return;
    }

    Modal.confirm({
      title: "Select this route?",
      content: "Do you want to save this route as an activity?",
      onOk: saveRouteAsActivity,
      onCancel: () => {},
    });
  };

  const saveRouteAsActivity = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/save-route-activity`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            ...selectedRoute,
            distance: parseFloat(selectedRoute.distance),
            duration: selectedRoute.duration,
            elevationData: {
              gain: parseFloat(selectedRoute.elevationData.gain),
              loss: parseFloat(selectedRoute.elevationData.loss),
            },
            terrain: Object.fromEntries(
              Object.entries(selectedRoute.terrain).map(([key, value]) => [
                key,
                parseFloat(value),
              ])
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save route as activity");
      }

      message.success("Route saved as activity successfully!");
      // Optionally, you can update the UI or redirect the user
    } catch (error) {
      message.error(`Error saving route as activity: ${error.message}`);
    }
  };

  // Function to fetch user profile from API
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
        setUserProfile(profile); // Set user profile in state
      }
    } catch (error) {
      message.error("Error fetching user profile:", error); // Display error message
    }
  };

  // Function to handle form submission
  const handleSubmit = async (values) => {
    const { startLocation, distance } = values;
    setError(null);
    setWarning(null);
    setRouteData(null);
    setBasicRouteData(null);
    setIsGeneratingRoute(true);

    try {
      if (map) {
        clearRoute(map); // Clear existing route from map
        removeCurrentMarker(); // Remove existing marker from map
        clearMileMarkers(); //  clear existing mile markers
      }

      const [startLng, startLat] = await geocodeLocation(startLocation); // Geocode start location
      const startCoordinates = [startLng, startLat];

      const { route, actualDistance } = await generateRouteWithinDistance(
        startLat,
        startLng,
        parseFloat(distance)
      );

      if (!route.geometry || !route.geometry.coordinates) {
        throw new Error("Invalid route data received. Please try again.");
      }

      addRouteToMap(map, route.geometry); // Add generated route to map
      addStartMarker(map, startCoordinates, startLocation); // Add start marker to map
      fitMapToRouteWithStart(map, route.geometry.coordinates, startCoordinates); // Fit map view to route
      addMileMarkers(map, route); //  create mile markers

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

      // Display a warning if the generated route distance significantly differs from the requested distance
      if (Math.abs(actualDistance - distance) > 0.5) {
        setWarning(
          `Note: The generated route is ${actualDistance.toFixed(
            2
          )} miles, which differs from your requested ${distance} miles. This is due to the constraints of available roads and paths.`
        );
      }

      setSelectedRoute({
        ...basicInfo,
        duration,
        terrain: terrainInfo,
        routeCoordinates: route.geometry.coordinates,
        startLocation: values.startLocation,
      });

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

  const handleStartRun = async () => {
    if (!selectedRoute) {
      message.error("No route generated to start a run.");
      return;
    }

    setIsStartingRun(true);

    try {
      const runData = {
        ...selectedRoute,
        distance: parseFloat(selectedRoute.distance),
        elevationData: {
          gain: parseFloat(selectedRoute.elevationData.gain),
          loss: parseFloat(selectedRoute.elevationData.loss),
        },
        terrain: Object.fromEntries(
          Object.entries(selectedRoute.terrain).map(([key, value]) => [
            key,
            parseFloat(value),
          ])
        ),
      };

      console.log("Sending run data:", runData);

      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/start-run`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(runData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to start run");
      }

      console.log("Received response:", data);
      message.success("Run started successfully!");
      navigate(`/active-run/${data.id}`);
    } catch (error) {
      console.error("Error starting run:", error);
      message.error(`Error starting run: ${error.message}`);
    } finally {
      setIsStartingRun(false);
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
        {selectedRoute && (
          <Button
            onClick={handleStartRun}
            type="primary"
            icon={isStartingRun ? <LoadingOutlined /> : <PlayCircleOutlined />}
            loading={isStartingRun}
          >
            Start Run
          </Button>
        )}
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
