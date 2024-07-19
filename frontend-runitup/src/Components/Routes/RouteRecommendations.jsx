import React from "react";
import { Row, Col } from "antd";
import RecommendationCard from "./RecommendationCard";

const RouteRecommendations = ({ recommendations }) => {
  return (
    <Row gutter={[16, 16]}>
      {recommendations.map((recommendation, index) => (
        <Col xs={24} sm={12} md={8} key={index}>
          <RecommendationCard recommendation={recommendation} />
        </Col>
      ))}
    </Row>
  );
};

export default RouteRecommendations;
