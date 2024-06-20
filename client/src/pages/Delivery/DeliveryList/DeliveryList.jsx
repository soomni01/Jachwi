import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import PostItem from "../../../components/PostItem/PostItem";
import Popup from "../../../components/Popup/Popup";
import MapPopup from "../../../components/MapPopup/MapPopup";
import { foodOptions, sortOptions } from "../../../components/Options";
import postImage from "../../../assets/post-image.png";
import "./DeliveryList.css";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Toast from "../../../components/Toast/Toast";

function DeliveryList() {
  // 상태 변수들
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [enrollCompany, setEnrollCompany] = useState({ address: "" });
  const [selectedAddress, setSelectedAddress] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [mapPopupOpen, setMapPopupOpen] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 0, lon: 0 });
  const [mapPopupContent, setMapPopupContent] = useState("");
  const [user_id, setUser_id] = useState(null);
  const [sessionFetched, setSessionFetched] = useState(false);
  const [posts, setPosts] = useState([]);
  const [remainingTime, setRemainingTime] = useState({});
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");

  // 게시물의 작성 시간을 한글로 표시하는 함수
  const fromNowKorean = (date) => {
    const diffSeconds = dayjs().diff(date, "second");
    if (diffSeconds < 60) return "방금";
    const diffMinutes = dayjs().diff(date, "minute");
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    const diffHours = dayjs().diff(date, "hour");
    if (diffHours < 24) return `${diffHours}시간 전`;
    const diffDays = dayjs().diff(date, "day");
    return `${diffDays}일 전`;
  };

  // 게시물의 남은 유효 시간을 계산하는 함수
  const calculateRemainingTimes = () => {
    const newRemainingTimes = {};
    posts.forEach((post) => {
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

  // 세션을 가져오는 함수
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
      const response = await axios.post(`https://jachwi.site/api/location`, {
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

  // 게시물을 가져오는 함수
  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        "https://jachwi.site/api/getDeliveryPosts"
      );
      const { data } = response;
      setPosts(data.posts);
      calculateRemainingTimes(); // fetchPosts() 완료 후 calculateRemainingTimes() 호출
    } catch (error) {
      console.error("게시글 데이터 가져오기 실패:", error);
    }
  };

  // 유효 기간이 지난 게시물 삭제 요청
  const deleteExpiredPosts = async () => {
    try {
      const response = await axios.delete(
        "https://jachwi.site/api/deleteExpiredPosts"
      );
      console.log(response.data); // 삭제된 게시물에 대한 응답 확인
    } catch (error) {
      console.error("유효 기간이 지난 게시물 삭제 실패:", error);
    }
  };

  // 컴포넌트가 처음 렌더링될 때 실행되는 useEffect
  useEffect(() => {
    fetchPosts();
    fetchSession();
    deleteExpiredPosts();
  }, []);

  // 게시물 상태가 변경될 때마다 실행되는 useEffect
  useEffect(() => {
    if (sessionFetched && user_id) {
      fetchUserLocation();
    }
  }, [sessionFetched, user_id]);

  // 게시글 상태가 변경될 때마다 남은 유효 시간을 계산
  useEffect(() => {
    calculateRemainingTimes();
  }, [posts, sortOrder]);

  // 위치 선택 핸들러
  const handleSelectLocation = () => {
    setPopupOpen(true);
  };

  // 팝업 닫기 핸들러
  const handlePopupClose = () => {
    setPopupOpen(false);
  };

  // 주소 형식을 통일시키는 함수
  const formatAddress = (address) => {
    const splitAddress = address.split(" ");
    const formattedAddress = splitAddress.slice(0, 3).join(" "); // "경기 양주시"와 "덕계동"만을 선택
    return formattedAddress;
  };

  // 팝업에서 주소 선택이 완료될 때 호출되는 함수
  const handleComplete = (data) => {
    let selectedAddress = "";

    // 지번 주소 사용
    if (data.addressType === "R" && data.jibunAddress !== "") {
      const addressArray = data.jibunAddress.split(" ");
      selectedAddress = `${addressArray[0]} ${addressArray[1]} ${addressArray[2]}`; // 지번 주소에서 동까지만 표시
    } else {
      const addressArray = data.roadAddress.split(" ");
      selectedAddress = `${addressArray[0]} ${addressArray[1]} ${addressArray[2]}`; // 도로명 주소에서 동까지만 표시
    }

    setEnrollCompany({
      ...enrollCompany,
      address: selectedAddress,
    });

    setSelectedAddress(selectedAddress);

    handlePopupClose();
    setToastMessage("지역을 재설정하였습니다");

    // 3초 후에 토스트 메시지를 숨깁니다.
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // 게시글 생성 핸들러
  const handleCreatePost = () => {
    navigate("/deliverypost");
  };

  // 게시글 클릭 핸들러
  const handlePostItemClick = (post_id) => {
    navigate(`/deliveryview/${post_id}`);
  };

  const handlePostAreaClick = (post_id) => {
    const post = posts.find((post) => post.post_id === post_id);
    if (post) {
      setMapCoordinates({ lat: post.lat, lon: post.lon });
      setMapPopupContent(post.post_area); // 팝업 내용을 post_area로 설정
      setMapPopupOpen(true);
    }
  };

  // 정렬 순서 변경 핸들러
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // 전체보기 체크박스 핸들러
  const handleShowAllPostsChange = (event) => {
    setShowAllPosts(event.target.checked);
  };

  const handleShowMyPostsChange = (event) => {
    setShowMyPosts(event.target.checked);
  };

  // 게시글 목록을 필터링 및 정렬하는 함수
  const filterAndSortPosts = (posts, category, sortOrder) => {
    let filteredPosts = posts;

    // 카테고리 필터링
    if (category) {
      filteredPosts = filteredPosts.filter(
        (post) => post.category === category
      );
    }

    // 전체보기가 체크되어 있지 않은 경우, 사용자가 선택한 주소와 일치하는 게시글만 필터링
    if (!showAllPosts) {
      filteredPosts = filteredPosts.filter(
        (post) => post.take_location === selectedAddress
      );
    }

    // 내가 쓴 글 보기가 체크된 경우, 사용자가 작성한 게시글만 필터링
    if (showMyPosts) {
      // 내가 쓴 게시글은 위치와 상관없이 모두 보여줌
      filteredPosts = posts.filter((post) => post.user_id === user_id);
    }

    // 정렬 순서에 따라 정렬
    if (sortOrder === "최신순") {
      filteredPosts.sort((a, b) =>
        dayjs(b.createdDate).diff(dayjs(a.createdDate))
      );
    } else if (sortOrder === "기간순") {
      filteredPosts.sort((a, b) => {
        const remainingTimeA = remainingTime[a.post_id];
        const remainingTimeB = remainingTime[b.post_id];

        // 남은 시간이 없을 경우 처리
        if (!remainingTimeA || !remainingTimeB) {
          return 0;
        }

        const [hoursA, minutesA] = remainingTimeA
          .replace("시간", "")
          .replace("분", "")
          .split(" ");
        const [hoursB, minutesB] = remainingTimeB
          .replace("시간", "")
          .replace("분", "")
          .split(" ");
        const totalMinutesA = parseInt(hoursA) * 60 + parseInt(minutesA);
        const totalMinutesB = parseInt(hoursB) * 60 + parseInt(minutesB);
        return totalMinutesA - totalMinutesB;
      });
    }

    return filteredPosts;
  };

  // 정렬 및 필터링된 게시글 목록
  const sortedAndFilteredPosts = filterAndSortPosts(posts, category, sortOrder);

  return (
    <>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="delivery-content">
        <h2>
          현재 지정된 위치는{" "}
          {selectedAddress ? `${selectedAddress}입니다.` : "입니다."}
        </h2>
        <div className="select-container">
          <div className="first-select">
            <div className="category-select">
              <label className="category-text" htmlFor="category">
                음식 카테고리{" "}
              </label>
              <select
                className="category-dropdown"
                id="category"
                value={category}
                onChange={handleCategoryChange}
              >
                {foodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sort-select">
              <label className="sort-text" htmlFor="sortOrder">
                정렬 순서{" "}
              </label>
              <select
                className="sort-dropdown"
                id="sortOrder"
                value={sortOrder}
                onChange={handleSortOrderChange}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="who-select">
            <div className="my-posts">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showMyPosts}
                    onChange={handleShowMyPostsChange}
                    color="success"
                  />
                }
                label={
                  <span
                    className="my-posts"
                    style={{
                      fontFamily: "NPS",

                      marginLeft: "-5px",
                    }}
                  >
                    내가 쓴 게시글 보기
                  </span>
                } //
              />
            </div>
            <div className="all-posts">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showAllPosts}
                    onChange={handleShowAllPostsChange}
                    color="success"
                  />
                }
                label={
                  <span
                    className="all-posts"
                    style={{
                      fontFamily: "NPS",
                      marginLeft: "-5px",
                    }}
                  >
                    전체보기
                  </span>
                } //
              />
            </div>
          </div>
          <div className="buttons">
            <button
              className="select-location-button"
              onClick={handleSelectLocation}
            >
              지역 설정
            </button>

            <Popup
              open={popupOpen}
              onClose={handlePopupClose}
              onComplete={handleComplete}
            />

            <button className="delivery-post-button" onClick={handleCreatePost}>
              게시글 생성
            </button>
          </div>
        </div>
        <div className="delivery-list">
          {sortedAndFilteredPosts.map((post) => (
            <PostItem
              key={post.post_id}
              imageSrc={postImage}
              title={post.post_name}
              category={post.category}
              content={post.post_content.slice(0, 40)}
              location={post.take_location}
              area={post.post_area}
              participantNum={post.participant_num}
              maxNum={post.max_person_num}
              date={fromNowKorean(dayjs(post.createdDate))}
              validDate={remainingTime[post.post_id]}
              onTitleClick={() => handlePostItemClick(post.post_id)}
              onAreaClick={() => handlePostAreaClick(post.post_id)}
            />
          ))}
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
        <Toast message={toastMessage} showToast={toastMessage !== ""} />
      </div>
    </>
  );
}

export default DeliveryList;
