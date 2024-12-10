// Modal.jsx
import React, { useState } from 'react';
import '../css/Modal.scss';
import ImageEditor from './ImageMaker/saveButton'; // ImageEditor import
import Image from './ImageMaker/Textinput';
import PropTypes from 'prop-types';

// Modal 컴포넌트에 PropTypes 추가
const Modal = (props) => {
  const { open, close, header, imgUrl, onImageUpdate } = props; // 부모로부터 props 받기
  const [currentImgUrl, setCurrentImgUrl] = useState(imgUrl);

  const handleImageUpdate = (newImgUrl) => {
    setCurrentImgUrl(newImgUrl);
    onImageUpdate(newImgUrl);
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
            <ImageEditor imgUrl={imgUrl} onImageUpdate={handleImageUpdate} />
          </main>
          <footer>
            <button className="close" onClick={close}>
              close
            </button>
          </footer>
        </section>
      ) : null}
    </div>
  );
};

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  header: PropTypes.string.isRequired,
  imgUrl: PropTypes.string,
  onImageUpdate: PropTypes.func.isRequired,
};

export default Modal;
