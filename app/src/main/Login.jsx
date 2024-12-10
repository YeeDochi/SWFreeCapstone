import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import '../css/Login.css';

function Login(props) {
    const navigate = useNavigate();
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        axios.post('http://localhost:8080/api/api_login', {
            username: loginId,
            password: password
        })
        .then(response => {
            if (response.data.status === 'success') {
                alert(response.data.message);
                navigate('/home');  // 성공 시 홈 페이지로 이동
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
        <div className="Box">
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
                <input 
                    id="Passwd" 
                    type="password" 
                    placeholder="비밀번호를 입력하시오"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                
                {error && <p className="error">{error}</p>} {/* 오류 메시지 표시 */}

                <div className="Buttonbox">
                    <button 
                        id='login' 
                        style={{ backgroundColor: '#6e9dfb'}}
                        onClick={handleLogin}
                    >
                        로그인하기
                    </button>
                    <button 
                        id='join' 
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
