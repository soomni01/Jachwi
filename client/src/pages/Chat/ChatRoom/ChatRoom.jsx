import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./ChatRoom.css";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import axios from "axios";
import userImage from "../../../assets/user.png";
import deliveryImg from "../../../assets/delivery2.png";
import chatListImg from "../../../assets/my-chat.png";
import hamburgerbar from "../../../assets/hamburgerbar.png";
import sendImg from "../../../assets/transfer.png";

const ChatRoom = () => {
  const { roomId } = useParams();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [username, setUsername] = useState("");
  const messageContainerRef = useRef(null);
  const [userChatRooms, setUserChatRooms] = useState([]);
  const navigate = useNavigate();
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [roomUsers, setRoomUsers] = useState([]);
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userSidebarActive, setUserSidebarActive] = useState(false);

  useEffect(() => {
    // 채팅방에 들어갈 때마다 해당 채팅방의 ID를 얻어와서 소켓 연결 설정
    const newSocket = io(`https://jachwi.site`, {
      query: { roomId },
    });
    setSocket(newSocket);

    return () => {
      // 컴포넌트가 언마운트되면 소켓 연결을 정리(clean up)
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    // 서버로부터 세션 정보를 가져와서 username 설정
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
    fetchUserChatRooms(username);
    fetchRoomUsers(roomId);
  }, [username, roomId]);

  useEffect(() => {
    // 서버로부터 메시지를 수신하면 새로운 메시지를 추가
    if (socket) {
      socket.on("message", (message) => {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages, message];
          return addDateDividers(newMessages);
        });
      });
    }

    return () => {
      // 이펙트 정리(clean up)
      if (socket) {
        socket.off("message");
      }
    };
  }, [socket]);

  // 서버로부터 채팅 내용을 받아 state를 업데이트
  useEffect(() => {
    if (socket) {
      socket.on("chatMessages", (messages) => {
        const messagesWithDividers = addDateDividers(messages);
        setMessages(messagesWithDividers);
      });
    }

    return () => {
      if (socket) {
        socket.off("chatMessages");
      }
    };
  }, [socket]);

  const addDateDividers = (messages) => {
    const newMessages = [];
    let lastMessageDate = "";

    messages.forEach((msg) => {
      // 날짜를 올바르게 파싱할 수 있는지 확인
      const currentDate = new Date(msg.created_at);
      if (isNaN(currentDate.getTime())) {
        console.error("유효하지 않은 날짜입니다:", msg.created_at);
        return; // 유효하지 않은 날짜이면 건너뜁니다.
      }

      const currentMessageDate = currentDate.toLocaleDateString();
      if (currentMessageDate !== lastMessageDate) {
        newMessages.push({
          id: `date-divider-${currentMessageDate}`,
          dateDivider: true,
          date: currentMessageDate,
        });
        lastMessageDate = currentMessageDate;
      }
      newMessages.push(msg);
    });

    return newMessages;
  };

  const handleMessageSend = () => {
    if (messageInput.trim() === "") return;
    // 입력된 메시지를 서버로 전송
    if (socket) {
      socket.emit("sendMessage", { username, message: messageInput });
      setMessageInput(""); // 입력 창 비우기
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleMessageSend();
    }
  };

  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const fetchUserChatRooms = (username) => {
    axios
      .get(`https://jachwi.site/api/getUserChatRoom?userId=${username}`)
      .then((response) => {
        const responseData = response.data;
        console.log("서버 응답 확인:", responseData); // 서버 응답 확인
        if (responseData.success) {
          const userRooms = responseData.userChatRooms;
          setUserChatRooms(userRooms); // 사용자가 참여한 채팅방 목록 설정

          // 현재 입장한 채팅방의 이름 찾기
          const currentRoom = userRooms.find(
            (room) => room.id === parseInt(roomId)
          );
          if (currentRoom) {
            setCurrentRoomName(currentRoom.room_name); // 현재 채팅방 이름 설정
            console.log(currentRoom.room_name);
          } else {
            console.error("현재 채팅방을 찾을 수 없습니다.");
          }
        } else {
          console.error("서버 응답에 실패했습니다:", responseData.message);
        }
      })
      .catch((error) => {
        console.error(
          "사용자가 참여한 채팅방을 가져오는데 실패했습니다.",
          error
        );
      });
  };

  const fetchRoomUsers = (roomId) => {
    axios
      .get(`https://jachwi.site/api/roomUsers?roomId=${roomId}`)
      .then((response) => {
        const responseData = response.data;
        console.log("서버 응답 확인:", responseData); // 서버 응답 확인
        if (responseData.success) {
          setRoomUsers(responseData.roomUsers); // 채팅방 사용자 목록 설정
        } else {
          console.error("서버 응답에 실패했습니다:", responseData.message);
        }
      })
      .catch((error) => {
        console.error("채팅방 사용자를 가져오는데 실패했습니다.", error);
      });
  };

  const handleLeaveChatRoom = () => {
    // API 요청을 보내어 사용자가 채팅방을 나감을 알림
    axios
      .post("https://jachwi.site/api/leaveChatRoom", {
        userId: username,
        roomId: roomId,
      })
      .then((response) => {
        if (response.data.success) {
          navigate("/chat");
          console.log("Successfully left the chat room.");
        } else {
          console.error("Failed to leave chat room:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error leaving chat room:", error);
      });
  };

  const handleRoomClick = (roomId) => {
    navigate(`/chatRoom/${roomId}`);
  };
  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const closeSidebar = () => {
    setSidebarActive(false);
  };
  const toggleUserSidebar = () => {
    setUserSidebarActive(!userSidebarActive);
  };

  const closeUserSidebar = () => {
    setUserSidebarActive(false);
  };

  return (
    <>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="chat-room">
        <div className="mobile-chatroom">
          {" "}
          <div className="chatroom-information">
            <img
              src={chatListImg}
              alt="toggleImg"
              className="ChatListButton"
              onClick={toggleSidebar}
            />
            <div className="chatroom-name">{currentRoomName}</div>
            <img
              src={hamburgerbar}
              alt="hamburgerbar"
              className="hamburgerButton"
              onClick={toggleUserSidebar}
            />
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
                        oncl
                      />
                    )}
                    {room.room_name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className={`chatUserOverlay ${
              userSidebarActive ? "chatactive" : ""
            }`}
            onClick={closeUserSidebar}
          ></div>
          <div
            className={`chatUserSidebar ${
              userSidebarActive ? "chatactive" : ""
            }`}
          >
            <div className="mobile-right-chatroom-users">
              <h2>참가한 사용자</h2>
              {roomUsers && roomUsers.length > 0 ? (
                <ul className="mobile-chatroom-users">
                  {roomUsers.map((user) => (
                    <li key={user.user_id}>
                      <img
                        src={userImage}
                        alt="userImage"
                        className="userImage"
                      />{" "}
                      {user.user_id}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>참여한 채팅방이 없습니다.</p>
              )}
              <button
                className="mobile-leave-chat-button"
                onClick={handleLeaveChatRoom}
              >
                채팅방 나가기
              </button>
            </div>
          </div>
        </div>
        <div className="left-chatroom">
          <div className="chatList">{currentRoomName}</div>
          <button className="leave-chat-button" onClick={handleLeaveChatRoom}>
            채팅방 나가기
          </button>
          <hr className="horizontal-line"></hr>
          <h2>내 채팅방</h2>
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

        <div className="chatroom-vertical-line"></div>
        <div className="right-chatroom">
          <div className="message-container" ref={messageContainerRef}>
            {/* 채팅 메시지 표시 */}
            {messages &&
              messages.length > 0 &&
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    msg.dateDivider
                      ? "date-divider"
                      : msg.username === username
                      ? "my-message-container"
                      : "other-message-container"
                  }
                >
                  {msg.dateDivider ? (
                    <div className="date-divider-label">{msg.date}</div>
                  ) : (
                    <>
                      <div className="message-username">
                        {msg.username === username ? "나" : msg.username}
                      </div>
                      <div
                        className={
                          msg.username === username
                            ? "my-message"
                            : "other-message"
                        }
                      >
                        <span className="message-content">{msg.message}</span>
                        <span className="message-timestamp">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="sendButton" onClick={handleMessageSend}>
              전송
            </button>
            <img
              src={sendImg}
              alt="sendImgButton"
              className="sendImgButton"
              onClick={handleMessageSend}
            />
          </div>
        </div>
        <div className="right-chatroom-users">
          <h2>참가한 사용자</h2>
          {roomUsers && roomUsers.length > 0 ? (
            <ul>
              {roomUsers.map((user) => (
                <li key={user.user_id}>
                  <img src={userImage} alt="userImage" className="userImage" />{" "}
                  {user.user_id}
                </li>
              ))}
            </ul>
          ) : (
            <p>참여한 채팅방이 없습니다.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
