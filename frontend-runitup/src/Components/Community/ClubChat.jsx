import React, { useState, useEffect, useRef } from "react";
import { List, Input, Button, Avatar, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { getHeaders, generateColor } from "../../utils/apiConfig";

const { Text } = Typography;

const ClubChat = ({ clubId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000); // Fetch messages every 5 seconds
    return () => clearInterval(intervalId);
  }, [clubId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${clubId}/messages`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${clubId}/messages`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ content: newMessage }),
        }
      );
      if (!response.ok) throw new Error("Failed to send message");
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ height: "400px", display: "flex", flexDirection: "column" }}>
      <List
        style={{ flexGrow: 1, overflow: "auto", padding: "10px" }}
        dataSource={messages}
        renderItem={(message) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{
                    backgroundColor: generateColor(message.sender.username),
                  }}
                >
                  {message.sender.username[0].toUpperCase()}
                </Avatar>
              }
              title={message.sender.username}
              description={
                <>
                  <Text>{message.content}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {new Date(message.timestamp).toLocaleString()}
                  </Text>
                </>
              }
            />
          </List.Item>
        )}
      />
      <div ref={messagesEndRef} />
      <div style={{ display: "flex", padding: "10px" }}>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onPressEnter={sendMessage}
          placeholder="Type a message..."
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={sendMessage}
          style={{ marginLeft: "10px" }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ClubChat;
