import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";
import AddButton from "./AddButton";


const FeedPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_POST_ADDRESS}/allposts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <div className="feed-page">
      <div className="content">
        <main className="main-content">
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
