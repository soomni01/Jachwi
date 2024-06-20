import React, { useState, useEffect } from "react";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import koLocale from "date-fns/locale/ko";
import { foodOptions } from "../../../components/Options";
import { peopleOptions } from "../../../components/Options";
import "./DeliveryPost.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Toast from "../../../components/Toast/Toast";

export default function BasicDateTimePicker() {
  const [category, setCategory] = useState("");
  const [people, setPeople] = useState("");
  const [selectedDateTime, setSelectedDateTime] = React.useState(null);
  const [fullAddress, setFullAddress] = useState(""); // 주소 상태 추가
  const { kakao } = window;
  const [user_id, setUser_id] = useState(null);
  const [sessionFetched, setSessionFetched] = useState(false); // 세션 정보를 가져왔는지 여부 상태 추가
  const [selectedAddress, setSelectedAddress] = useState(""); // 시, 구, 동 상태 추가
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [latitude, setLaitude] = useState("");
  const [longitude, setLongtitude] = useState("");
  const [postArea, setPostArea] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [roomCreated, setRoomCreated] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // 세션 정보를 가져와서 사용자 ID를 설정합니다.
    const fetchSession = async () => {
      try {
        const response = await fetch("https://jachwi.site/api/session", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.user) {
          setUser_id(data.user.username);
          setUsername(data.user.username);
          console.log("사용자 ID:", data.user.username); // 변경된 user_id 값 확인

          setSessionFetched(true); // 세션 정보를 가져왔음을 표시
        }
      } catch (error) {
        console.error("세션에 오류가 발생했습니다.", error);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    // 페이지가 로드될 때 사용자의 초기 위치 설정
    if (sessionFetched && user_id) {
      fetchUserLocation();
    }
  }, [sessionFetched, user_id]);

  const fetchUserLocation = async () => {
    try {
      // 서버에서 사용자의 위치 정보 가져오기
      const response = await axios.post(`https://jachwi.site/api/location`, {
        username: user_id,
      });
      const { location } = response.data;
      console.log(location);
      if (location) {
        setSelectedAddress(location);
        console.log("사용자 위치는:", location);

        // 사용자의 위치 정보를 주소 이름에서 위도와 경도로 변환
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(location, function (result, status) {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            // 변환된 좌표를 사용하여 지도의 초기 위치 설정
            const options = {
              center: coords,
              level: 3,
            };
            const container = document.getElementById("map");
            const map = new kakao.maps.Map(container, options);

            // 이전 마커를 저장하기 위한 변수
            let previousMarker = null;

            // 지도에 클릭 이벤트 리스너 등록
            kakao.maps.event.addListener(map, "click", function (mouseEvent) {
              // 클릭된 위치의 위도, 경도 가져오기
              const latlng = mouseEvent.latLng;
              const latitude = latlng.getLat();
              const longitude = latlng.getLng();

              // 클릭된 위치의 주소 가져오기
              const geocoder = new kakao.maps.services.Geocoder();
              geocoder.coord2Address(
                longitude,
                latitude,
                function (result, status) {
                  if (status === kakao.maps.services.Status.OK) {
                    // 주소 정보 출력
                    const address = result[0].address;
                    const fullAddress =
                      address.region_1depth_name +
                      " " +
                      address.region_2depth_name +
                      " " +
                      address.region_3depth_name;

                    setFullAddress(fullAddress);
                    console.log("클릭 위치 주소:", fullAddress);
                    setPostArea(fullAddress);

                    // 클릭 위치의 위도, 경도 출력
                    setLaitude(latitude);
                    setLongtitude(longitude);
                    console.log("클릭 위치 위도: " + latitude);
                    console.log("클릭 위치 경도: " + longitude);
                  } else {
                    console.error("주소 변환 실패: " + status);
                  }
                }
              );

              // 이전 마커가 존재하면 제거
              if (previousMarker) {
                previousMarker.setMap(null);
              }

              // 클릭한 위치에 마커 표시
              const marker = new kakao.maps.Marker({
                position: latlng,
                map: map,
              });

              // 이전 마커 업데이트
              previousMarker = marker;
            });
          } else {
            console.error("주소 변환 실패:", status);
          }
        });
      }
    } catch (error) {
      console.error("사용자 위치 가져오기 실패:", error);
    }
  };

  useEffect(() => {
    if (kakao) {
      fetchUserLocation();
    }
  }, [kakao]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handlePeopleChange = (e) => {
    setPeople(e.target.value);
  };

  const handleDateChange = (newValue) => {
    setSelectedDateTime(newValue);
    const dateFormat = dayjs(newValue).format("YYYY-MM-DD-hh-mm-a");

    console.log("선택한 날짜와 시간입니다.", newValue);
    console.log(dateFormat);
  };

  const handleInputChange = (e) => {
    setPostArea(e.target.value); // 입력 값으로 주소 상태 업데이트
  };

  const newDeliveryPost = async () => {
    try {
      await axios.post("https://jachwi.site/api/deliveryPost", {
        user_id: user_id,
        post_name: title,
        post_content: content,
        category: category,
        take_location: fullAddress,
        post_area: postArea,
        participant_num: 1, // 초기값 0으로 설정
        max_person_num: parseInt(people), // 선택된 최대 인원수
        valid_time: selectedDateTime
          ? dayjs(selectedDateTime).format("YYYY-MM-DD HH:mm:ss")
          : null, // 선택된 기간
        lat: latitude, // 추후에 지도에서 선택한 위치의 위도로 설정
        lon: longitude, // 추후에 지도에서 선택한 위치의 경도로 설정
      });
      console.log("게시물이 성공적으로 저장되었습니다.");

      await handleCreateRoom(); // 방을 생성

      navigate("/deliverylist");
      setToastMessage("게시물을 등록하였습니다.");
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    } catch (error) {
      console.error("게시물 저장 중 오류 발생:", error);
      console.log(
        "사용자",
        user_id,
        "제목",
        title,
        "내용",
        content,
        "카테고리",
        category,
        "지도 주소",
        fullAddress,
        "작성 주소",
        postArea,
        1,
        "최대 인원",
        parseInt(people),
        "기간",
        selectedDateTime,
        "위도",
        latitude,
        "경도",
        longitude
      );
    }
  };

  const handleCreateRoom = async () => {
    const socket = io("https://jachwi.site");
    socket.emit("createRoom", { title, username });

    socket.on("roomCreated", async ({ roomId }) => {
      console.log("새로운 방이 생성되었습니다. 방 ID:", roomId);
      setRoomCreated(true);
      await handleJoinChatRoom(roomId);
    });
  };

  const handleJoinChatRoom = async (roomId) => {
    try {
      console.log("방아이디는", roomId, "사용자아이디는", user_id);
      // 채팅방 조인 요청
      const joinResponse = await axios.post(
        `https://jachwi.site/api/joinChatRoom`,
        {
          roomId: roomId,
          userId: user_id,
        }
      );

      console.log("참가한 채팅방 정보:", joinResponse.data);
    } catch (error) {
      console.error("Failed to join chat room:", error);
    }
  };

  return (
    <>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="delivery-post-content">
        <div className="post-left-content">
          <div className="categoryP-select">
            <label className="category-text" htmlFor="category">
              음식 카테고리{" "}
            </label>
            <select
              className="post-food-dropdown"
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
          <h2>게시물 등록 기간을 설정해주세요</h2>
          <div className="post-date-select">
            <LocalizationProvider
              className="post-date-select"
              dateAdapter={AdapterDayjs}
              locale={koLocale}
            >
              <DemoContainer
                className="date-option"
                components={["DateTimePicker"]}
              >
                <DateTimePicker
                  label="날짜/시간"
                  value={selectedDateTime}
                  onChange={handleDateChange}
                  locale={koLocale}
                  format="YYYY년 MM월 DD일 hh:mm a"
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>
          <div className="post-people-select">
            <label className="post-category-text" htmlFor="category">
              인원수{" "}
            </label>
            <select
              className="post-people-dropdown"
              id="people"
              value={people}
              onChange={handlePeopleChange}
            >
              {peopleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <h2>모임 장소를 선택하세요</h2>
          <div className="post-kakaomap" id="map"></div>
          <div>
            <input
              className="post-location-text"
              value={postArea} // 주소 상태 값을 입력란에 표시
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="middle-divider"></div> {/* 가운데 구분선 */}
        <div className="post-right-content">
          <div className="post-delivery-title">
            <h2>제목</h2>
            <input
              className="post-delivery-input-text"
              type="text"
              id="title"
              value={title}
              name="title"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="post-delivery-detail">
            <h2>내용</h2>
            <textarea
              className="post-delivery-input-text"
              id="content"
              value={content}
              name="content"
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>
          <button
            className="post-delivery-button"
            type="button"
            onClick={newDeliveryPost}
          >
            등록
          </button>
        </div>
        <Toast message={toastMessage} showToast={toastMessage !== ""} />
      </div>
    </>
  );
}
