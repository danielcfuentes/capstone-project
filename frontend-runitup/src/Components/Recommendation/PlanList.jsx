// src/components/PlanList.jsx
import React from "react";
import { List, Typography } from "antd";
import PlanCard from "./PlanCard";

const { Title } = Typography;

const PlanList = ({ plans, onShowDetails, recommendedPlanId }) => (
  <div className="all-plans-section">
    <Title level={3}>All Available Plans</Title>
    <List
      grid={{ gutter: 16, column: 3 }}
      dataSource={plans}
      renderItem={(plan) => (
        <List.Item>
          <PlanCard
            plan={plan}
            onShowDetails={onShowDetails}
            isRecommended={plan.id === recommendedPlanId}
          />
        </List.Item>
      )}
    />
  </div>
);

export default PlanList;
