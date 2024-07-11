import React from "react";
import { Form, Input, Button } from "antd";

const RouteForm = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
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
        <Input type="number" placeholder="Distance (miles)" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Generate Route
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RouteForm;
