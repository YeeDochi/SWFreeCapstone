import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Header.css';
import { useAuth } from './AuthContext.jsx'
import userIcon from '../img/user.png';;

const Header = (props) => {

  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, username, setUsername } = useAuth();


  const checkLoginStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user-info', {
        withCredentials: true,
      });
      if (response.data.user_id) {
        setIsLoggedIn(true);
        setUsername(response.data.username); // 서버에서 받은 이름 설정
      } else {
        setIsLoggedIn(false);
        setUsername('');
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/logout', {}, { withCredentials: true });
      if (response.data.status === 'success') {
        alert(response.data.message);
  
        // 로그아웃 후 상태를 수동으로 업데이트
        setIsLoggedIn(false);
        setUsername('');
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('로그아웃 실패:', error.message);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, [isLoggedIn]);

  return (
    <header id="header" className={props.attr} role="heading" aria-level="1">
      <div className="header__inner container">
        <div className="header_logo">
          <Link to="/">PickMiji</Link>
        </div>
        <div className="header__nav" role="navigation">
          <ul className="main_ul">
            <li>
              <Link to="/text">메세지</Link>
            </li>
            <li>
              <Link to="/address">주소록</Link>
            </li>
          </ul>
        </div>
        <div className="header_login">
          {isLoggedIn ? (
            <>
              <span>{username}님</span>
              <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login">로그인</Link>
              <img src={userIcon} alt="User" style={{ marginRight: '10px', width: '20px', height: '20px' }} />

              <Link to="/join" style={{ marginLeft: '10px' }}>회원가입</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;