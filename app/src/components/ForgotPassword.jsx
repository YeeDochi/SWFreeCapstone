import React from "react";


function ForgotPassword(props) {
   
    return (
        <div>
            <p>아이디
            <input id="Id" placeholder="아이디를 입력하시오" /></p>
            <p>이름
            <input id="Name" placeholder="이름을 입력하시오" /></p>
            <p>기업 이름
            <input id="ComName" placeholder="기업 이름을입력하시오" /></p>
           <button id='fpassword'>비밀번호 찾기</button>
           
        </div>
    );
}

export default ForgotPassword;