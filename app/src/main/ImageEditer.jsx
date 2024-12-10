import React, { useRef, useState, useEffect } from 'react';

const ImageEditor = ({ imgUrl }) => {
  const canvasRef = useRef(null); // 캔버스 참조
  const [image, setImage] = useState(null); // 이미지 상태 관리
  const [dragging, setDragging] = useState(false); // 드래그 상태 관리
  const [draggingText, setDraggingText] = useState(null); // 드래그 중인 텍스트 객체
  const [texts, setTexts] = useState([]); // 텍스트 상태 관리

  useEffect(() => {
    if (imgUrl) {
      setImage(imgUrl);
    }
  }, [imgUrl]);

  // 캔버스에 이미지와 텍스트를 그리기
  const renderCanvasWithTexts = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "Anonymous"; // CORS 문제 해결을 위해 추가
    img.src = `https://cors-anywhere.herokuapp.com/${image}`; // 프록시 서버를 통해 이미지 로드

    img.onload = () => {
      console.log("Image loaded:", img.src);
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // 추가적인 텍스트 렌더링 로직이 여기에 들어갑니다.
      texts.forEach((text) => {
        ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        ctx.fillStyle = text.color;
        ctx.fillText(text.text, text.x, text.y);
      });
    };

    img.onerror = (error) => {
      console.error("Failed to load image:", error);
    };
  };

  useEffect(() => {
    renderCanvasWithTexts();
  }, [image, texts]);

  const handleSave = () => {
    renderCanvasWithTexts(); // 캔버스에 텍스트와 이미지를 그리기

    setTimeout(() => {
      const canvas = canvasRef.current;
      const link = document.createElement("a");
      link.download = "edited-image.png";
      link.href = canvas.toDataURL(); // 캔버스를 이미지로 변환하여 다운로드
      link.click();
    }, 100); // 렌더링 완료 후 저장
  };

  const handleMouseDown = (e, text) => {
    setDragging(true);
    setDraggingText(text);
  };

  const handleMouseMove = (e) => {
    if (!dragging || !draggingText) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTexts((prevTexts) =>
      prevTexts.map((text) =>
        text === draggingText
          ? { ...text, x: mouseX, y: mouseY }
          : text
      )
    );
  };

  const handleMouseUp = () => {
    setDragging(false);
    setDraggingText(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
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
      <button onClick={handleSave}>이미지 저장</button>
    </div>
  );
};

export default ImageEditor;
