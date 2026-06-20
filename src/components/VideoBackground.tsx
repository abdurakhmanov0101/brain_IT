import React from 'react';

interface VideoBackgroundProps {
  darkMode: boolean;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ darkMode }) => {
  return (
    <div className="absolute inset-0 -z-20 overflow-hidden">
      <iframe
        className="video-background absolute inset-0 h-full w-full border-none"
        src="https://www.youtube.com/embed/UO-8CMdeSHA?autoplay=1&mute=1&loop=1&controls=0&rel=0&modestbranding=1&showinfo=0&playlist=UO-8CMdeSHA"
        title="IT Animated Background"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        loading="lazy"
      />
      <div className={`video-overlay ${darkMode ? 'video-overlay-dark' : 'video-overlay-light'}`} />
    </div>
  );
};

export default VideoBackground;
