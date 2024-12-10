import React from 'react';
import '../css/Modal.scss';
import ImageEditor from './ImageMaker/ImageEditer';

const Modal = (props) => {
  const { open, close, header, imgUrl } = props; // imgUrl도 받아옴

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
            {imgUrl}
            {/* imgUrl을 ImageEditor에 전달 */}
            <ImageEditor imgUrl={imgUrl} />
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

export default Modal;
