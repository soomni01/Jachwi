import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import "./List.css";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import Toast from "../../../components/Toast/Toast";
import searchButton from "../../../assets/search-button.png";
import { boardOptions } from "../../../components/Options";

const List = () => {
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(
    window.innerWidth <= 400 ? 6 : 10
  );
  const [searchKeyword, setSearchKeyword] = useState(""); // 검색어 상태 변수 추가
  const [filteredPosts, setFilteredPosts] = useState([]); // 필터링된 게시글 목록 상태 변수 추가
  const [showToast, setShowToast] = useState(false); // 토스트 메시지 상태 변수 추가
  const navigate = useNavigate();
  const [boardCategory, setBoardCategory] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 400);
  const [maxPageButtons, setMaxPageButtons] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 400;
      setIsMobile(mobile);
      setPostsPerPage(mobile ? 6 : 10); // 모바일에서는 5, PC에서는 10
      setMaxPageButtons(mobile ? 6 : 10);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // 서버에서 게시글 목록 가져오는 요청
    axios
      .get("https://jachwi.site/api/getPost")
      .then((response) => {
        setList(response.data.posts);
      })
      .catch((error) => {
        console.error("게시글을 가져오는데 실패했습니다.", error);
      });
  }, []);

  // 현재 페이지의 게시글 범위 계산
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  // 검색 버튼 클릭 이벤트 핸들러
  const handleSearch = () => {
    if (searchKeyword.trim() !== "") {
      // 검색어가 입력된 경우에만 필터링
      const filtered = list.filter((post) =>
        post.title.includes(searchKeyword)
      );
      setFilteredPosts(filtered);
      setCurrentPage(1); // 검색 시 첫 페이지로 이동

      if (filtered.length === 0) {
        // 검색 결과가 없는 경우 토스트 메시지 표시
        setShowToast(true);

        // 일정 시간 후에 토스트 메시지 숨기기
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } else {
        setShowToast(false);
      }
    } else {
      // 검색어가 입력되지 않은 경우 전체 게시글을 보여줌
      setFilteredPosts([]);
      setShowToast(false);
    }
  };

  // 카테고리 클릭 이벤트 핸들러
  const handleCategoryClick = (category) => {
    setBoardCategory(category);
    if (category) {
      const filtered = list.filter((post) => post.category === category);
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts([]);
    }
    setCurrentPage(1); // 카테고리 클릭 시 첫 페이지로 이동
  };

  // 현재 페이지의 필터링된 게시글 가져오기
  const currentPosts =
    filteredPosts.length > 0
      ? filteredPosts.slice(indexOfFirstPost, indexOfLastPost)
      : list.slice(indexOfFirstPost, indexOfLastPost);

  // 총 페이지 수 계산
  const totalPosts =
    filteredPosts.length > 0 ? filteredPosts.length : list.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // 페이지 변경 이벤트 핸들러
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // 페이지 변경 시 스크롤을 맨 위로 이동
  };

  const handleTitleClick = (postId) => {
    navigate(`/view/${postId}`);
  };

  const handleBoardCategoryChange = (e) => {
    setBoardCategory(e.target.value);
    handleCategoryClick(e.target.value);
  };

  return (
    <>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="boardTitle">
        <p>자유게시판</p>

        <div className="search-container">
          <div className="searchInput">
            <input
              type="text"
              placeholder="검색어를 입력하세요."
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
      </div>

      {isMobile && (
        <div className="mobile-controls">
          <div className="list-category-select">
            <label className="category-text" htmlFor="category">
              게시글 카테고리{" "}
            </label>
            <select
              className="board-category-dropdown1"
              id="category"
              value={boardCategory}
              onChange={handleBoardCategoryChange}
            >
              {boardOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="button-container">
            <button className="write-button" onClick={() => navigate("/write")}>
              글작성
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>글번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.map((item, index) => (
              <tr key={item.id}>
                <td>{indexOfFirstPost + index + 1}</td>
                <td>
                  <span
                    className="board_category"
                    onClick={() => handleCategoryClick(item.category)}
                  >
                    [{item.category}]
                  </span>
                  <span
                    className="title"
                    onClick={() => handleTitleClick(item.id)}
                  >
                    {item.title}
                  </span>
                </td>
                <td>{item.author}</td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="list-container">
        {currentPosts.map((item, index) => (
          <div className="list-item" key={item.id}>
            <div className="list-item-header">
              <span
                className="board_category"
                onClick={() => handleCategoryClick(item.category)}
              >
                [{item.category}]
              </span>
              <span className="title" onClick={() => handleTitleClick(item.id)}>
                {item.title}
              </span>
            </div>
            <div className="list-item-body">
              <span className="list-author">{item.author}</span>|
              <span className="list-date">{item.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-container">
        {!isMobile && (
          <div className="list-category-select">
            <label className="category-text" htmlFor="category">
              게시글 카테고리{" "}
            </label>
            <select
              className="board-category-dropdown1"
              id="category"
              value={boardCategory}
              onChange={handleBoardCategoryChange}
            >
              {boardOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="pagination-container">
          <div className="pagination">
            <button
              className="back"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <IoIosArrowBack />
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="forward"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <IoIosArrowForward />
            </button>
          </div>
        </div>

        {!isMobile && (
          <div className="button-container">
            <button className="write-button" onClick={() => navigate("/write")}>
              글작성
            </button>
          </div>
        )}
      </div>

      <Toast message="해당 검색 결과가 없습니다." showToast={showToast} />
    </>
  );
};

export default List;
