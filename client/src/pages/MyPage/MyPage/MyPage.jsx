import React, { useState, useEffect } from "react";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import axios from "axios";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./MyPage.css";
import Toast from "../../../components/Toast/Toast";
import Popup from "../../../components/Popup/Popup";

const MyPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [updatedUsername, setUpdatedUsername] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [enroll_company, setEnroll_company] = useState({
    address: "",
  });
  const [selectedAddress, setSelectedAddress] = useState(""); // 시, 구, 동 상태 추가
  const [popupOpen, setPopupOpen] = useState(false);
  const [user_id, setUser_id] = useState(null);
  const [sessionFetched, setSessionFetched] = useState(false); // 세션 정보를 가져왔는지 여부 상태 추가

  useEffect(() => {
    fetchUserData();
    console.log(user_id);
  }, []);

  useEffect(() => {
    // 사용자 아이디가 변경될 때 로컬 스토리지에 저장
    if (user) {
      localStorage.setItem("username", user.username);
    }
  }, [user]);

  useEffect(() => {
    // 페이지가 로드될 때 사용자의 초기 위치 설정
    if (sessionFetched && user_id) {
      fetchUserAddress();
      console.log(user_id + "입니다");
    }
  }, [sessionFetched, user_id]);

  const fetchUserAddress = async () => {
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
      }
    } catch (error) {
      console.error("사용자 위치 가져오기 실패:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get("https://jachwi.site/api/session", {
        withCredentials: true,
      });
      if (response.data.user && response.data.user.email) {
        setUser({
          email: response.data.user.email,
          username: response.data.user.username,
        });
        setUser_id(response.data.user.username);
        setSessionFetched(true);
        // 로컬 스토리지에 저장된 아이디 가져오기
        const savedUsername = localStorage.getItem("username");
        setUpdatedUsername(savedUsername || response.data.user.username);
        setNewUsername(response.data.user.username); // 현재 아이디로 초기화
      } else {
        console.error("사용자 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("이메일 세션 정보를 찾을 수 없습니다.:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setNewUsername(e.target.value);
    setIsDuplicate(false); // 새로운 아이디 입력 시 중복 여부 초기화
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 아이디 중복 확인
      const isDuplicate = await checkDuplicateUsername(newUsername);
      if (isDuplicate) {
        setIsDuplicate(true);
        return;
      }

      // 서버로 새로운 아이디 정보를 보냄
      await axios.put(
        "https://jachwi.site/api/updateUsername",
        { username: newUsername },
        { withCredentials: true }
      );
      // 사용자 정보 갱신
      setUser({ ...user, username: newUsername });
      setUpdatedUsername(newUsername); // 업데이트된 아이디를 저장
      setIsEditing(false); // 수정 모드 종료
      localStorage.setItem("username", newUsername);
      // 사용자 아이디 변경 후 likes 테이블의 user_id 열 업데이트 요청
      await axios.put(
        "https://jachwi.site/api/updateLikesUserId",
        { newUsername },
        { withCredentials: true }
      );
      // 세션 정보를 다시 가져와서 업데이트
      await fetchUserData();
      setToastMessage("아이디를 변경했습니다.");
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    } catch (error) {
      console.error("아이디 정보를 업데이트할 수 없습니다:", error);
    }
  };

  // 아이디 중복 확인 함수
  const checkDuplicateUsername = async (username) => {
    try {
      const response = await axios.post(
        "https://jachwi.site/api/checkUsername",
        { username },
        { withCredentials: true }
      );
      return !response.data.available; // 서버에서 받은 응답에 따라 중복 여부 반환
    } catch (error) {
      console.error("아이디 중복 확인 오류:", error);
      return false;
    }
  };

  const handleSelectLocation = () => {
    setPopupOpen(true); // 팝업 열기
  };

  const handlePopupClose = () => {
    setPopupOpen(false); // 팝업 닫기
  };

  const handleComplete = async (data) => {
    let selectedAddress = "";

    // 지번 주소 사용
    if (data.addressType === "R" && data.jibunAddress !== "") {
      const addressArray = data.jibunAddress.split(" ");
      selectedAddress = `${addressArray[0]} ${addressArray[1]} ${addressArray[2]}`; // 지번 주소에서 동까지만 표시
    } else {
      const addressArray = data.roadAddress.split(" ");
      selectedAddress = `${addressArray[0]} ${addressArray[1]} ${addressArray[2]}`; // 도로명 주소에서 동까지만 표시
    }

    setEnroll_company({
      ...enroll_company,
      address: selectedAddress,
    });

    setSelectedAddress(selectedAddress);

    try {
      // 서버로 변경된 주소 정보를 보냄
      await axios.put(
        "https://jachwi.site/api/updateAddress",
        { username: user_id, address: selectedAddress },
        { withCredentials: true }
      );
      setToastMessage("주소가 변경되었습니다.");
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    } catch (error) {
      console.error("주소 정보를 업데이트할 수 없습니다:", error);
    }

    handlePopupClose(); // 팝업 닫기
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="mypage-container">
        <h1 className="mypage-text">내 정보</h1>
        <h4>주소를 변경하고 싶다면 주소 변경 버튼을 눌러주세요.</h4>
        <div className="email-label">
          <label htmlFor="email">이메일</label>
          {user && (
            <div className="email-box">
              <h2 className="user-email">{user.email}</h2>
            </div>
          )}
        </div>
        <div className="username-label">
          <label htmlFor="username">아이디</label>
          {user && (
            <div className="username-box">
              <h2 className="user-username">{user.username}</h2>
            </div>
          )}
        </div>
        {/* <div className="username-content">
            <div className="username-box">
              <div className="username-input">
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      id="username"
                      value={newUsername}
                      onChange={handleChange}
                      className="edit-input"
                      placeholder="새로운 아이디를 입력해주세요"
                      autoComplete="off"
                    />
                    {(isDuplicate || newUsername === updatedUsername) && (
                      <p>
                        {isDuplicate
                          ? "이미 사용 중인 아이디입니다."
                          : "현재 아이디와 동일합니다."}
                      </p>
                    )}
                  </form>
                ) : (
                  <h2 className="user-username">{user.username}</h2>
                )}
              </div>
            </div>
            {isEditing && (
              <button className="id-change-button" onClick={handleSubmit}>
                변경
              </button>
            )}
            {!isEditing && (
              <button className="id-edit-button" onClick={handleEdit}>
                수정
              </button>
            )}
          </div>
        </div> */}

        <div className="location-label">
          <label htmlFor="location">주소</label>
          <div className="location-content">
            <div className="location-box">
              <h2 className="user-location">{selectedAddress}</h2>
            </div>
            <button
              className="location-edit-button"
              onClick={handleSelectLocation}
            >
              주소 변경
            </button>
            <Popup
              open={popupOpen}
              onClose={handlePopupClose}
              onComplete={handleComplete}
            />
          </div>
        </div>
      </div>
      <Toast message={toastMessage} showToast={toastMessage !== ""} />
    </div>
  );
};
export default MyPage;
