import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import PostItemboard from "../../../components/PostItemboard/PostItemboard";
import "./MyPagePosts.css";
import axios from "axios";

import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

const MyPagePosts = () => {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user_id, setUser_id] = useState(null); // 세션에서 가져온 사용자 ID

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(5); // 페이지당 표시할 게시글 수
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
          console.log("User ID:", data.user.username); // 변경된 user_id 값 확인
        }
      } catch (error) {
        console.error("세션에 오류가 발생했습니다.", error);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        if (!user_id) return; // 사용자 ID가 없으면 종료

        const response = await axios.post(
          "https://jachwi.site/api/my-posts", // POST 요청으로 사용자 ID를 서버에 전송
          { user_id: user_id },
          {
            withCredentials: true,
          }
        );

        // 작성일에서 날짜만 추출하여 포맷팅
        const formattedPosts = response.data.myPosts.map((post) => {
          const date = new Date(post.created_at);
          const formattedDate = `${date.getFullYear()}-${
            date.getMonth() + 1
          }-${date.getDate()}`;
          return { ...post, created_at: formattedDate };
        });

        // 최신글이 맨 위로 오도록 정렬
        formattedPosts.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setMyPosts(formattedPosts);
        setLoading(false);
      } catch (error) {
        console.error("작성한 게시글을 가져오는데 오류가 발생했습니다.", error);
        setLoading(false);
      }
    };

    if (user_id !== null) {
      fetchMyPosts();
    }
    console.log(user_id);
  }, [user_id]); // user_id가 변경될 때마다 호출

  useEffect(() => {
    // 모바일 화면인 경우 페이지당 게시글 수를 늘림
    if (window.innerWidth < 904) {
      if (myPosts.length > 0) {
        setPostsPerPage(myPosts.length); // 사용자가 작성한 게시글 수로 설정
      }
    } else {
      setPostsPerPage(5); // 모바일 이외에서는 5개씩 표시
    }
  }, [myPosts]); // myPosts가 변경될 때마다 useEffect가 호출되도록 배열에 추가

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

  // 작성 내용을 최대 30자까지만 반환하는 함수
  const truncateContent = (content) => {
    return content.length > 30 ? content.substring(0, 30) + "..." : content;
  };

  return (
    <div>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="mypageposts-container">
        <div className="content">
          <h2 className="text-post">내가 작성한 게시물</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="post-list">
                {myPosts
                  .slice(
                    (currentPage - 1) * postsPerPage,
                    currentPage * postsPerPage
                  )
                  .map((post) => (
                    <PostItemboard
                      key={post.id}
                      title={post.title}
                      content={post.content}
                      created_at={post.created_at}
                      onTitleClick={() => handleTitleClick(post.id)}
                      showContent={true}
                      showAuthor={false}
                      showLikeButton={false}
                    />
                  ))}
              </div>
              <table className="mypage-posts-table">
                <thead>
                  <tr>
                    <th>제목</th>
                    <th>내용</th>
                    <th>작성일</th>
                  </tr>
                </thead>
                <tbody>
                  {myPosts
                    .slice(
                      (currentPage - 1) * postsPerPage,
                      currentPage * postsPerPage
                    )
                    .map((post) => (
                      <tr key={post.id}>
                        <td onClick={() => handleTitleClick(post.id)}>
                          {post.title}
                        </td>
                        <td>{truncateContent(post.content)}</td>
                        <td>{formatDate(post.created_at)}</td>{" "}
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
                    { length: Math.ceil(myPosts.length / postsPerPage) },
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
                      currentPage === Math.ceil(myPosts.length / postsPerPage)
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
    </div>
  );
};

export default MyPagePosts;
