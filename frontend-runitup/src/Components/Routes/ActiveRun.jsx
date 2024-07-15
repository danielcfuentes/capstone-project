import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Statistic, Row, Col, Typography, message } from "antd";
import {
  AimOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  RiseOutlined,
  FallOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../../styles/ActiveRun.css";

const { Title } = Typography;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const ActiveRun = ({ handleRunCompletion }) => {
  const { runId } = useParams();
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const [runData, setRunData] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [map, setMap] = useState(null);

  useEffect(() => {
    fetchRunData();
    const timer = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [runId]);

  useEffect(() => {
    if (runData && !map && mapContainer.current) {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [runData.startLongitude, runData.startLatitude],
        zoom: 13,
      });

      newMap.on("load", () => {
        newMap.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: JSON.parse(runData.routeCoordinates),
            },
          },
        });

        newMap.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#1890ff",
            "line-width": 8,
          },
        });
      });

      setMap(newMap);
    }
  }, [runData]);

  const fetchRunData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/active-run/${runId}`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch active run data");
      }
      const data = await response.json();
      setRunData(data);
    } catch (error) {
      message.error(`Error fetching run data: ${error.message}`);
    }
  };

  const handleCompleteRun = async () => {
    try {
      const completeResponse = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/complete-run/${runId}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );
      if (!completeResponse.ok) {
        throw new Error("Failed to complete run");
      }
      const completeData = await completeResponse.json();

      // Ensure routeCoordinates is an array of coordinates
      const activityData = {
        ...completeData.userActivity,
        routeCoordinates: JSON.parse(
          completeData.userActivity.routeCoordinates
        ),
      };


      // Save the activity
      const saveResponse = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/save-route-activity`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(activityData),
        }
      );

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();

        throw new Error(errorData.message || "Failed to save activity");
      }

      const saveResult = await saveResponse.json();

      // Call handleRunCompletion passed as prop for challenge updates
      await handleRunCompletion(saveResult);

      message.success("Run completed and saved successfully!");
      // Redirect to the activities page
      navigate("/activities");
    } catch (error) {
      message.error(`Error completing run: ${error.message}`);
    }
  };

  if (!runData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="active-run-container">
      <Title level={2} className="run-title">
        Active Run
      </Title>
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card">
            <Statistic
              title="Distance"
              value={runData.distance}
              precision={2}
              suffix="miles"
              prefix={<AimOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card">
            <Statistic
              title="Elapsed Time"
              value={formatTime(elapsedTime)}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card">
            <Statistic
              title="Target Pace"
              value={formatPace(runData.averagePace)}
              suffix="/mile"
              prefix={<DashboardOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Elevation Gain"
              value={runData.elevationGain}
              suffix="ft"
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Elevation Loss"
              value={runData.elevationLoss}
              suffix="ft"
              prefix={<FallOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Card className="stat-card">
            <Statistic
              title="Est. Calories Burned"
              value={runData.estimatedCaloriesBurned}
              suffix="cal"
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Card className="map-card">
        <div
          ref={mapContainer}
          style={{ width: "100%", height: "300px" }}
        ></div>
      </Card>
      <Button
        type="primary"
        size="large"
        onClick={handleCompleteRun}
        className="complete-run-btn"
      >
        Complete Run
      </Button>
    </div>
  );
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const formatPace = (pace) => {
  if (pace === null || isNaN(pace)) return "Calculating...";
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default ActiveRun;
