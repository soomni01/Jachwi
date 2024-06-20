import React from "react";
import "./PostItemboard.css";
import filledHeartIcon from "../../assets/filled-heart.png";
import emptyHeartIcon from "../../assets/empty-heart.png";

const PostItemboard = ({
  title,
  content,
  created_at,
  author,
  onTitleClick,
  showLikeButton,
  liked,
  toggleLike,
  showAuthor,
  showContent,
}) => {
  const truncateContent = (content) => {
    return content.length > 30 ? content.substring(0, 30) + "..." : content;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleLikeToggle = () => {
    if (toggleLike) {
      toggleLike();
    }
  };

  return (
    <div className="post-itemboard">
      <h3 className="post-titleboard" onClick={onTitleClick}>
        {title}
      </h3>
      {showAuthor && <p className="post-authorboard">{author} 님 </p>}
      {showContent && (
        <p className="post-contentboard">{truncateContent(content)}</p>
      )}
      <p className="post-dateboard">{formatDate(created_at)}</p>
      {showLikeButton && (
        <img
          src={liked ? filledHeartIcon : emptyHeartIcon}
          alt="Heart"
          className="like-icon"
          onClick={handleLikeToggle}
        />
      )}
    </div>
  );
};

export default PostItemboard;
