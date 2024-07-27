import React, { useState, useEffect, useRef } from "react";
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
import {
  initializeMap,
  addRouteToMap,
  fitMapToRouteWithStart,
  getElevationData,
} from "../../utils/mapUtils";
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
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [mapImage, setMapImage] = useState(null);

  const { runData } = location.state || {};

  useEffect(() => {
    if (runData && runData.routeCoordinates) {
      const coordinates = JSON.parse(runData.routeCoordinates);
      renderRouteMap(coordinates);
    }
  }, [runData]);

  const renderRouteMap = async (coordinates) => {
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: coordinates[0],
      zoom: 12,
      interactive: false,
    });

    newMap.on("load", async () => {
      const elevationData = await getElevationData(coordinates);
      addRouteToMap(newMap, { coordinates }, elevationData.elevationProfile);

      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      newMap.fitBounds(bounds, { padding: 50, duration: 0 });

      // Wait for the map to render completely
      setTimeout(() => {
        const mapImage = newMap.getCanvas().toDataURL();
        setMapImage(mapImage);
        newMap.remove(); // Remove the map instance after capturing
      }, 1000);
    });
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("content", values.content);
    formData.append("runId", runData.id);

    // Append the map image
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
      <div ref={mapContainer} className="map-container-post" />
      {mapImage && (
        <img src={mapImage} alt="Run route" className="route-preview" />
      )}
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
