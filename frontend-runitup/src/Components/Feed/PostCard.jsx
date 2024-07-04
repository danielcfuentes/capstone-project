import React from "react";
import "../../styles/PostCard.css";

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      <div className="post-header">
        <h3>{post.title}</h3>
        <p className="post-author">Posted by: {post.userId}</p>
      </div>
      <p className="post-content">{post.content}</p>
      {/* {post.images && post.images.length > 0 && ( */}
      <div className="post-images">
        {post.images.map((image) => (
          <img
            key={image.id}
            src={`${import.meta.env.VITE_POST_ADDRESS}/images/${image.id}`}
            alt="Post image"
          />
        ))}
      </div>
      <div className="post-footer">
        <span className="post-date">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
        {/* can add like and comment functionality here */}
        <button className="like-button">Like</button>
        <button className="comment-button">Comment</button>
      </div>
    </div>
  );
};

export default PostCard;
