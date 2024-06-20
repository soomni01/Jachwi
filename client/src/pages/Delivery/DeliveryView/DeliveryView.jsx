import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import "./DeliveryView.css";
import MapPopup from "../../../components/MapPopup/MapPopup";
import people from "../../../assets/people.png";
import marker from "../../../assets/marker.png";
import dayjs from "dayjs";
import io from "socket.io-client";
import Toast from "../../../components/Toast/Toast";

export const DeliveryView = () => {
  const { post_id } = useParams();
  const [username, setUsername] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [participantCount, setParticipantCount] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  const [mapPopupOpen, setMapPopupOpen] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 0, lon: 0 });
  const [mapPopupContent, setMapPopupContent] = useState("");
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("https://jachwi.site/api/session", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.user) {
          setUsername(data.user.username);
        }
      } catch (error) {
        console.error("세션에 오류가 발생했습니다.", error);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const fetchUserJoinedPosts = async () => {
      try {
        const response = await axios.get(
          `https://jachwi.site/api/userJoinedDelivery/${post_id}`,
          { params: { username } }
        );
        const { joinedUsers } = response.data;

        setIsParticipant(joinedUsers.includes(username));
        setParticipantCount(joinedUsers.length + 1);

        // deliveryInfo가 존재하고 user_id와 post_name이 정의되어 있는지 확인
        if (deliveryInfo) {
          const { user_id, post_name } = deliveryInfo;
          console.log(user_id, post_name);

          // user_id와 post_name을 각각 username과 room_name으로 설정
          //const room_name = post_name;
          //const Username = user_id;

          //console.log("username:", Username);
          //console.log("room_name:", room_name);
          //console.log(participantCount);
        }
      } catch (error) {
        console.error("사용자가 참가한 게시물을 가져오는 중 오류 발생:", error);
      }
    };

    fetchUserJoinedPosts();
  }, [post_id, username, deliveryInfo]);

  useEffect(() => {
    const fetchDeliveryInfo = async () => {
      if (!post_id) {
        console.error("post_id가 없습니다.");
        return;
      }
      try {
        const response = await axios.get(
          `https://jachwi.site/api/deliveryView/${post_id}`
        );
        if (response.status === 404) {
          console.error("해당 게시물을 찾을 수 없습니다.");
          return;
        }
        const { posts } = response.data;
        if (posts && posts.length > 0) {
          const post = posts[0];
          setDeliveryInfo(post);
          setIsAuthor(post.user_id === username);
          setParticipantCount(post.participant_num + 1);
          calculateRemainingTime(post.valid_time);
          console.log(post.participant_num);
        }
      } catch (error) {
        console.error("게시물 정보를 가져오는 중 오류 발생:", error);
      }
    };

    fetchDeliveryInfo();
  }, [post_id, username]);

  const calculateRemainingTime = (validTime) => {
    const currentTime = dayjs();
    const endTime = dayjs(validTime);
    const diff = endTime.diff(currentTime);

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const remainingTimeString = `${days}일 ${hours}시간 ${minutes}분  남음`;

      setRemainingTime(remainingTimeString);
    } else {
      setRemainingTime("유효 기간이 만료되었습니다.");
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleDeletePost = async () => {
    try {
      const response = await axios.delete(
        `https://jachwi.site/api/deletePost/${post_id}`
      );
      console.log(response.data);
      navigate("/deliverylist");
      setToastMessage("공동배달 게시글을 삭제하였습니다.");
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
    }
  };

  const handleEditPost = () => {
    navigate(`/edit/${post_id}`);
  };

  const handleJoin = async () => {
    try {
      const response = await axios.post(
        `https://jachwi.site/api/joinDelivery/${post_id}`,
        { username }
      );
      setIsParticipant(true);
      setParticipantCount((prevCount) => prevCount + 1); // 참가 시 participant_num 증가
      console.log("참가");
      setToastMessage("공동배달에 참가하였습니다.");
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    } catch (error) {
      console.error("참가 요청 실패:", error);
    }
  };

  const handleExit = async () => {
    try {
      const response = await axios.delete(
        `https://jachwi.site/api/exitDelivery/${post_id}`,
        {
          data: { username },
        }
      );
      console.log(response.data);
      setIsParticipant(false);
      setParticipantCount((prevCount) => prevCount - 1); // 나가기 시 participant_num 감소
      console.log("나가기");
      setToastMessage("공동배달을 나갔습니다.");
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    } catch (error) {
      console.error("나가기 요청 실패:", error);
    }
  };

  const handlePostAreaClick = () => {
    if (deliveryInfo) {
      const { lat, lon, post_area } = deliveryInfo;
      setMapCoordinates({ lat, lon });
      setMapPopupContent(post_area);
      setMapPopupOpen(true);
    }
  };

  const handleJoinChat = async () => {
    if (!deliveryInfo) {
      console.error("정보가 없습니다");
      return;
    }

    const room_name = deliveryInfo.post_name;
    const deliveryUsername = deliveryInfo.user_id;

    try {
      // 방을 찾는 요청
      const response = await axios.get(
        "https://jachwi.site/api/findChatRoom",
        {
          params: { username: deliveryUsername, room_name: room_name },
        }
      );
      const { roomId } = response.data; // 서버에서 받은 roomId 값

      // 채팅방 조인 요청
      const joinResponse = await axios.post(
        "https://jachwi.site/api/joinChatRoom",
        {
          roomId: roomId,
          userId: username,
        }
      );

      console.log("참가한 채팅방 정보:", joinResponse.data);

      // roomId를 사용하여 채팅 페이지로 이동
      navigate(`/chatroom/${roomId}`);
      setToastMessage("채팅방에 입장하였습니다.");
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    } catch (error) {
      console.error("Failed to join chat room:", error);
    }
  };

  return (
    <>
      <div className="navbar">
        <NavigationBar />
      </div>

      <div className="delivery-view-container">
        {deliveryInfo ? (
          <>
            <div className="delivery-post-title">
              <p className="dtitle"> {deliveryInfo.post_name}</p>
              <p className="dcategory">{deliveryInfo.category}</p>
            </div>
            <div className="delivery-information">
              <p className="delivery-author">작성자: {deliveryInfo.user_id}</p>
              <div className="all-date">
                <p className="delivery-date">
                  작성일: {formatDateTime(deliveryInfo.createdDate)}
                </p>
                <p className="delivery-valid">{remainingTime}</p>
              </div>
            </div>
            <hr className="delivery-comment-divider" />

            <div className="delvery-sub">
              <p className="delvery-content">{deliveryInfo.post_content}</p>
            </div>
            <hr className="delivery-comment-divider" />
            <div className="low-content">
              <div className="people-location">
                <div className="people-info">
                  <img src={people} alt="peopleimage" className="people-icon" />

                  <p className="view-delivery-people">
                    {participantCount} / {deliveryInfo.max_person_num}
                  </p>
                </div>
                <div className="location" onClick={handlePostAreaClick}>
                  <img
                    src={marker}
                    alt="Location Marker"
                    className="marker-icon"
                  />
                  <p className="delivery-area">{deliveryInfo.post_area}</p>
                </div>
              </div>

              <div className="delivery-post-edit">
                {isAuthor && (
                  <>
                    <button
                      className="join-chat-button"
                      onClick={handleJoinChat}
                    >
                      채팅방 참여하기
                    </button>
                    <button className="change-button" onClick={handleEditPost}>
                      수정
                    </button>
                    <button
                      className="delete-button"
                      onClick={handleDeletePost}
                    >
                      삭제
                    </button>
                  </>
                )}
                {!isAuthor && !isParticipant && (
                  <button
                    className={`join-button ${
                      participantCount >= deliveryInfo.max_person_num
                        ? "disabled"
                        : ""
                    }`}
                    onClick={handleJoin}
                    disabled={participantCount >= deliveryInfo.max_person_num}
                  >
                    참가하기
                  </button>
                )}
                {isParticipant && (
                  <>
                    <button className="exit-button" onClick={handleExit}>
                      나가기
                    </button>
                    <button
                      className="join-chat-button"
                      onClick={handleJoinChat}
                    >
                      채팅방 참여하기
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>로딩 중...</p>
        )}
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
    </>
  );
};

export default DeliveryView;
