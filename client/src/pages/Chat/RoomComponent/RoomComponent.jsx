import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import "./RoomComponent.css";
import Toast from "../../../components/Toast/Toast";

const RoomComponent = () => {
  const navigate = useNavigate();
  const [roomTitle, setRoomTitle] = useState("");
  const [username, setUsername] = useState("");
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomDescription, setRoomDescription] = useState(""); // 새로운 상태 추가
  const [toastMessage, setToastMessage] = useState("");

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

  const handleCreateRoom = (event) => {
    event.preventDefault(); // 기본 동작 막기

    // 방 이름과 방 소개가 없는 경우 채팅방 생성하지 않음
    if (!roomTitle || !roomDescription) {
      alert("방 이름과 방 소개를 입력하세요.");
      return;
    }

    const socket = io("https://jachwi.site");
    socket.emit("createRoom", {
      title: roomTitle,
      description: roomDescription,
      username,
    });

    // 방이 성공적으로 생성되었을 때의 처리
    socket.on("roomCreated", ({ roomId }) => {
      console.log("새로운 방이 생성되었습니다. 방 ID:", roomId);
      setToastMessage("새로운 채팅방이 생성되었습니다.");
      setRoomCreated(true);
      navigate(`/chat`); // 방의 ID를 포함하여 채팅 페이지로 이동
    });
  };

  return (
    <>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div>
        <div className="chatcreateroom">
          <div className="chatroom_main">
            <h1>채팅방 생성</h1>
            <h3 style={{ color: "gray" }}>
              방 이름과 소개를 필수로 작성해주세요
            </h3>
            <div style={{ marginTop: "26px" }} />
            {!roomCreated && (
              <form className="chatroom_form">
                <div className="inputTag">
                  <input
                    className="input-text"
                    type="text"
                    placeholder="방 이름"
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                  />
                  <label htmlFor="input_id">
                    방 이름{" "}
                    <span style={{ paddingLeft: "5px", color: "red" }}>*</span>
                  </label>
                </div>

                <div style={{ marginTop: "26px" }} />

                <div className="inputTag2">
                  <input
                    className="input-text"
                    type="text"
                    placeholder="방에 대한 설명을 입력하세요"
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                  />
                  <label htmlFor="input_id">
                    방 소개{" "}
                    <span style={{ paddingLeft: "5px", color: "red" }}>*</span>
                  </label>
                </div>

                <div style={{ marginTop: "26px" }} />

                <button className="createRoomButton" onClick={handleCreateRoom}>
                  방 만들기
                </button>
              </form>
            )}
            {roomCreated && (
              <div>
                <p>채팅방이 만들어졌습니다!</p>
              </div>
            )}
          </div>
        </div>
        <Toast message={toastMessage} showToast={toastMessage !== ""} />
      </div>
    </>
  );
};

export default RoomComponent;
