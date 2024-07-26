import React, { useState, useEffect } from "react";
import { Typography, message } from "antd";
import { getHeaders } from "../../utils/apiConfig";
import RecommendationForm from "./RecommendationForm";
import PlanCard from "./PlanCard";
import PlanModal from "./PlanModal";
import PlanList from "./PlanList";
import "../../styles/RecommendationPage.css";

const { Title } = Typography;

const RecommendationPage = () => {
  const [loading, setLoading] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchAllPlans();
  }, []);

  const fetchAllPlans = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/api/all-plans`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch plans");
      const data = await response.json();
      setAllPlans(data.plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      message.error("Failed to fetch plans. Please try again.");
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log("Submitting values:", values); // Log the values being sent

      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/api/recommend-plan`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(values),
        }
      );

      console.log("Response status:", response.status); // Log the response status

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText); // Log the error response
        throw new Error(
          `Failed to fetch recommendation: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Received data:", data); // Log the received data
      setRecommendedPlan(data.recommendedPlan);
    } catch (error) {
      console.error("Error details:", error); // Log the full error object
      message.error("Failed to get recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  return (
    <div className="recommendation-page">
      <Title level={2}>Get Your Personalized Running Plan</Title>
      <RecommendationForm onFinish={onFinish} loading={loading} />

      {recommendedPlan && (
        <div className="recommended-plan-section">
          <Title level={3}>Recommended Plan</Title>
          <PlanCard
            plan={recommendedPlan}
            onShowDetails={showPlanDetails}
            isRecommended={true}
          />
        </div>
      )}

      <PlanList
        plans={allPlans}
        onShowDetails={showPlanDetails}
        recommendedPlanId={recommendedPlan?.id}
      />

      <PlanModal
        plan={selectedPlan}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default RecommendationPage;
