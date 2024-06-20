import "./App.css";
import React, { useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import SignUp from "./pages/Login/SignUp";
import FindPw from "./pages/Login/FindPw";
import Main from "./pages/Main/Main";
import List from "./pages/board/List/List";
import Modify from "./pages/board/Modify/Modify";
import View from "./pages/board/View/View";
import Write from "./pages/board/Write/Write";
import MyPage from "./pages/MyPage//MyPage/MyPage";
import MyPagePosts from "./pages/MyPage/MyPagePosts/MyPagePosts";
import MyPageLikes from "./pages/MyPage/MyPageLikes/MyPageLikes";
import MyPageWithdraw from "./pages/MyPage/MyPageWithdraw/MyPageWithdraw";
import MyPageChangePw from "./pages/MyPage/MyPageChangePw/MyPageChangePw";
import DeliveryList from "./pages/Delivery/DeliveryList/DeliveryList";
import DeliveryPost from "./pages/Delivery/DeliveryPost/DeliveryPost";
import DeliveryView from "./pages/Delivery/DeliveryView/DeliveryView";
import DeliveryEdit from "./pages/Delivery/DeliveryEdit/DeliveryEdit";
import RoomComponent from "./pages/Chat/RoomComponent/RoomComponent";
import Chatroom from "./pages/Chat/ChatRoom/ChatRoom";
import Chat from "./pages/Chat/Chat/Chat";

function App() {
  const [list, setList] = useState([]);
  const idRef = useRef(1);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/findpw" element={<FindPw />} />
        <Route path="/main" element={<Main />} />
        <Route path="/deliverylist" element={<DeliveryList />} />
        <Route path="/deliverypost" element={<DeliveryPost />} />
        <Route path="/deliveryview/:post_id" element={<DeliveryView />} />
        <Route path="edit/:post_id" element={<DeliveryEdit />} />
        <Route path="/list" element={<List list={list} />} />
        <Route
          path="/view/:id"
          element={<View list={list} setList={setList} />}
        />
        <Route
          path="/modify/:id"
          element={<Modify list={list} setList={setList} />}
        />
        <Route
          path="/write"
          element={<Write list={list} setList={setList} idRef={idRef} />}
        />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypageposts" element={<MyPagePosts />} />
        <Route path="/mypagelikes" element={<MyPageLikes />} />
        <Route path="/mypagewithdraw" element={<MyPageWithdraw />} />
        <Route path="/mypagechangepw" element={<MyPageChangePw />} />
        <Route path="/room" element={<RoomComponent />} />
        <Route path="/chatroom/:roomId" element={<Chatroom />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
