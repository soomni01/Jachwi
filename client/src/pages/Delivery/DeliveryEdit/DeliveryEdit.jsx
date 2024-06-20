import React, { useState, useEffect } from "react";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import koLocale from "date-fns/locale/ko";
import { foodOptions, peopleOptions } from "../../../components/Options";
import "./DeliveryEdit.css";

const DeliveryEdit = () => {
  const { post_id } = useParams();
  const navigate = useNavigate();
  const { kakao } = window;
  const [category, setCategory] = useState("");
  const [people, setPeople] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [fullAddress, setFullAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [postArea, setPostArea] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");

  useEffect(() => {
    const fetchDeliveryPost = async () => {
      try {
        const response = await axios.get(
          `https://jachwi.site/api/deliveryView/${post_id}`
        );
        const deliveryPost = response.data.posts[0];
        setCategory(deliveryPost.category);
        setPeople(deliveryPost.max_person_num);
        setSelectedDateTime(dayjs(deliveryPost.valid_time));
        setFullAddress(deliveryPost.take_location);
        setSelectedAddress(deliveryPost.post_area);
        setTitle(deliveryPost.post_name);
        setContent(deliveryPost.post_content);
        setLatitude(deliveryPost.lat);
        setLongitude(deliveryPost.lon);
        setPostArea(deliveryPost.post_area);
        setOriginalTitle(deliveryPost.post_name);
      } catch (error) {
        console.error("게시물 정보를 가져오는 중 오류 발생:", error);
      }
    };

    fetchDeliveryPost();
  }, [post_id]);

  useEffect(() => {
    if (kakao && latitude && longitude) {
      fetchUserLocation();
    }
  }, [kakao, latitude, longitude]);

  const fetchUserLocation = async () => {
    try {
      // 사용자의 위치 정보를 주소 이름에서 위도와 경도로 변환
      const coords = new kakao.maps.LatLng(latitude, longitude);

      // 변환된 좌표를 사용하여 지도의 초기 위치 설정
      const options = {
        center: coords,
        level: 3,
      };
      const container = document.getElementById("map");
      const map = new kakao.maps.Map(container, options);

      // 이전 마커를 저장하기 위한 변수
      let previousMarker = null;

      // 처음 로드될 때 기존 위치에 마커 표시
      const initialMarker = new kakao.maps.Marker({
        position: coords,
        map: map,
      });
      previousMarker = initialMarker;

      // 지도에 클릭 이벤트 리스너 등록
      kakao.maps.event.addListener(map, "click", function (mouseEvent) {
        // 클릭된 위치의 위도, 경도 가져오기
        const latlng = mouseEvent.latLng;
        const latitude = latlng.getLat();
        const longitude = latlng.getLng();

        // 클릭된 위치의 주소 가져오기
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(longitude, latitude, function (result, status) {
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
            setLatitude(latitude);
            setLongitude(longitude);
            //console.log("클릭 위치 위도: " + latitude);
            //console.log("클릭 위치 경도: " + longitude);
          } else {
            console.error("주소 변환 실패: " + status);
          }
        });

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
    } catch (error) {
      console.error("사용자 위치 가져오기 실패:", error);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handlePeopleChange = (e) => {
    setPeople(e.target.value);
  };

  const handleDateChange = (newValue) => {
    setSelectedDateTime(newValue);
  };

  const handleInputChange = (e) => {
    setPostArea(e.target.value);
  };

  const handleEditDeliveryPost = async () => {
    try {
      await axios.put(`https://jachwi.site/api/editDelivery/${post_id}`, {
        post_name: title,
        post_content: content,
        category,
        take_location: fullAddress,
        post_area: postArea,
        max_person_num: people,
        valid_time: selectedDateTime.toISOString(),
        lat: latitude,
        lon: longitude,
        oldPostName: originalTitle, // 이전 게시글의 이름을 보냅니다.
      });
      alert("게시글이 수정되었습니다.");
      console.log("수정 제목:", title, "  이전 제목:", originalTitle);

      navigate(`/deliveryview/${post_id}`);
    } catch (error) {
      console.error("게시글 수정 중 오류 발생:", error);
    }
  };

  return (
    <>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="delivery-edit-content">
        <div className="edit-left-content">
          <div className="categoryE-select">
            <label className="edit-category-text" htmlFor="category">
              음식 카테고리{" "}
            </label>
            <select
              className="edit-food-dropdown"
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
          <div className="edit-date-select">
            <LocalizationProvider
              className="edit-date-select"
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
          <div className="edit-people-select">
            <label className="category-text" htmlFor="category">
              인원수{" "}
            </label>
            <select
              className="edit-people-dropdown"
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
          <div className="edit-kakaomap" id="map"></div>
          <div>
            <input
              className="edit-location-text"
              value={postArea}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="middle-divider"></div>
        <div className="edit-right-content">
          <div className="edit-delivery-title">
            <h2>제목</h2>
            <input
              className="delivery-input-text"
              type="text"
              id="title"
              value={title}
              name="title"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="edit-delivery-detail">
            <h2>내용</h2>
            <textarea
              className="delivery-input-text"
              id="content"
              value={content}
              name="content"
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>
          <button
            className="edit-delivery-button"
            type="button"
            onClick={handleEditDeliveryPost}
          >
            수정
          </button>
        </div>
      </div>
    </>
  );
};

export default DeliveryEdit;
