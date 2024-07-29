import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Avatar, Typography, Spin, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { getHeaders, generateColor } from "../../utils/apiConfig";

const { Text } = Typography;

const ClubChat = ({ clubId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000);
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
      setLoading(false);
    } catch (error) {
      setLoading(false);
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
      message.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (chatContainerRef.current.scrollTop === 0) {
      // Load more messages when scrolled to top
      // Implement pagination logic here
    }
  };

  return (
    <div className="club-chat">
      <div
        className="chat-messages"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {loading ? (
          <Spin size="large" />
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.sender.username === currentUser.name
                  ? "message-right"
                  : "message-left"
              }`}
            >
              <Avatar
                style={{
                  backgroundColor: generateColor(message.sender.username),
                }}
              >
                {message.sender.username[0].toUpperCase()}
              </Avatar>
              <div>
                <Text strong>{message.sender.username}</Text>
                <p>{message.content}</p>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {new Date(message.timestamp).toLocaleString()}
                </Text>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
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
