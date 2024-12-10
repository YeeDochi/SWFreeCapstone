import React, { useState, useRef, useEffect } from "react";

function ImageEditor({ imgUrl, onImageUpdate }) {  // onImageUpdate를 props로 받음
  const [image, setImage] = useState(null); // 업로드된 이미지
  const [texts, setTexts] = useState([]); // 추가된 텍스트들
  const canvasRef = useRef(null); // 캔버스 참조
  const [dragging, setDragging] = useState(false); // 드래그 상태 관리
  const [draggingText, setDraggingText] = useState(null); // 드래그 중인 텍스트 객체

  useEffect(() => {
    if (imgUrl) {
      setImage(imgUrl);  // imgUrl이 변경될 때마다 setImage 호출
    }
  }, [imgUrl]);

  // 캔버스에 이미지와 텍스트를 그리기
  const renderCanvasWithTexts = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    //img.crossOrigin = "anonymous";
    img.src = image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // 텍스트를 캔버스에 그리기
      texts.forEach(({ text, x, y, fontSize, fontColor, fontFamily }) => {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fontColor;
        ctx.fillText(text, x, y);
      });
    };
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      renderCanvasWithTexts(); // 이미지와 텍스트를 캔버스에 그리기
    }
  }, [image, texts]); // image나 texts가 변경될 때마다 렌더링

  // 텍스트 추가
  const addText = () => {
    const newTextObj = {
      id: Date.now(),
      text: "",
      x: 50, // 텍스트 시작 위치
      y: 50, // 텍스트 시작 위치
      fontSize: 20,
      fontColor: "#000000",
      fontFamily: "Arial",
    };
    setTexts([...texts, newTextObj]);
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
  const handleSave = () => {
    renderCanvasWithTexts(); // 캔버스에 텍스트와 이미지를 그리기

    setTimeout(() => {
      const canvas = canvasRef.current;
      const imgData = canvas.toDataURL(); // 캔버스를 이미지로 변환

      // 부모 컴포넌트로 저장된 이미지 데이터 전달
      if (onImageUpdate) {
        console.log(imgData);
        onImageUpdate(imgData); // 부모에게 새로운 이미지 URL 전달
      }
    }, 100); // 렌더링 완료 후 저장
  };

  return (
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
            <input
              type="color"
              value={text.fontColor}
              onChange={(e) =>
                updateText(text.id, { fontColor: e.target.value })
              }
            />
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
            </select>
            <button onClick={() => deleteText(text.id)}>삭제</button>
          </div>
        ))}
        <button onClick={addText}>텍스트 추가</button>
      </div>

      <button onClick={handleSave}>이미지 저장</button>
    </div>
  );
}

export default ImageEditor;
