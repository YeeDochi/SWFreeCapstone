import React from "react";
import {  Route, Routes } from "react-router-dom";  // Login 파일 경로가 맞는지 확인하세요.
import ForgotPassword from "./components/ForgotPassword";  // ForgotPassword 파일 경로가 맞는지 확인하세요.
import Join from './components/Join';
import Text from './components/Text';
import Login from './components/Login';
import Address from './components/Address';
import Main  from "./components/Main.jsx";
import Image  from "./components/ImageMaker/ImageEditer.jsx";

const App = () => {
    return (
        <Routes>
        <Route path="" element={<Main />} />
        <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/image" element={<Image />} />
          <Route path="/text" element={<Text />} />
          <Route path="/address" element={<Address />} />
          <Route path="/join" element={<Join />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
        </Routes>
     
    );
  };
  
export default App;
