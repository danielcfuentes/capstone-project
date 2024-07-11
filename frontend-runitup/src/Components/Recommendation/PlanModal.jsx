import React from "react";
import { Modal, Typography } from "antd";

const { Title, Text, Paragraph } = Typography;

const PlanModal = ({ plan, visible, onClose }) => (
  <Modal
    title={plan?.name}
    visible={visible}
    onCancel={onClose}
    footer={null}
    className="plan-modal"
  >
    {plan && (
      <>
        <Paragraph>{plan.description}</Paragraph>
        <Text strong>Distance: </Text>
        <Text>{plan.distance}</Text>
        <br />
        <Text strong>Duration: </Text>
        <Text>{plan.duration} weeks</Text>
        <br />
        <Text strong>Level: </Text>
        <Text>{plan.level}</Text>
        <br />
        <Text strong>Goal Time: </Text>
        <Text>{plan.goalTime}</Text>
        <br />
        <Title level={4}>Weekly Schedule</Title>
        {plan.weeklySchedule.map((week, index) => (
          <div key={index}>
            <Text strong>Week {week.week}:</Text>
            <ul>
              {week.days.map((day, dayIndex) => (
                <li key={dayIndex}>
                  {day.day}: {day.workout}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Title level={4}>Tips</Title>
        <ul>
          {plan.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </>
    )}
  </Modal>
);

export default PlanModal;
