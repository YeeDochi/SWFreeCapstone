import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Modal.css';
import PropTypes from 'prop-types';

function ImageModal({ open, close, header, imgUrl, onImageUpdate, name }) {
  const [image, setImage] = useState(null);
  const [texts, setTexts] = useState([]);
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [draggingText, setDraggingText] = useState(null);
  //const [currentImgUrl, setCurrentImgUrl] = useState(imgUrl);
  const [newImgUrl, setNewImgUrl] = useState(null);
  //const [Name, setName] = useState(name);


  useEffect(() => {
    if (name) {
      console.log('name:', name);
      downloadImage(name);  // name이 변경될 때마다 이미지 다운로드
    }
  }, [name]);

  const downloadImage = async (name) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/get_image/${name}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.data.type });
      const blobUrl = URL.createObjectURL(blob);
      setImage(blobUrl);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  // 캔버스에 이미지와 텍스트를 그리기
  const renderCanvasWithTexts = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "Anonymous"; // CORS 문제 해결을 위해 추가
    img.src = image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      texts.forEach(({ text, x, y, fontSize, fontColor, fontFamily, backgroundColor, backgroundOpacity }) => {
        // 배경 먼저 그리기
        if (backgroundColor && backgroundColor !== "transparent") {
          ctx.fillStyle = hexToRgba(backgroundColor, backgroundOpacity);
          ctx.font = `${fontSize}px ${fontFamily}`; // 폰트를 미리 설정해야 정확한 너비 계산 가능
          const textWidth = ctx.measureText(text).width; // 텍스트 전체 너비 계산
          const textHeight = fontSize; // 폰트 크기로 높이 추정
          const padding = 8; // 배경 패딩 설정
  
          ctx.fillRect(
            x - padding, // 배경 시작점 X (패딩 포함)
            y - textHeight - padding, // 배경 시작점 Y (패딩 포함)
            textWidth + padding * 2, // 배경 너비 (텍스트 길이 + 패딩)
            textHeight + padding * 2 // 배경 높이 (텍스트 높이 + 패딩)
          );
        }
  
        // 텍스트 그리기 (배경 위에)
        ctx.fillStyle = fontColor; // 텍스트는 투명도 영향을 받지 않음
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillText(text, x, y);
      });
    };

    img.onerror = (error) => {
      console.error("Failed to load image:", error);
    };
  };

  useEffect(() => {
    if (open && image && canvasRef.current) {
      renderCanvasWithTexts(); // 모달이 열릴 때 이미지와 텍스트를 캔버스에 그리기
    }
  }, [open, image, texts]); // open, image, texts가 변경될 때마다 렌더링

  // 텍스트 추가
  const addText = () => {
    const newTextObj = {
      id: Date.now(),
      text: "",
      x: 50,
      y: 50,
      fontSize: 20,
      fontColor: "#000000",
      fontFamily: "Arial",
      backgroundColor: "transparent", // 배경색
      backgroundOpacity: 1, // 불투명도 (1 = 불투명, 0 = 완전 투명)
    };
    setTexts([...texts, newTextObj]);
  };
//텍스트 배경
  const hexToRgba = (hex, opacity) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
  
    return `rgba(${r},${g},${b},${opacity})`;
  };

  

  // 텍스트 삭제
  const deleteText = (id) => {
    setTexts(texts.filter((text) => text.id !== id));
  };

  // 텍스트 수정
  const updateText = (id, updatedText) => {
    setTexts((prev) =>
      prev.map((text) => (text.id === id ? { ...text, ...updatedText } : text))
    );
  };

  // 드래그 시작
  const handleMouseDown = (e, text) => {
    const offsetX = e.clientX - text.x;
    const offsetY = e.clientY - text.y;
    setDraggingText({ text, offsetX, offsetY });
    setDragging(true);
  };

  // 드래그 중일 때 텍스트 위치 변경
  const handleMouseMove = (e) => {
    if (!dragging || !draggingText) return;
    const newX = e.clientX - draggingText.offsetX;
    const newY = e.clientY - draggingText.offsetY;
    updateText(draggingText.text.id, { x: newX, y: newY });
  };

  // 드래그 끝나면 상태 초기화
  const handleMouseUp = () => {
    setDragging(false);
    setDraggingText(null);
  };

  // 이미지 저장
  const handleSave = async () => {
    renderCanvasWithTexts(); // 캔버스에 텍스트와 이미지를 그리기
    const canvas = canvasRef.current;
    const newImgUrl = canvas.toDataURL();
    changed_image(newImgUrl,name);
    onImageUpdate(newImgUrl); // 부모 컴포넌트로 newImgUrl 전달
     // 서버로 이미지 URL 전송
  };

  const changed_image = async (newImgUrl, name) => {
    console.log(newImgUrl,", " ,name);
    try {
      const response = await axios.post('http://localhost:8080/api/img_changed', {
        new_image: newImgUrl,
        url: name,    // 선택된 이미지 URL
      });
      if (response.data.success) {
        setNewImgUrl(response.data.img_url);
        console.log('Image updated successfully');
      } else {
        console.error('Failed to update image');
      }
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const handleClose = () => {
    if (newImgUrl) {
      onImageUpdate(newImgUrl); // 부모에게 현재 이미지 URL 전달
    }
    close(); // Modal 닫기
  };

  // 이미지 로드 버튼 클릭 핸들러
  const handleLoadImage = () => {
    renderCanvasWithTexts();
  };

  return (
    <div className={open ? 'openModal modal' : 'modal'}>
      {open ? (
        <section>
          <header>
            {header}
            <button className="close" onClick={close}>
              &times;
            </button>
          </header>
          <main>
            <div>
              {/* 이미지 업로드 */}
              <canvas
                ref={canvasRef}
                style={{ border: "1px solid black", cursor: "move" }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseDown={(e) => {
                  texts.forEach((text) => {
                    const canvas = canvasRef.current;
                    const rect = canvas.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    const textWidth = canvas
                      .getContext("2d")
                      .measureText(text.text).width;
                    const textHeight = text.fontSize;

                    if (
                      mouseX >= text.x &&
                      mouseX <= text.x + textWidth &&
                      mouseY >= text.y - textHeight &&
                      mouseY <= text.y
                    ) {
                      handleMouseDown(e, text);
                    }
                  });
                }}
              />

              {/* 이미지 로드 버튼 */}
              <button onClick={handleLoadImage}>이미지 로드</button>

              {/* 텍스트 추가 및 수정 */}
              <div style={{ marginTop: "20px" }}>
                <h3>텍스트 추가 및 수정</h3>
                {texts.map((text, index) => (
                  <div key={text.id}>
                    <input
                      type="text"
                      value={text.text}
                      placeholder="텍스트 입력"
                      onChange={(e) =>
                        updateText(text.id, { text: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      value={text.fontSize}
                      min="10"
                      max="100"
                      onChange={(e) =>
                        updateText(text.id, { fontSize: Number(e.target.value) })
                      }
                    />
                    <label>글씨 색상
                    <input
                      type="color"
                      value={text.fontColor}
                      onChange={(e) =>
                        updateText(text.id, { fontColor: e.target.value })
                      }
                    /></label>
                    <label>글씨 배경 색상
                    <input
                    type="color"
                    value={text.backgroundColor || "#FFFFFF"}
                    onChange={(e) =>
                      updateText(text.id, { backgroundColor: e.target.value })
                      }
                  />

                    <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={text.backgroundOpacity}
                    onChange={(e) =>
                      updateText(text.id, { backgroundOpacity: parseFloat(e.target.value) })
                    }
                    />
                      </label>
                    <select
                      value={text.fontFamily}
                      onChange={(e) =>
                        updateText(text.id, { fontFamily: e.target.value })
                      }
                    >
                      <option value="Arial">Arial</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Verdana">Verdana</option>

                      <option value="돋움">돋움</option>
                      <option value="바탕">바탕</option>
                      <option value="굴림">굴림</option>
                      <option value="맑은 고딕">맑은 고딕</option>
                    </select>
                    <button onClick={() => deleteText(text.id)}>삭제</button>
                  </div>
                ))}
                <button onClick={addText}>텍스트 추가</button>
              </div>

              <button onClick={handleSave}>이미지 저장</button>
            </div>
          </main>
          <footer>
            <button className="close" onClick={handleClose}>
              close
            </button>
          </footer>
        </section>
      ) : null}
    </div>
  );
}

ImageModal.propTypes = {
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  header: PropTypes.string.isRequired,
  imgUrl: PropTypes.string,
  onImageUpdate: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
};

export default ImageModal;