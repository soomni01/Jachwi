import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Write.css"; // 수정된 파일명으로 변경
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import { boardOptions } from "../../../components/Options";

const Write = ({ list, setList, idRef }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [boardCategory, setBoardCategory] = useState("");

  useEffect(() => {
    // 서버에서 세션 정보를 가져와서 username을 설정합니다.
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

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://jachwi.site/api/write12", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          author: username,
          content,
          category: boardCategory,
        }), // 서버에서 시간을 처리하므로 author와 created_at을 전송하지 않음
      });

      if (!response.ok) {
        throw new Error("데이터베이스에 저장을 실패했습니다.");
      }

      const data = await response.json();
      console.log(data.message); // 서버로부터 받은 응답 메시지 출력

      // 저장에 성공했을 때 리스트를 업데이트
      setList([
        ...list,
        { title, author: username, content, category: boardCategory },
      ]);

      idRef.current = idRef.current + 1;

      navigate("/list");
    } catch (error) {
      console.error("오류가 발생했습니다.", error);
    }
  };

  const handleBoardCategoryChange = (e) => {
    setBoardCategory(e.target.value);
  };

  return (
    <>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="write-container">
        <h2>게시글 작성</h2>
        <div className="board-category-select">
          <label className="board-category-text" htmlFor="category">
            게시글 카테고리{" "}
          </label>
          <select
            className="board-category-dropdown"
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
        <form onSubmit={onSubmit}>
          <ul>
            <li>
              <label htmlFor="subject">제목</label>
              <input
                className="input-text"
                type="text"
                id="subject"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </li>
            <li>
              <label htmlFor="content">내용</label>
              <textarea
                className="input-text"
                type="text"
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </li>
          </ul>
          <button className="writeButton">작성</button>
        </form>
      </div>
    </>
  );
};

export default Write;
