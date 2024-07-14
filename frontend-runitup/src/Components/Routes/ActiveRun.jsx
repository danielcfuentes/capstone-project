import React, { useState, useEffect } from "react";
import { Card, Button, Statistic, Row, Col, message } from "antd";
import {
  ClockCircleOutlined,
  AimOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";

const ActiveRun = ({ activeRunId, onRunComplete }) => {
  const [runData, setRunData] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    fetchRunData();
    const timer = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRunId]);

  const fetchRunData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/active-run/${activeRunId}`,
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
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/complete-run/${activeRunId}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to complete run");
      }
      message.success("Run completed successfully!");
      onRunComplete();
    } catch (error) {
      message.error(`Error completing run: ${error.message}`);
    }
  };

  if (!runData) {
    return <div>Loading...</div>;
  }

  return (
    <Card title="Active Run">
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="Distance"
            value={runData.distance}
            suffix="miles"
            prefix={<AimOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Elapsed Time"
            value={formatTime(elapsedTime)}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Elevation Gain"
            value={runData.elevationGain}
            suffix="ft"
            prefix={<RiseOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Elevation Loss"
            value={runData.elevationLoss}
            suffix="ft"
            prefix={<FallOutlined />}
          />
        </Col>
      </Row>
      <Button
        type="primary"
        onClick={handleCompleteRun}
        style={{ marginTop: 16 }}
      >
        Complete Run
      </Button>
    </Card>
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

export default ActiveRun;
