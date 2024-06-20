import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import "./Main.css";
import mainImage from "../../assets/main-image.jpg";
import marker from "../../assets/marker.png";
import people from "../../assets/people.png";
import dayjs from "dayjs";
import MapPopup from "../../components/MapPopup/MapPopup";
import postImage from "../../assets/post-image.png";
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

const Main = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [latestDeliveryPosts, setLatestDeliveryPosts] = useState([]);
  const navigate = useNavigate();
  const [user_id, setUser_id] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [sessionFetched, setSessionFetched] = useState(false);
  const [mapPopupOpen, setMapPopupOpen] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 0, lon: 0 });
  const [mapPopupContent, setMapPopupContent] = useState("");
  const [remainingTime, setRemainingTime] = useState({});

  // 세션 정보를 가져오는 함수
  const fetchSession = async () => {
    try {
      const response = await fetch("https://jachwi.site/api/session", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.user) {
        setUser_id(data.user.username);
        setSessionFetched(true);
      }
    } catch (error) {
      console.error("세션에 오류가 발생했습니다.", error);
    }
  };

  // 사용자 위치를 가져오는 함수
  const fetchUserLocation = async () => {
    try {
      const response = await axios.post("https://jachwi.site/api/location", {
        username: user_id,
      });
      const { location } = response.data;
      if (location) {
        setSelectedAddress(location);
      }
    } catch (error) {
      console.error("사용자 위치 가져오기 실패:", error);
    }
  };

  // 최신 게시글 5개를 가져오는 함수
  const fetchLatestPosts = async () => {
    try {
      const response = await axios.get(
        "https://jachwi.site/api/getLatestPosts"
      );
      setLatestPosts(response.data.latestPosts);
    } catch (error) {
      console.error("최신 게시글을 가져오는데 오류가 발생했습니다.", error);
    }
  };

  // 최신 배달 게시글 5개를 가져오는 함수
  const fetchLatestDeliveryPosts = async (address) => {
    try {
      const response = await axios.get(
        "https://jachwi.site/api/getLatestDeliveryPosts",
        {
          params: { location: address },
        }
      );
      setLatestDeliveryPosts(response.data.latestDeliveryPosts);
    } catch (error) {
      console.error(
        "최신 배달 게시글을 가져오는데 오류가 발생했습니다.",
        error
      );
    }
  };

  // 제목 클릭 핸들러
  const handleTitleClick = (postId) => {
    navigate(`/view/${postId}`);
  };

  const handleDeliveryTitleClick = (deliveryPostId) => {
    navigate(`/deliveryview/${deliveryPostId}`);
  };

  useEffect(() => {
    fetchSession();
    fetchLatestPosts();
  }, []);

  useEffect(() => {
    if (sessionFetched && user_id) {
      fetchUserLocation();
      calculateRemainingTimes();
    }
  }, [sessionFetched, user_id]);

  useEffect(() => {
    if (selectedAddress) {
      fetchLatestDeliveryPosts(selectedAddress);
    }
  }, [selectedAddress]);

  const handlePostAreaClick = (post_id) => {
    const post = latestDeliveryPosts.find((post) => post.post_id === post_id);
    if (post) {
      setMapCoordinates({ lat: post.lat, lon: post.lon });
      setMapPopupContent(post.post_area); // 팝업 내용을 post_area로 설정
      setMapPopupOpen(true);
    }
  };

  // 게시물의 남은 유효 시간을 계산하는 함수
  const calculateRemainingTimes = () => {
    const newRemainingTimes = {};
    latestDeliveryPosts.forEach((post) => {
      const currentTime = dayjs();
      const validTime = dayjs(post.valid_time);
      const diffInMilliseconds = validTime.diff(currentTime);

      const remainingDays = Math.floor(
        diffInMilliseconds / (1000 * 60 * 60 * 24)
      );
      const remainingHours = Math.floor(
        (diffInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const remainingMinutes = Math.floor(
        (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
      );

      const remainingTimeString = `${remainingDays}일 ${remainingHours}시간 ${remainingMinutes}분 남음`;

      newRemainingTimes[post.post_id] = remainingTimeString;
    });
    setRemainingTime(newRemainingTimes);
  };

  useEffect(() => {
    calculateRemainingTimes();
  }, [latestDeliveryPosts]);

  return (
    <>
      <div className="main">
        <NavigationBar />
      </div>
      <div className="main-image">
        <img className="mainImage" src={mainImage} alt="Main" />
      </div>
      <div className="mainlist-container">
        <div className="mainPosts">
          <h2>최신 게시글</h2>
          <table className="mainTable">
            <thead>
              <tr>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
              </tr>
            </thead>
            <tbody>
              {latestPosts.map((post) => (
                <tr key={post.id} onClick={() => handleTitleClick(post.id)}>
                  <td>
                    <span className="postTitle">{post.title}</span>
                  </td>
                  <td>{post.author}</td>
                  <td>{post.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="deliveryPosts">
          <h2>최신 배달 게시글</h2>
          <ul className="DeliveryList">
            {latestDeliveryPosts.slice(0, 4).map((deliverypost) => (
              <li
                key={deliverypost.post_id}
                onClick={() => handleDeliveryTitleClick(deliverypost.post_id)}
              >
                <span className="main-category">
                  <img
                    className="main-category-image"
                    src={categoryImages[deliverypost.category] || postImage}
                    alt="Category"
                  />
                </span>
                <span className="category">{deliverypost.category}</span>
                <span className="postName">{deliverypost.post_name}</span>
                <div className="deliveryArea">
                  <img
                    src={marker}
                    alt="Location Marker"
                    className="main-marker-icon"
                  />
                  <p
                    className="main-post-area"
                    onClick={(e) => {
                      e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
                      handlePostAreaClick(deliverypost.post_id);
                    }}
                  >
                    {deliverypost.post_area}
                  </p>
                </div>

                <img
                  src={people}
                  alt="peopleimage"
                  className="main-people-icon"
                />
                <p className="delivery-people">
                  {deliverypost.participant_num} / {deliverypost.max_person_num}
                </p>
                <span className="validDate">
                  {remainingTime[deliverypost.post_id]}
                </span>
              </li>
            ))}
          </ul>
          <div className="latest-posts"></div>
        </div>

        {mapPopupOpen && (
          <MapPopup
            isOpen={mapPopupOpen}
            lat={mapCoordinates.lat}
            lon={mapCoordinates.lon}
            postArea={mapPopupContent}
            onClose={() => setMapPopupOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default Main;
