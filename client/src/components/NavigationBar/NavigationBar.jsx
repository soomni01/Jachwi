import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./NavigationBar.css";
import mypageImage from "../../assets/mypage.png";
import logoutImage from "../../assets/logout.png";

const NavigationBar = () => {
  //const [isFirstRender, setIsFirstRender] = useState(true);
  //const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    setActiveMenu(null);
    navigate("/main");
  };

  const handleMyPageClick = () => {
    navigate("/mypage");
  };

  const handleDeliveryClick = () => {
    setActiveMenu("delivery");
    navigate("/deliverylist");
  };
  const handleBoardClick = () => {
    setActiveMenu("board");
    navigate("/list");
  };

  const handleChatClick = () => {
    setActiveMenu("chat");
    navigate("/chat");
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://jachwi.site/api/logout",
        {},
        { withCredentials: true }
      );
      //setIsLogin(false);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("로그아웃에 실패하였습니다:", error);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get("https://jachwi.site/api/session", {
          withCredentials: true,
        });
        if (response.data.user) {
          // setIsLogin(true);
          setUser({
            username: response.data.user.username,
            email: response.data.user.email,
          });
        }
      } catch (error) {
        console.error("세션 정보를 가져오는데 실패하였습니다:", error);
      } finally {
        // setIsFirstRender(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (
      location.pathname.includes("/list") ||
      location.pathname.includes("/view/") ||
      location.pathname.includes("/modify/") ||
      location.pathname.includes("/write")
    ) {
      setActiveMenu("board");
    } else if (
      location.pathname.includes("/chat") ||
      location.pathname.includes("/chatroom/") ||
      location.pathname.includes("/room")
    ) {
      setActiveMenu("chat");
    } else if (
      location.pathname.includes("/deliverylist") ||
      location.pathname.includes("/deliverypost") ||
      location.pathname.includes("/deliveryview/") ||
      location.pathname.includes("/edit/")
    ) {
      setActiveMenu("delivery");
    }
  }, [location.pathname]);

  const getMenuStyle = (menuName) => ({
    color: activeMenu === menuName ? "black" : "gray",
  });

  return (
    <div className="navbar">
      <nav>
        <div className="logo" onClick={handleLogoClick}>
          자취 어때
        </div>
        <div className="spacer"></div>
        <div className="navbarMenu">
          <div
            className="navbarmenu"
            style={getMenuStyle("delivery")}
            onClick={handleDeliveryClick}
          >
            공동 배달
          </div>
          <div
            className="navbarmenu"
            style={getMenuStyle("board")}
            onClick={handleBoardClick}
          >
            게시판
          </div>
          <div
            className="navbarmenu"
            onClick={handleChatClick}
            style={getMenuStyle("chat")}
          >
            채팅방
          </div>
        </div>
        <div className="spacer"></div>
        <div className="mypage" onClick={handleMyPageClick}>
          마이페이지
        </div>
        <div className="navbar-divider"></div>
        {user ? (
          <div className="logout" onClick={handleLogout}>
            로그아웃
          </div>
        ) : (
          <div className="toLogin">
            <Link to="/">로그인이 필요합니다</Link>
          </div>
        )}
        <img
          src={mypageImage}
          className="mypageImage"
          alt="mypage"
          onClick={handleMyPageClick}
        />
        <img
          src={logoutImage}
          className="logoutImage"
          alt="logout"
          onClick={handleLogout}
        />
      </nav>
    </div>
  );
};

export default NavigationBar;
