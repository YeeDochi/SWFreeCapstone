
import React from 'react';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import reportWebVitals from './reportWebVitals';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './components/AuthContext.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>

  <BrowserRouter basename="/Swproject">
      
    
        
        <Header attr={"header__wrap"} />
         <App />
    
    <Footer attr={"footer__wrap"} />
      </BrowserRouter>
      </AuthProvider>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();