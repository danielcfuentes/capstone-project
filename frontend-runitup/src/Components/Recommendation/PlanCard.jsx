import React from "react";
import { Card, Button, Typography } from "antd";

const { Text } = Typography;

const PlanCard = ({ plan, onShowDetails, isRecommended }) => (
  <Card
    title={plan.name}
    extra={<Button onClick={() => onShowDetails(plan)}>Details</Button>}
    className={`plan-card ${isRecommended ? "recommended" : ""}`}
  >
    <Text>Distance: {plan.distance}</Text>
    <Text>Duration: {plan.duration} weeks</Text>
    <Text>Level: {plan.level}</Text>
    {isRecommended && <div className="recommended-badge">Recommended</div>}
  </Card>
);

export default PlanCard;
