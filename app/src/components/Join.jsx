import React, { useState } from "react";
import axios from "axios";
import '../css/Join.css';
import { useNavigate } from "react-router-dom"; 

function Join(props) {
    const [user_id, setUser_id] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [businessNumber, setBusinessNumber] = useState('');
    const [useridCheck, setUserIdCheck] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    // 아이디 중복 체크
    const handleUsernameCheck = () => {
        axios.post('http://127.0.0.1:8080/api/check-username', { user_id })
            .then(response => {
                const { message } = response.data;
                setUserIdCheck(message);  // 중복 체크 결과를 useridCheck 상태에 저장
            })
            .catch(error => {
                console.error('중복 체크 오류:', error);
                setUserIdCheck('중복 체크 중 오류가 발생했습니다.');
            });
    };

    const isValidPassword = (password) => {
        const lengthCheck = password.length >= 6;
        const complexityCheck = /[A-Za-z]/.test(password) && /\d/.test(password) || /[A-Za-z]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password) || /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return lengthCheck && complexityCheck;
    };

    const handleSignup = () => {
        if (!isValidPassword(password)) {
            alert('비밀번호는 6자리 이상이며, 영문자, 숫자, 특수문자 중 두 가지 이상을 포함해야 합니다.');
            return;
        }
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        axios.post('http://127.0.0.1:8080/api/signup', {
            user_id,
            password,
            username,
            phoneNumber,
            businessNumber
        })
        .then(response => {
            alert(response.data.message);
            navigate("/login");
        })
        .catch(error => {
            console.error('회원가입 오류:', error);
            setError('회원가입 중 오류가 발생했습니다.');
        });
    };

    return (
        <div className="Box">
            <div className="JoinBox">
                <h1>회원가입</h1>
                <div className="Idp">
                    <label>아이디</label>
                    <input 
                        id="id" 
                        placeholder="아이디를 입력하시오" 
                        value={user_id} 
                        onChange={(e) => setUser_id(e.target.value)} 
                    />
                    <button id='Idc' onClick={handleUsernameCheck}>중복 체크</button>
                    
                </div>
                {useridCheck && <span className="error-message">{useridCheck}</span>}
                <label>비밀번호</label>
                <div style={{ position: "relative", width: "100%" }}>
                <input
                    id="password"
                    type={showPassword ? "text" : "password"} // 비밀번호 보기/가리기
                    placeholder="비밀번호를 입력하시오"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                        position: "absolute",
                        right: "30px",
                        width:"10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    {showPassword ? "🙈" : "👁️"}
                </button>
            </div>

                <label>비밀번호 확인</label>
                <input 
                    id="confirmPassword" 
                    type="password"
                    placeholder="비밀번호를 다시 입력하시오" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                />

                <label>이름</label>
                <input 
                    id="Name" 
                    placeholder="이름을 입력하시오" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} 
                />

                <label>전화번호</label>
                <input 
                    id="num" 
                    placeholder="전화번호를 입력하시오" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                />

                <label>사업자 번호</label>
                <input 
                    id="ComName"  
                    placeholder="사업자 번호를 입력하시오" 
                    value={businessNumber}
                    onChange={(e) => setBusinessNumber(e.target.value)} 
                />

                {error && <p className="error">{error}</p>} {/* 오류 메시지 표시 */}

                <span className="JoinButton">
                    <button id='join' onClick={handleSignup}>회원가입하기</button>
                </span>
            </div>
        </div>
    );
}

export default Join;
