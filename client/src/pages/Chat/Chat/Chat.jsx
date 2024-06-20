import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import "./Chat.css";
import searchButton from "../../../assets/search-button.png";
import Toast from "../../../components/Toast/Toast";
import ConfirmationModal from "./ChatConfirmationModal";
import deliveryImg from "../../../assets/delivery2.png";
import deleteImg from "../../../assets/trash.png";
import toggleImg from "../../../assets/my-chat.png";

const ChatComponent = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [username, setUsername] = useState("");
  const [userChatRooms, setUserChatRooms] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [filteredChatRooms, setFilteredChatRooms] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [sidebarActive, setSidebarActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("https://jachwi.site/api/session", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.user) {
          setUsername(data.user.username);
          fetchChatRooms();
          fetchUserChatRooms(data.user.username);
        }
      } catch (error) {
        console.error("세션에 오류가 발생했습니다.", error);
      }
    };

    fetchSession();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const response = await axios.get("https://jachwi.site/api/getChatRoom");
      setChatRooms(response.data.chatRooms);
      console.log("Username:", username);
    } catch (error) {
      console.error("채팅방을 가져오는데 실패했습니다.", error);
    }
  };

  const fetchUserChatRooms = async (username) => {
    try {
      const response = await axios.get(
        `https://jachwi.site/api/getUserChatRoom?userId=${username}`
      );
      const responseData = response.data;
      console.log("서버 응답 확인:", responseData);
      if (responseData.success) {
        const modifiedUserRooms = Array.isArray(responseData.userChatRooms)
          ? responseData.userChatRooms
          : [];
        setUserChatRooms(modifiedUserRooms);
        console.log(
          "사용자가 참여한 채팅방을 가져왔습니다.",
          modifiedUserRooms
        );
      } else {
        console.error("서버 응답에 실패했습니다:", responseData.message);
      }
    } catch (error) {
      console.error("사용자가 참여한 채팅방을 가져오는데 실패했습니다.", error);
    }
  };

  const handleCreateRoom = () => {
    navigate(`/room`);
  };

  const handleRoomClick = (roomId) => {
    navigate(`/chatRoom/${roomId}`);
  };

  const isAlreadyJoined = (roomId) => {
    return userChatRooms.some((room) => room.id === roomId);
  };

  const handleJoinRoom = (roomId) => {
    if (!username) {
      console.error("유저 ID를 찾을 수 없습니다! 로그인이 필요합니다.");
      navigate(`/login`);
      return;
    }

    if (!isAlreadyJoined(roomId)) {
      axios
        .post("https://jachwi.site/api/joinChatRoom", {
          roomId,
          userId: username,
        })
        .then((response) => {
          navigate(`/chatRoom/${roomId}`);
        })
        .catch((error) => {
          console.error("채팅방에 입장하는데 실패했습니다.", error);
        });
    } else {
      navigate(`/chatRoom/${roomId}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
  };

  const handleSearch = () => {
    if (searchKeyword.trim() !== "") {
      const filtered = chatRooms.filter((room) =>
        room.room_name.includes(searchKeyword)
      );
      setFilteredChatRooms(filtered);
      setShowToast(filtered.length === 0);

      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } else {
      setFilteredChatRooms([]);
      setShowToast(false);
    }
  };

  const handleDeleteRoom = (roomId) => {
    setRoomToDelete(roomId);
    setShowConfirmationModal(true);
  };

  const confirmDeleteRoom = () => {
    setShowConfirmationModal(false);
    axios
      .delete(`https://jachwi.site/api/deleteChatRoom/${roomToDelete}`)
      .then((response) => {
        setChatRooms(chatRooms.filter((room) => room.id !== roomToDelete));
      })
      .catch((error) => {
        console.error("채팅방 삭제에 실패했습니다.", error);
      });
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const closeSidebar = () => {
    setSidebarActive(false);
  };

  return (
    <div className="chat-component-container">
      <NavigationBar />
      <div className="left-container">
        <button className="make-chat-button" onClick={handleCreateRoom}>
          채팅방 만들기
        </button>
        <h1>내 채팅방</h1>
        <div className="myChatList">
          {userChatRooms.length > 0 ? (
            <ul>
              {userChatRooms.map((room) => (
                <li key={room.id} onClick={() => handleRoomClick(room.id)}>
                  {!room.description && (
                    <img
                      src={deliveryImg}
                      alt="Description available"
                      className="delivery-image"
                    />
                  )}
                  {room.room_name}
                </li>
              ))}
            </ul>
          ) : (
            <p>참여한 채팅방이 없습니다.</p>
          )}
        </div>
      </div>
      <div className="vertical-line"></div>
      <div className="right-container">
        <div className="chat-search-container">
          <div className="searchInput">
            <input
              type="text"
              placeholder="채팅방 이름을 검색하세요."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <img
            src={searchButton}
            className="searchButton"
            onClick={handleSearch}
            alt="Search"
          ></img>
        </div>
        {(searchKeyword.trim() === "" ? chatRooms : filteredChatRooms)
          .filter((room) => room.description)
          .map((room) => (
            <div key={room.id} className="card">
              <div className="card-header">
                <h3>{room.room_name}</h3>
                {username === room.username && (
                  <div className="delete-button-container">
                    <img
                      src={deleteImg}
                      alt="Description available"
                      className="delete-chat-button"
                      onClick={() => handleDeleteRoom(room.id)}
                    />
                  </div>
                )}
              </div>
              <p className="description">{room.description}</p>
              <p className="createdby">{room.username}</p>
              <div className="chat-low">
                <p className="createdat">
                  개설일 {formatDate(room.created_at)}
                </p>
                <div className="join-button-container">
                  <button
                    className="joinChatButton"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    채팅방 입장
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="mobile-chat">
        <div className="moblieFirstLow">
          <div className="mobile-mychat">
            <img
              src={toggleImg}
              alt="toggleImg"
              className="toggleMyChatButton"
              onClick={toggleSidebar}
            />
            <div className="mychat-text">내 채팅방</div>
          </div>
          <div
            className={`chatOverlay ${sidebarActive ? "chatactive" : ""}`}
            onClick={closeSidebar}
          ></div>
          <div className={`chatSidebar ${sidebarActive ? "chatactive" : ""}`}>
            <div className="myChatList">
              <h2>내 채팅방 목록</h2>
              <ul className="myChatListContent">
                {userChatRooms.map((room) => (
                  <li key={room.id} onClick={() => handleRoomClick(room.id)}>
                    {!room.description && (
                      <img
                        src={deliveryImg}
                        alt="Description available"
                        className="delivery-image"
                      />
                    )}
                    {room.room_name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className="make-chat-button" onClick={handleCreateRoom}>
            채팅방 만들기
          </button>
        </div>
        <div className="chat-search-container">
          <div className="searchInput">
            <input
              type="text"
              placeholder="채팅방 이름을 검색하세요."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <img
            src={searchButton}
            className="searchButton"
            onClick={handleSearch}
            alt="Search"
          ></img>
        </div>
        <div className="moblie-chat-list">
          <ul>
            {chatRooms
              .filter((room) => room.description)
              .map((room) => (
                <li key={room.id} className="card">
                  <div className="card-header">
                    <h3>{room.room_name}</h3>
                    {username === room.username && (
                      <div className="delete-button-container">
                        <img
                          src={deleteImg}
                          alt="Description available"
                          className="delete-chat-button"
                          onClick={() => handleDeleteRoom(room.id)}
                        />
                      </div>
                    )}
                  </div>
                  <p className="description">{room.description}</p>
                  <p className="createdby">{room.username}</p>
                  <div className="chat-low">
                    <p className="createdat">
                      개설일 {formatDate(room.created_at)}
                    </p>
                    <div className="join-button-container">
                      <button
                        className="joinChatButton"
                        onClick={() => handleJoinRoom(room.id)}
                      >
                        채팅방 입장
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <Toast message="해당 검색 결과가 없습니다." showToast={showToast} />
      {showConfirmationModal && (
        <ConfirmationModal
          onCancel={() => setShowConfirmationModal(false)}
          onConfirm={confirmDeleteRoom}
        />
      )}
    </div>
  );
};

export default ChatComponent;
