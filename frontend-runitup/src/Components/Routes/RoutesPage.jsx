import "../../styles/RoutesPage.css"
import React, { useState, useEffect, useRef } from "react";
import { Layout, Form, Input, Button, message, Alert } from "antd";
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
  estimateElevationChange,
  calculatePersonalizedRunningTime,
  extractDirections,
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
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleSubmit = async (values) => {
    const { startLocation, distance } = values;
    setError(null);
    setWarning(null);
    setRouteData(null);

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

      const { gain, loss } = estimateElevationChange(route);
      let duration;

        const profileForCalculation = {
          age: userProfile.age || 30,
          gender: userProfile.gender || "male",
          weight: userProfile.weight || 150,
          height: userProfile.height || 5.8, // Assuming height is stored in feet
          fitnessLevel: userProfile.fitnessLevel || "intermediate",
          runningExperience: userProfile.runningExperience || "recreational",
          healthConditions: userProfile.healthConditions || [],
        };

        duration = calculatePersonalizedRunningTime(
          actualDistance,
          gain,
          profileForCalculation
        );


      if (
        !userProfile ||
        Object.keys(userProfile).some((key) => !userProfile[key])
      ) {
        setWarning(
          "Your profile is incomplete. Using default values for some fields in time estimation. Please update your profile for more accurate estimates."
        );
      }

      const directions = extractDirections(route.legs);

      setRouteData({
        distance: actualDistance,
        duration,
        elevationGain: gain,
        elevationLoss: loss,
        terrain: "Mixed",
        directions,
      });

      if (Math.abs(actualDistance - distance) > 0.5) {
        setWarning(
          (prevWarning) =>
            `${
              prevWarning ? prevWarning + " " : ""
            }Note: The generated route is ${actualDistance} miles, which differs from your requested ${distance} miles. This is due to the constraints of available roads and paths.`
        );
      }

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
        {routeData && <RouteInfo routeData={routeData} />}
      </Content>
    </Layout>
  );
};

export default RoutesPage;
