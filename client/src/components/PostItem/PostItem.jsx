import React from "react";
import "./PostItem.css";
import defaultImage from "../../assets/post-image.png";
import marker from "../../assets/marker.png";
import korean from "../../assets/category/Korean.png";
import chinese from "../../assets/category/Chinese.jpg";
import japanese from "../../assets/category/Japanese.png";
import western from "../../assets/category/Western.png";
import snackbar from "../../assets/category/SnackBar.png";
import pizza from "../../assets/category/Pizza.png";
import chicken from "../../assets/category/Chicken.png";
import fastfood from "../../assets/category/FastFood.png";
import desert from "../../assets/category/Desert.png";
import etc from "../../assets/category/Etc.png";
import people from "../../assets/people.png";

// 카테고리별 이미지를 매핑한 객체
const categoryImages = {
  한식: korean,
  중식: chinese,
  일식: japanese,
  양식: western,
  분식: snackbar,
  피자: pizza,
  치킨: chicken,
  패스트푸드: fastfood,
  디저트: desert,
  기타: etc,
};

function PostItem({
  title,
  category,
  content,
  location,
  area,
  participantNum,
  maxNum,
  date,
  validDate,
  onTitleClick,
  onAreaClick,
}) {
  // 카테고리에 따라 이미지 설정
  const imageSrc = categoryImages[category] || defaultImage; // 카테고리에 해당하는 이미지가 없을 경우 기본 이미지 사용

  return (
    <div className="post-item">
      {/* 이미지 */}
      <div className="post-left">
        <img src={imageSrc} alt="Post Image" className="post-image" />
      </div>

      {/* 제목과 카테고리 */}
      <div className="post-center">
        <div className="post-top">
          <h3 className="post-title" onClick={onTitleClick}>
            {title}
          </h3>{" "}
          <img src={imageSrc} alt="Post Image" className="post-image-mobile" />
          <p className="post-category">{category}</p>
        </div>
        <p className="post-content">{content}</p>
        <div className="post-bottom">
          <p className="post-location">{location}</p>
          <div className="area">
            <img src={marker} alt="Location Marker" className="marker-icon" />
            <p className="post-area" onClick={onAreaClick}>
              {area}
            </p>
          </div>
          <div className="people">
            <img src={people} alt="People img" className="people-img" />
            <p className="participant-num">{participantNum}</p>
            <p>/</p>
            <p className="max-num">{maxNum}</p>
          </div>
        </div>
      </div>

      {/* 위치와 날짜 */}
      <div className="post-right">
        <p className="post-date">{date}</p>
        <p className="valid-date">{validDate}</p>
      </div>
    </div>
  );
}

export default PostItem;
