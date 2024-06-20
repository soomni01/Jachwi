import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import PostItemboard from "../../../components/PostItemboard/PostItemboard";
import "./MyPageLikes.css";
import Toast from "../../../components/Toast/Toast";
import filledHeartIcon from "../../../assets/filled-heart.png";
import emptyHeartIcon from "../../../assets/empty-heart.png";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

const MyPageLikes = () => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user_id, setUser_id] = useState(null); // 세션에서 가져온 사용자 ID
  const [toastMessage, setToastMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(7); // 페이지당 표시할 게시글 수
  const navigate = useNavigate();

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
          console.log("사용자 ID:", data.user.username); // 변경된 user_id 값 확인
        }
      } catch (error) {
        console.error("세션에 오류가 발생했습니다.", error);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        if (!user_id) return; // 사용자 ID가 없으면 종료

        const response = await axios.post(
          "https://jachwi.site/api/liked-posts", // POST 요청으로 사용자 ID를 서버에 전송
          { user_id: user_id },
          {
            withCredentials: true,
          }
        );
        setLikedPosts(response.data.likedPosts);
        setLoading(false);
      } catch (error) {
        console.error("좋아요 게시글을 가져오는데 오류가 발생했습니다.", error);
        setLoading(false);
      }
    };

    if (user_id !== null) {
      fetchLikedPosts();
    }
    console.log(user_id);
  }, [user_id]); // user_id가 변경될 때마다 호출

  const handleLike = async (postId) => {
    try {
      if (!user_id) {
        console.error("오류가 발생했습니다.");
        return;
      }

      console.log("User ID:", user_id); // user_id 확인
      console.log("Post ID:", postId); // postId 확인

      const response = await axios.post(`https://jachwi.site/api/like`, {
        user_id: user_id,
        post_id: postId, // 클릭된 게시물의 post_id를 전달
      });
      if (response.data.success) {
        // 좋아요 취소 후 해당 게시물을 현재 목록에서 제거
        setLikedPosts((prevLikedPosts) =>
          prevLikedPosts.filter((post) => post.id !== postId)
        );
        // 토스트 메시지 설정
        setToastMessage("좋아요를 취소했습니다.");
        setTimeout(() => {
          setToastMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("좋아요 게시글에 오류가 발생했습니다.", error);
      console.log(user_id, postId); // 여기서 likedPosts가 아닌 user_id를 사용
    }
  };

  // 게시물의 좋아요 상태를 확인하는 함수
  const isPostLiked = (postId) => {
    return likedPosts.some((post) => post.id === postId);
  };

  // 페이지 변경 이벤트 핸들러
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // 페이지 변경 시 스크롤을 맨 위로 이동
  };

  const handleTitleClick = (postId) => {
    navigate(`/view/${postId}`);
  };

  // 날짜 형식을 변경하는 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString); // 문자열을 Date 객체로 변환
    const year = date.getFullYear(); // 연도
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월
    const day = String(date.getDate()).padStart(2, "0"); // 일
    return `${year}-${month}-${day}`; // 년-월-일 형식으로 반환
  };

  return (
    <div>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="mypagelikes-container">
        <div className="content">
          <h2 className="text-like">내가 좋아요한 게시물</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="like-list">
                {likedPosts
                  .slice(
                    (currentPage - 1) * postsPerPage,
                    currentPage * postsPerPage
                  )
                  .map((post) => (
                    <PostItemboard
                      key={post.id}
                      title={post.title}
                      created_at={post.created_at}
                      author={post.author}
                      onClick={() => handleTitleClick(post.id)}
                      showAuthor={true}
                      showContent={false}
                      showLikeButton={true}
                      liked={isPostLiked(post.id)} // liked 상태 전달
                      toggleLike={() => handleLike(post.id)} // toggleLike 함수 전달
                    />
                  ))}
              </div>
              <table className="mypage-likes-table">
                <thead>
                  <tr>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                    <th>좋아요</th>
                  </tr>
                </thead>
                <tbody>
                  {likedPosts
                    .slice(
                      (currentPage - 1) * postsPerPage,
                      currentPage * postsPerPage
                    )
                    .map((post) => (
                      <tr key={post.id}>
                        <td onClick={() => handleTitleClick(post.id)}>
                          {post.title}
                        </td>
                        <td>{post.author}</td>
                        <td>{formatDate(post.created_at)}</td>{" "}
                        <td>
                          <img
                            src={
                              isPostLiked(post.id)
                                ? filledHeartIcon
                                : emptyHeartIcon
                            }
                            alt="Heart"
                            className="like-icon"
                            onClick={() => handleLike(post.id)}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="mypage-pagination-container">
                <div className="pagination">
                  <button
                    className="back"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <IoIosArrowBack />
                  </button>
                  {Array.from(
                    { length: Math.ceil(likedPosts.length / postsPerPage) },
                    (_, i) => i + 1
                  ).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={currentPage === number ? "active" : ""}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    className="forward"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage ===
                      Math.ceil(likedPosts.length / postsPerPage)
                    }
                  >
                    <IoIosArrowForward />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Toast message={toastMessage} showToast={toastMessage !== ""} />
    </div>
  );
};

export default MyPageLikes;
