import React from 'react';
import {Link} from 'react-router-dom'
import '../css/Header.css';
import userIcon from '../img/user.png';

const Header = (props) => {
  return (
    <header id="header" className={props.attr} role="heading" aria-level="1">
      <div className="header__inner container">
        <div className="header_logo">
      <Link to="/">
      PickMiji
          </Link>
          </div>
         
        <div className="header__nav" role="navigation">
          <ul className='main_ul'>
            <li>
              <Link to="/text">메세지</Link>
            </li>
             
            <li>
              <Link to="/address">주소록</Link>
            </li>
            </ul>
        </div>
        <div className="header_login">
              <Link to="/login">로그인
              <img src={userIcon} alt="User" style={{ marginLeft: '5px', width: '20px', height: '20px' }} />
              </Link>
              
              <Link to="/join">회원가입</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

