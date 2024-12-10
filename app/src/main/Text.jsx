import React, { useState } from 'react';
import axios from 'axios';
import '../css/css/Text.css';
import Modal from './Modal.jsx';

const Text = () => {
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressBook, setAddressBook] = useState(''); // 주소록 상태
  const [promptAdd, setPromptAdd] = useState('');
  const [themaFlag, setThemaFlag] = useState('1');
  const [imageUrls, setImageUrl] = useState([]); // 이미지 URL 상태 추가(배열로 변경됨)
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [numbers, setNumbers] = useState(''); // Numbers 입력값 상태 추가
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
  };


  const handleImageGeneration = async () => {
    console.log('이미지 생성 요청 시작'); // 로그 추가
    try {
      const response = await axios.post('http://localhost:8080/api/generate_image', {
        message: message,
        promptAdd: promptAdd,
        themaFlag: themaFlag,
      });
      console.log('이미지 생성 응답:', response); // 서버 응답 로그

      if (response.data.success) {  // response.data.success를 확인
        console.log('이미지 URL:', response.data.image_url); // 이미지 URL 확인
        setImageUrl(response.data.image_url); // 이미지 URL 설정
        alert('이미지가 성공적으로 생성되었습니다!');
      } else {
        console.error('이미지 생성 실패:', response.data.error);
      }
    } catch (error) {
      console.error('이미지 생성 실패:', error);
    }
};

const handleForcedImageGeneration = async () => { // 강제적 이미지 생성
  console.log('이미지 생성 요청 시작'); // 로그 추가
  try {
    const response = await axios.post('http://localhost:8080/api/F_generate_image', {
      message: message,
      promptAdd: promptAdd,
      themaFlag: themaFlag,
    });
    console.log('이미지 생성 응답:', response); // 서버 응답 로그

    if (response.data.success) {  // response.data.success를 확인
      console.log('이미지 URL:', response.data.image_url); // 이미지 URL 확인
      setImageUrl(response.data.image_url); // 이미지 URL 설정
      alert('이미지가 성공적으로 생성되었습니다!');
    } else {
      console.error('이미지 생성 실패:', response.data.error);
    }
  } catch (error) {
    console.error('이미지 생성 실패:', error);
  }
};

  
const handleMessageSend = async () => { //보내깅
 
  try {
    const response = await axios.post('http://localhost:8080/api/send_message_img', {
      phoneNumber: phoneNumber,  // 전화번호
      message: message,          // 메시지
      promptAdd: promptAdd,        // 추가 프롬프트
      selectedImageUrl: selectedImageUrl,    // 선택된 이미지 URL
    });

    if (response.data.success) {
      alert('메시지 발송 성공!');
    } else {
      alert('메시지 발송 실패');
    }
  } catch (error) {
    console.error('메시지 발송 실패:', error);
  }
};

  

  const handleAddToAddressBook = () => {
    if (numbers.trim()) {
      setAddressBook((prev) => `${prev}${numbers}\n`); // Numbers 값을 주소록에 추가
      setNumbers(''); // 입력창 초기화
    } else {
      alert('추가할 값을 입력해주세요.');
    }
  };

  const handleImageSelect = (url) => {
        setSelectedImageUrl(url); // 선택된 이미지 URL을 상태에 저장
  };

  const handleImageinit = () => {
    setSelectedImageUrl(''); // 선택된 이미지 URL을 초기화
  };
  
  return (
    <div className="main-box">
      <div className="textbobo">
        <h1 style={{ textAlign: 'left' }}>문자 메시지</h1>
      </div>
      <div className="main-text">
        <div className="text-box">
          <label>메세지</label>
          <div className="message-section">
            <textarea
              id="message"
              placeholder="안녕하세요~"   
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="button-section">
              <button id="mkimg" onClick={() => { handleImageGeneration(); handleImageinit(); setImageUrl('')}}>이미지 생성</button>
              <button id="send" onClick={handleMessageSend}>발송하기</button>
              <hr />
            </div>
          </div>
          <div className="img-section">
            <label name="thema" id="thema" htmlFor="message">테마</label>
            <div className="button-section2">
              <input type="hidden" name="themaFlag" id="themaFlag" value={themaFlag} />
              <button onClick={() => setThemaFlag('1')} className="btn btn-primary">만화풍</button>
              <button onClick={() => setThemaFlag('2')} className="btn btn-primary">thema1</button>
              <button onClick={() => setThemaFlag('3')} className="btn btn-primary">thema2</button>
              <br />
            </div>
            <label htmlFor="promptAdd">이미지 생성 요구사항</label>
            <input
              type="text"
              className="form-control"
              id="promptAdd"
              name="promptAdd"
              value={promptAdd}
              onChange={(e) => setPromptAdd(e.target.value)}
            />
            {/* 이미지 URL이 있을 경우 이미지를 표시 */}
            {/*{imageUrl && <img src={imageUrl} alt="생성된 이미지" className="generated-image" />}*/}
            {selectedImageUrl ? (
            <div>
              <p>선택된 이미지:</p>
              <img
                src={selectedImageUrl}
                alt="Selected"
                style={{
                  width: "400ps",
                  maxHeight: "400px",
                  marginBottom: "10px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          ) : (
            // 선택된 이미지가 없으면 여러 이미지 출력
            imageUrls.length > 0 ? (
              imageUrls.map((url, index) => (
                <div key={index} className="image-container">
                  {/* 이미지 출력 */}
                  <img
                    src={url}
                    alt={`Generated ${index + 1}`}
                    style={{
                      width: "200px",
                      maxHeight: "200px",
                      marginBottom: "10px",
                      border: "1px solid #ccc",
                    }}
                  />
                  {/* 선택 버튼 */}
                  <button onClick={() => handleImageSelect(url)}>
                    선택
                  </button>
                </div>
              ))
            ) : (
              <p></p>
            )
          )}
      <button onClick={() => {handleForcedImageGeneration(); handleImageinit();} }className="btn btn-primary">원하는 이미지가 없다면..</button>
      <button onClick={openModal}>모달팝업</button>
     
      
      <Modal
        open={modalOpen}
        close={closeModal}
        header="이미지 에디터"
        imgUrl={selectedImageUrl} // imgUrl 전달
      />
   
            
          </div>
        </div>
        
        <div className="text-box2">
          <div className="address-section">
            <label>수신 번호</label>
            <input
              id="phoneNumber"
              placeholder="000-0000-0000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <label>주소록</label>
            <textarea id="address-book" placeholder="주소록 창" value={addressBook} readOnly />
            <div className="add-value">
              <input
                id="value"
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                placeholder="Value"
              />
              <button id="add" onClick={handleAddToAddressBook}>추가</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Text;
