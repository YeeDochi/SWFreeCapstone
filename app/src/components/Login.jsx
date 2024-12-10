import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import '../css/Login.css';
import { useAuth } from './AuthContext.jsx';

function Login(props) {
    const navigate = useNavigate();
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { isLoggedIn, setIsLoggedIn, username, setUsername } = useAuth();
    const [showPassword, setShowPassword] = useState(false);



    const handleLogin = () => {
        axios.post('http://localhost:8080/api/api_login', {
            username: loginId,
            password: password},
            {withCredentials: true} 
        
    )
        .then(response => {
            if (response.data.status === 'success') {
                alert(response.data.message);
                setIsLoggedIn(true);
                setUsername(response.data.username);
                navigate('/');  // 성공 시 홈 페이지로 이동
            } else {
                setError(response.data.message); // 오류 메시지 설정
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            setError('로그인 중 오류가 발생했습니다.');
        });
    };

    return (
        <div className="L_Box">
            <div className="LoginBox">
                <h1>로그인</h1>
                <label>아이디</label>
                <input 
                    id="LoginId" 
                    placeholder="아이디를 입력하시오" 
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                />
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
                        right: "5px",
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
                
                {error && <p className="error">{error}</p>} {/* 오류 메시지 표시 */}

                <div className="Buttonbox">
                    <button 
                        id='l_login' 
                        style={{ backgroundColor: '#6e9dfb'}}
                        onClick={handleLogin}
                    >
                        로그인하기
                    </button>
                    <button 
                        id='l_join' 
                        style={{ backgroundColor: '#c7ccd7'}} 
                        onClick={() => navigate("/join")}
                    >
                        회원가입하기
                    </button>
                </div>
                <p>
                    <Link to="/forgot-password">비밀번호를 잊으셨습니까?</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
