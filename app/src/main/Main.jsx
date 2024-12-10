import React from "react";
import { Link,useNavigate } from "react-router-dom";
import '../css/Main.css';
import mainIcon from '../img/MainIcon.png';

function Main(props) {
    const navigate = useNavigate();
    return (
        <div className="MainBoard">
            <div className="MainContents"><img src={mainIcon} alt="MainIcon"  />
            <label>간편하고 유용한 메세지전송</label>
            <label>픽미지에서 함께 하세요</label></div>
          
                
            
            <div className="MainButton">
            <button id='start' onClick={() => navigate("/Text")}>시작하기</button>
            </div>
           
        </div>
    );
}

export default Main;
