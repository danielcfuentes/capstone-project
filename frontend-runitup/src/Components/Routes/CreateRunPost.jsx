import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Card,
  Typography,
  Space,
} from "antd";
import { PictureOutlined, SendOutlined } from "@ant-design/icons";
import { getAuthHeaders } from "../../utils/apiConfig";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../../styles/CreateRunPost.css";

const { TextArea } = Input;
const { Title } = Typography;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const CreateRunPost = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [mapImage, setMapImage] = useState(null);

  const { runData } = location.state || {};

  useEffect(() => {
    if (runData && runData.routeCoordinates) {
      generateMapImage(JSON.parse(runData.routeCoordinates));
    }
  }, [runData]);

  const generateMapImage = async (coordinates) => {
    const map = new mapboxgl.Map({
      container: document.createElement("div"),
      style: "mapbox://styles/mapbox/streets-v11",
      center: coordinates[0],
      zoom: 12,
    });

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      });

      map.addLayer({
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

      setTimeout(() => {
        const mapImage = map.getCanvas().toDataURL();
        setMapImage(mapImage);
        map.remove();
      }, 1000);
    });
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("content", values.content);
    formData.append("runId", runData.id);

    // Append map image
    if (mapImage) {
      const mapBlob = await fetch(mapImage).then((r) => r.blob());
      formData.append("images", mapBlob, "run-map.png");
    }

    // Append additional images
    fileList.forEach((file) => {
      formData.append("images", file.originFileObj);
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/posts`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      message.success("Run post created successfully!");
      navigate("/feed");
    } catch (error) {
      message.error("Error creating run post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    return false;
  };

  return (
    <Card className="create-run-post-card">
      <Title level={2}>Share Your Run</Title>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="title"
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input placeholder="Enter post title" />
        </Form.Item>
        <Form.Item
          name="content"
          rules={[{ required: true, message: "Please enter some content" }]}
        >
          <TextArea
            placeholder="Describe your run..."
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Form.Item>
        {mapImage && (
          <div className="map-preview">
            <img src={mapImage} alt="Run route" style={{ width: "100%" }} />
          </div>
        )}
        <Form.Item>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={beforeUpload}
            accept="image/*"
          >
            <div>
              <PictureOutlined />
              <div style={{ marginTop: 8 }}>Add Photos</div>
            </div>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={submitting}
            block
          >
            Post Run
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateRunPost;
