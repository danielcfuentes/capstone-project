import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";
import AddButton from "./AddButton";
import { getHeaders } from "../../utils/apiConfig";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/allposts`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      setErrorMessage("Error fetching posts");
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <div className="feed-page">
      <div className="content">
        <main className="main-content">
          {errorMessage && <p className="error"> {errorMessage} </p>}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </main>
      </div>
      <AddButton onPostCreated={handlePostCreated} />
    </div>
  );
};

export default FeedPage;
