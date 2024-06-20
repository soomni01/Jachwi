import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import "./Modify.css";
import { boardOptions } from "../../../components/Options";

const Modify = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [inputs, setInputs] = useState({
    title: "",
    content: "",
    category: "",
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `https://jachwi.site/api/view/${id}`
        );
        const postData = response.data.post;
        setPost(postData);
        setInputs({
          title: postData.title,
          content: postData.content,
          category: postData.category,
        });
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [id]);

  const onModify = async () => {
    try {
      if (
        inputs.title.trim().length === 0 ||
        inputs.content.trim().length === 0
      ) {
        alert("제목과 내용을 모두 입력해주세요.");
        return;
      }

      // 로그 추가: 함수가 호출되는지 확인
      console.log("Modify button clicked");

      await modifyPost(id, inputs);

      // 로그 추가: 수정 완료 메시지 확인
      console.log("수정 완료");

      // 네비게이션 이동 전에 대상 경로 확인
      const targetPath = `/view/${id}`;
      console.log("Target path:", targetPath);

      // 네비게이션 호출
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error("Error modifying post:", error);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const modifyPost = async (id, postData) => {
    try {
      const response = await axios.put(
        `https://jachwi.site/api/modify/${id}`,
        postData
      );
      return response.data;
    } catch (error) {
      console.error("Error modifying post:", error);
      throw error;
    }
  };

  return (
    <>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="modify-container">
        <h2>게시글 수정</h2>
        {post ? (
          <form>
            <div className="board-category-select">
              <label className="board-category-text" htmlFor="category">
                게시글 카테고리{" "}
              </label>
              <select
                className="board-category-dropdown"
                id="category"
                name="category" // 추가된 부분
                value={inputs.category} // 수정된 부분
                onChange={onChange} // 수정된 부분
              >
                {boardOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <ul>
              <li>
                <label htmlFor="title">제목</label>
                <input
                  className="input-text"
                  type="text"
                  name="title"
                  value={inputs.title}
                  onChange={onChange}
                />
              </li>
              <li>
                <label htmlFor="content">내용</label>
                <textarea
                  className="input-text"
                  name="content"
                  value={inputs.content}
                  onChange={onChange}
                />
              </li>
            </ul>
            <button type="button" className="modifyButton" onClick={onModify}>
              수정
            </button>
          </form>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
};

export default Modify;
