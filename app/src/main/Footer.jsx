import React from 'react';
import {Link} from 'react-router-dom'
import '../css/footer.css'; 


const Footer = (props) => {
  return (
    <footer id="footer" role="contentinfo" className={props.attr}>
      <div className="footer__inner container">
        <div className="footer__text">
          <h5>PICKMIJI</h5>
          <p>
            SWPreCapstone 
           
          </p>
          
        </div>
        <div className="footer__menu">
          <div>
            <h4>팀원</h4>
            <span>황하성</span>
            <span>이종환</span>
            <span>정다빈</span>
            <span>한승수</span>
            <span>권유진</span>
            
          </div>
        
          
        </div>
        <div className="footer__right">
          Copyright 2024. All Rights Reserved. - Designed by JEOUNGDABIN,HW
        </div>
      </div>
    </footer>
  );
};

export default Footer;