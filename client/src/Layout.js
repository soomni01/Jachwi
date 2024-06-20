import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <ul>
        <li>
          <Link to="/">홈</Link>
        </li>
        <li>
          <Link to="/list">게시판</Link>
        </li>
        <li>
          <Link to="/write">글쓰기</Link>
        </li>
      </ul>
      <Outlet />
    </>
  );
};

export default Layout;
