import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import { GiHamburgerMenu } from "react-icons/gi";
import "./View.css";
import filledHeartIcon from "../../../assets/filled-heart.png";
import emptyHeartIcon from "../../../assets/empty-heart.png";
import Toast from "../../../components/Toast/Toast";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [recommentBoxVisibility, setRecommentBoxVisibility] = useState({});
  const [newRecomment, setNewRecomment] = useState({});
  const [recomments, setRecomments] = useState({});
  const [updatedCommentId, setUpdatedCommentId] = useState(null);
  const [updatedCommentContent, setUpdatedCommentContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // 현재 로그인한 사용자 정보를 가져오는 요청
    axios
      .get("https://jachwi.site/api/session", { withCredentials: true })
      .then((response) => {
        setCurrentUser(response.data.user);
        // 좋아요 상태를 불러오는 요청
        axios
          .post("https://jachwi.site/api/checkLiked", {
            user_id: response.data.user?.username, // currentUser가 설정된 후에 요청을 보냄
            post_id: id,
          })
          .then((response) => {
            setIsLiked(response.data.liked);
          })
          .catch((error) => {
            console.error(
              "좋아요 상태를 불러오는데 오류가 발생했습니다.",
              error
            );
          });
      })
      .catch((error) => {
        console.error("세션에 오류가 발생했습니다.", error);
      });
  }, [id]);

  useEffect(() => {
    axios
      .get(`https://jachwi.site/api/view/${id}`)
      .then((response) => {
        const postWithFormattedDate = {
          ...response.data.post,
          formattedDate: new Date(response.data.post.created_at)
            .toLocaleDateString("ko-KR")
            .replace(/\.$/, ""), //마지막에 위치한 점 제거
        };
        setPost(postWithFormattedDate);
      })
      .catch((error) => {
        console.error("게시글을 가져오는데 오류가 발생했습니다.", error);
      });

    axios
      .get(`https://jachwi.site/api/commentGet/${id}`)
      .then((response) => {
        setComments(response.data.comments);

        // 댓글에 대한 대댓글 가져오기
        response.data.comments.forEach((comment) => {
          axios
            .get(`https://jachwi.site/api/recommentGet/${comment.id}`)
            .then((recommentResponse) => {
              setRecomments((prevRecomments) => ({
                ...prevRecomments,
                [comment.id]: recommentResponse.data.recomments,
              }));
            })
            .catch((error) => {
              console.error("Error fetching recomments:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
      });
  }, [id]);

  const onEdit = () => {
    navigate(`/modify/${id}`);
  };

  const onDelete = async () => {
    try {
      await axios.delete(`https://jachwi.site/api/delete/${id}`);
      navigate("/list");
    } catch (error) {
      console.error("게시글을 삭제하는데 오류가 발생했습니다.", error);
    }
  };

  const onDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `https://jachwi.site/api/commentDelete/${commentId}`
      );
      // 댓글이 삭제된 후 댓글 목록을 업데이트
      updateComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const submitComment = async () => {
    try {
      await axios.post("https://jachwi.site/api/commentPost", {
        post_id: id,
        author: currentUser.username,
        content: newComment,
      });

      setNewComment(""); // 댓글 작성 후 입력창 초기화
      setToastMessage("댓글이 작성되었습니다.");

      window.location.reload();
    } catch (error) {
      console.error("댓글 작성에 실패했습니다.", error);
      setToastMessage("댓글 작성에 실패했습니다.");
    }
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const submitRecomment = async (parentId) => {
    try {
      await axios.post("https://jachwi.site/api/recommentPost", {
        post_id: id,
        parent_comment_id: parentId,
        author: currentUser.username,
        content: newRecomment[parentId], // 해당 댓글의 대댓글 내용 가져오기
      });
      setNewRecomment({ ...newRecomment, [parentId]: "" }); // 대댓글 작성 후 입력창 초기화
      setToastMessage("대댓글이 작성되었습니다.");
      // 대댓글이 작성된 후 해당 댓글의 대댓글 목록을 업데이트
      axios
        .get(`https://jachwi.site/api/recommentGet/${parentId}`)
        .then((response) => {
          setRecomments((prevRecomments) => ({
            ...prevRecomments,
            [parentId]: response.data.recomments,
          }));
        })
        .catch((error) => {
          console.error("Error fetching recomments:", error);
        });
    } catch (error) {
      console.error("Error posting recomment:", error);
      setToastMessage("대댓글 작성에 실패했습니다.");
    }
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const onDeleteRecomment = async (recommentId) => {
    try {
      await axios.delete(
        `https://jachwi.site/api/recommentDelete/${recommentId}`
      );
      // 대댓글이 삭제된 후 해당 대댓글을 화면에서 제거
      setRecomments((prevRecomments) => {
        const updatedRecomments = { ...prevRecomments };
        for (const key in updatedRecomments) {
          updatedRecomments[key] = updatedRecomments[key].filter(
            (recomment) => recomment.id !== recommentId
          );
        }
        return updatedRecomments;
      });
      setToastMessage("대댓글이 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting recomment:", error);
      setToastMessage("대댓글 삭제에 실패했습니다.");
    }
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const toggleRecommentBox = (commentId) => {
    setRecommentBoxVisibility((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  const updateComments = () => {
    axios
      .get(`https://jachwi.site/api/commentGet/${id}`)
      .then((response) => {
        setComments(response.data.comments);
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
      });
  };

  const onUpdateComment = async (commentId, updatedContent) => {
    try {
      await axios.put(`https://jachwi.site/api/commentUpdate/${commentId}`, {
        content: updatedContent,
      });
      setUpdatedCommentId(null);
      setUpdatedCommentContent("");
      setToastMessage("댓글이 수정되었습니다.");
      updateComments();
    } catch (error) {
      console.error("Error updating comment:", error);

      setToastMessage("댓글 수정이 실패했습니다.");
    }
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleLike = async () => {
    try {
      if (!currentUser) {
        console.error("Current user is not available.");
        return;
      }

      const response = await axios.post(`https://jachwi.site/api/like`, {
        user_id: currentUser.username,
        post_id: id,
      });
      if (response.data.success) {
        // 좋아요 토글 처리
        setIsLiked(!isLiked);

        // 좋아요 성공 시 화면 갱신을 위해 게시물 다시 불러오기
        await reloadPost();

        // 좋아요에 따라 토스트 메시지 설정
        if (isLiked) {
          setToastMessage("좋아요를 취소했습니다.");
          console.log("좋아요를 취소했습니다.");
        } else {
          setToastMessage("좋아요를 눌렀습니다.");
          console.log("좋아요를 눌렀습니다.");
          // 토스트 메시지가 보인 후에는 toastMessage를 초기화합니다.
          setTimeout(() => {
            setToastMessage("");
          }, 3000);
        }
      } else {
        console.error("좋아요에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const reloadPost = async () => {
    try {
      const response = await axios.get(`https://jachwi.site/api/view/${id}`);
      const postWithFormattedDate = {
        ...response.data.post,
        formattedDate: new Date(response.data.post.created_at)
          .toLocaleDateString("ko-KR")
          .replace(/\.$/, ""),
      };
      setPost(postWithFormattedDate);
    } catch (error) {
      console.error("Error reloading post:", error);
    }
  };

  return (
    <>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="view-container">
        {post ? (
          <div className="view">
            <h2 style={{ position: "relative" }}>
              <span className="board-view-category">[{post.category}]</span>
              {post.title}
              {currentUser &&
                currentUser.username === post.author && ( // 작성자와 현재 로그인한 사용자가 동일한 경우에만 수정, 삭제 버튼 표시
                  <div className="options-menu">
                    <GiHamburgerMenu
                      onClick={() => setShowOptions(!showOptions)}
                    />
                    {showOptions && (
                      <div className="options-popup">
                        <div className="edit-delete-buttons">
                          <button
                            className="edit-option-button"
                            onClick={onEdit}
                          >
                            수정
                          </button>
                          <hr className="options-divider" />
                          <button
                            className="delete-option-button"
                            onClick={onDelete}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </h2>

            <p className="author">작성자: {post.author}</p>
            <p className="date">작성일: {post.formattedDate}</p>
            <div className="content-container">
              <p className="text-content">{post.content}</p>
              {/* 조건부 렌더링을 통해 속이 채워진 하트 또는 빈 하트 표시 */}
              <div className="like-button">
                {isLiked ? (
                  <img
                    src={filledHeartIcon}
                    alt="Filled Heart"
                    className="like-button"
                    onClick={handleLike}
                  />
                ) : (
                  <img
                    src={emptyHeartIcon}
                    alt="Empty Heart"
                    className="like-button"
                    onClick={handleLike}
                  />
                )}
              </div>
            </div>
            <div className="comments-container">
              <h3>댓글</h3>
              <div className="comment-form">
                <textarea
                  placeholder="댓글을 입력하세요"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button className="comment-button" onClick={submitComment}>
                  작성
                </button>
              </div>
            </div>

            <div className="all-comments-container">
              {comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className="all-comment-container"
                  style={{
                    marginBottom:
                      index === comments.length - 1
                        ? 0
                        : `${comment.content.split("\n").length * 1}px`,
                  }}
                >
                  <div className="comment">
                    <div className="author-options">
                      <p className="comment-author">작성자: {comment.author}</p>
                      {/* 수정 및 삭제 버튼 */}
                      {currentUser &&
                        currentUser.username === comment.author && (
                          <div className="comment-options-buttons">
                            {/* 수정 버튼 */}
                            <button
                              className="edit-comment-button"
                              onClick={() => setUpdatedCommentId(comment.id)}
                            >
                              수정
                            </button>
                            {/* 삭제 버튼 */}
                            <button
                              className="delete-comment-button"
                              onClick={() => onDeleteComment(comment.id)}
                            >
                              삭제
                            </button>
                          </div>
                        )}
                    </div>
                    {/* 수정 버튼 클릭 시 해당 댓글 내용을 textarea에 표시 */}
                    {updatedCommentId === comment.id ? (
                      <div className="options-form">
                        <textarea
                          placeholder="댓글 수정"
                          value={updatedCommentContent || comment.content}
                          onChange={(e) =>
                            setUpdatedCommentContent(e.target.value)
                          }
                        ></textarea>
                        <button
                          className="edit-comment-confirm-button"
                          onClick={() =>
                            onUpdateComment(comment.id, updatedCommentContent)
                          }
                        >
                          수정
                        </button>
                      </div>
                    ) : (
                      <p className="comment-content">{comment.content}</p>
                    )}
                    {/* 수정 버튼 클릭 시 해당 댓글 내용을 textarea에 표시 */}

                    {/* 대댓글 기능 */}
                    <button
                      className="recomment-toggle-button"
                      onClick={() => toggleRecommentBox(comment.id)}
                    >
                      {recommentBoxVisibility[comment.id]
                        ? "답글 숨기기"
                        : "답글 보기"}
                    </button>

                    {recommentBoxVisibility[comment.id] && (
                      <div className="recomments-container">
                        {recomments[comment.id] &&
                          recomments[comment.id].map((recomment) => (
                            <div
                              key={recomment.id}
                              className="recomment-container"
                            >
                              <div className="recomment-content">
                                <div className="recomment-info">
                                  <p className="recomment-author">
                                    작성자: {recomment.author}
                                  </p>
                                  {currentUser &&
                                    currentUser.username ===
                                      recomment.author && (
                                      <button
                                        className="delete-recomment-button"
                                        onClick={() =>
                                          onDeleteRecomment(recomment.id)
                                        }
                                      >
                                        삭제
                                      </button>
                                    )}
                                </div>
                                <p className="recomment-comment">
                                  {recomment.content}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {recommentBoxVisibility[comment.id] && (
                      <div className="recomment-textarea">
                        <textarea
                          placeholder="대댓글을 입력하세요"
                          value={newRecomment[comment.id] || ""}
                          onChange={(e) =>
                            setNewRecomment({
                              ...newRecomment,
                              [comment.id]: e.target.value,
                            })
                          }
                        ></textarea>
                        <button
                          className="recomment-button"
                          onClick={() => submitRecomment(comment.id)}
                        >
                          답글
                        </button>
                      </div>
                    )}
                    {/* 대댓글 기능 */}
                  </div>
                  {index !== comments.length - 1 && (
                    <hr className="comment-divider" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        <Toast message={toastMessage} showToast={toastMessage !== ""} />
      </div>
    </>
  );
};

export default View;
