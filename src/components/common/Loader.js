import React from 'react';
import '@dotlottie/player-component/dist/dotlottie-player';
import { useLoading } from '../../contexts/LoadingContext';

const LOTTIE_SRC = 'https://lottie.host/e8d4f9ff-a385-46cc-8934-acd23a811076/OL2R4E2ISK.lottie';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.55)',
  backdropFilter: 'blur(2px)',
  zIndex: 2000,
  pointerEvents: 'all',
};

const inlineContainerStyle = {
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  padding: '8px 12px',
};

const messageStyle = {
  marginTop: 12,
  fontSize: 16,
  color: '#1f2937',
  fontWeight: 500,
  textAlign: 'center',
};

const Loader = ({ fullscreen = false, size = 160, message = '' }) => {
  const containerStyle = fullscreen ? overlayStyle : inlineContainerStyle;

  return (
    <div style={containerStyle} role="status" aria-live="polite" aria-busy="true">
      <dotlottie-player
        src={LOTTIE_SRC}
        background="transparent"
        speed="1.2"
        loop="true"
        autoplay="true"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      {message ? <div style={messageStyle}>{message}</div> : null}
    </div>
  );
};

export const GlobalLoaderOverlay = () => {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return null;
  }

  return <Loader fullscreen />;
};

export default Loader;
