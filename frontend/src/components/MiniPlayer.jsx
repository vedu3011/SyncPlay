// import React from 'react';
// import { usePlayer } from '../contexts/PlayerContext';
// import { PlayIcon, PauseIcon, SkipForwardIcon } from 'lucide-react';

// export default function MiniPlayer() {
//   const {
//     currentSong,
//     isPlaying,
//     isLoading,
//     isFullPlayerOpen, // Add this to check full player state
//     handlePlay,
//     handleNext,
//     toggleFullPlayer,
//   } = usePlayer();

//   // Don't show mini player when full player is open or no song is playing
//   if (!currentSong || isFullPlayerOpen) return null;

//   const containerStyle = {
//     position: 'fixed',
//     bottom: '4rem', // 64px = 16 * 4 for bottom-16 equivalent
//     left: 0,
//     right: 0,
//     zIndex: 11000, // Ensure above BottomNav (z-10000) but below FullPlayer (z-15000)
//     backgroundColor: '#161a23',
//     borderTop: '1px solid #22272e', // #22272e is gray-800 roughly equivalent
//     padding: '0.5rem 1rem',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.75rem', // gap-3 ~ 12px
//   };

//   const songInfoStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.75rem',
//     flex: 1,
//     minWidth: 0,
//     cursor: 'pointer',
//     overflow: 'hidden',
//   };

//   const thumbnailStyle = {
//     width: '2.5rem', // 10 * 0.25rem
//     height: '2.5rem',
//     borderRadius: '0.375rem', // rounded-md
//     overflow: 'hidden',
//     backgroundColor: '#374151', // gray-700 equivalent
//     flexShrink: 0,
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: '0.75rem', // text-xs
//   };

//   const imageStyle = {
//     width: '100%',
//     height: '100%',
//     objectFit: 'cover',
//   };

//   const songDetailsStyle = {
//     flex: 1,
//     minWidth: 0,
//     overflow: 'hidden',
//   };

//   const songTitleStyle = {
//     color: 'white',
//     fontWeight: 600,
//     fontSize: '0.875rem', // text-sm
//     whiteSpace: 'nowrap',
//     textOverflow: 'ellipsis',
//     overflow: 'hidden',
//     margin: 0,
//   };

//   const artistNameStyle = {
//     color: '#9ca3af', // gray-400
//     fontSize: '0.75rem', // text-xs
//     whiteSpace: 'nowrap',
//     textOverflow: 'ellipsis',
//     overflow: 'hidden',
//     margin: 0,
//   };

//   const controlsStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem', // gap-2
//     flexShrink: 0,
//   };

//   const buttonStyle = {
//     width: '2rem', // w-8
//     height: '2rem',
//     borderRadius: '9999px',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     transition: 'background-color 0.2s',
//     cursor: 'pointer',
//     border: 'none',
//   };

//   const playButtonStyle = {
//     ...buttonStyle,
//     backgroundColor: '#ec4899', // pink-500
//   };

//   const playButtonHoverStyle = {
//     backgroundColor: '#db2777', // pink-600
//   };

//   const nextButtonStyle = {
//     ...buttonStyle,
//     backgroundColor: '#374151', // gray-700
//   };

//   const nextButtonHoverStyle = {
//     backgroundColor: '#4b5563', // gray-600
//   };

//   const spinnerStyle = {
//     width: '1rem',
//     height: '1rem',
//     border: '2px solid white',
//     borderTopColor: 'transparent',
//     borderRadius: '50%',
//     animation: 'spin 1s linear infinite',
//   };

//   const progressBarContainerStyle = {
//     position: 'fixed',
//     bottom: '4rem', // Same as container bottom
//     left: '1rem',
//     right: '1rem',
//     zIndex: 11001, // Slightly above the mini player
//     paddingBottom: '0.5rem',
//   };

//   // For spinner animation keyframes
//   const styleSheet = `
//     @keyframes spin {
//       from { transform: rotate(0deg); }
//       to { transform: rotate(360deg); }
//     }
//   `;

//   // ProgressBar component inside MiniPlayer
//   const ProgressBar = () => {
//     const { currentTime, duration, seekTo } = usePlayer();

//     const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

//     const handleSeek = (e) => {
//       if (duration > 0) {
//         const rect = e.currentTarget.getBoundingClientRect();
//         const clickX = e.clientX - rect.left;
//         const percentage = clickX / rect.width;
//         const seekTime = percentage * duration;
//         seekTo(seekTime);
//       }
//     };

//     return (
//       <div
//         style={{
//           width: '100%',
//           height: '0.25rem', // 1
//           backgroundColor: '#374151', // gray-700
//           borderRadius: '9999px',
//           cursor: 'pointer',
//           position: 'relative',
//         }}
//         onClick={handleSeek}
//       >
//         <div
//           style={{
//             height: '100%',
//             borderRadius: '9999px',
//             backgroundColor: '#ec4899', // pink-500
//             transition: 'width 0.3s',
//             width: `${progressPercentage}%`,
//           }}
//           onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9a8d4')} // pink-400 hover
//           onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ec4899')}
//         />
//       </div>
//     );
//   };

//   return (
//     <>
//       <style>{styleSheet}</style>
//       <div style={containerStyle}>
//         <div style={songInfoStyle} onClick={toggleFullPlayer}>
//           <div style={thumbnailStyle}>
//             {currentSong.thumbnail_url ? (
//               <img
//                 src={currentSong.thumbnail_url}
//                 alt={currentSong.title}
//                 style={imageStyle}
//               />
//             ) : (
//               <div
//                 style={{
//                   width: '100%',
//                   height: '100%',
//                   backgroundImage: 'linear-gradient(to bottom right, #ec4899, #8b5cf6)', // pink to purple gradient
//                   display: 'flex',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   color: 'white',
//                   fontWeight: 'bold',
//                   fontSize: '0.75rem',
//                 }}
//               >
//                 {currentSong.title?.charAt(0) || '♪'}
//               </div>
//             )}
//           </div>

//           <div style={songDetailsStyle}>
//             <p style={songTitleStyle}>{currentSong.title}</p>
//             <p style={artistNameStyle}>{currentSong.artist_name}</p>
//           </div>
//         </div>

//         <div style={controlsStyle}>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               handlePlay();
//             }}
//             disabled={isLoading}
//             aria-label={isPlaying ? 'Pause' : 'Play'}
//             style={{
//               ...playButtonStyle,
//               opacity: isLoading ? 0.5 : 1,
//               cursor: isLoading ? 'not-allowed' : 'pointer',
//             }}
//             onMouseEnter={e => {
//               if (!isLoading) e.currentTarget.style.backgroundColor = playButtonHoverStyle.backgroundColor;
//             }}
//             onMouseLeave={e => {
//               if (!isLoading) e.currentTarget.style.backgroundColor = playButtonStyle.backgroundColor;
//             }}
//           >
//             {isLoading ? (
//               <div style={spinnerStyle} />
//             ) : isPlaying ? (
//               <PauseIcon size={16} color="white" />
//             ) : (
//               <PlayIcon size={16} color="white" />
//             )}
//           </button>

//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               handleNext();
//             }}
//             aria-label="Next"
//             style={nextButtonStyle}
//             onMouseEnter={e => (e.currentTarget.style.backgroundColor = nextButtonHoverStyle.backgroundColor)}
//             onMouseLeave={e => (e.currentTarget.style.backgroundColor = nextButtonStyle.backgroundColor)}
//           >
//             <SkipForwardIcon size={14} color="white" />
//           </button>
//         </div>
//       </div>

//       <div style={progressBarContainerStyle}>
//         <ProgressBar />
//       </div>
//     </>
//   );
// }


import React from 'react';
import { useLocation } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { PlayIcon, PauseIcon, SkipForwardIcon } from 'lucide-react';

export default function MiniPlayer() {
  const location = useLocation();
  const {
    currentSong,
    isPlaying,
    isLoading,
    isFullPlayerOpen,
    handlePlay,
    handleNext,
    toggleFullPlayer,
  } = usePlayer();

  // Don't show mini player when full player is open or no song is playing
  if (!currentSong || isFullPlayerOpen) return null;

  // Check if we're on a chat room page
  const isChatRoom = location.pathname.startsWith('/chat/');
  
  // Adjust bottom position based on whether we're in a chat room
  const bottomPosition = isChatRoom ? '8rem' : '4rem'; // 128px for chat (above input bar), 64px for others (above navbar)

  const containerStyle = {
    position: 'fixed',
    bottom: bottomPosition,
    left: 0,
    right: 0,
    zIndex: 11000,
    backgroundColor: '#161a23',
    borderTop: '1px solid #22272e',
    padding: '0.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  const songInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    minWidth: 0,
    cursor: 'pointer',
    overflow: 'hidden',
  };

  const thumbnailStyle = {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.375rem',
    overflow: 'hidden',
    backgroundColor: '#374151',
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.75rem',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const songDetailsStyle = {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  };

  const songTitleStyle = {
    color: 'white',
    fontWeight: 600,
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    margin: 0,
  };

  const artistNameStyle = {
    color: '#9ca3af',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    margin: 0,
  };

  const controlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  };

  const buttonStyle = {
    width: '2rem',
    height: '2rem',
    borderRadius: '9999px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.2s',
    cursor: 'pointer',
    border: 'none',
  };

  const playButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ec4899',
  };

  const playButtonHoverStyle = {
    backgroundColor: '#db2777',
  };

  const nextButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#374151',
  };

  const nextButtonHoverStyle = {
    backgroundColor: '#4b5563',
  };

  const spinnerStyle = {
    width: '1rem',
    height: '1rem',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const progressBarContainerStyle = {
    position: 'fixed',
    bottom: bottomPosition, // Same as container bottom
    left: '1rem',
    right: '1rem',
    zIndex: 11001,
    paddingBottom: '0.5rem',
  };

  const styleSheet = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  // ProgressBar component
  const ProgressBar = () => {
    const { currentTime, duration, seekTo } = usePlayer();

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleSeek = (e) => {
      if (duration > 0) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const seekTime = percentage * duration;
        seekTo(seekTime);
      }
    };

    return (
      <div
        style={{
          width: '100%',
          height: '0.25rem',
          backgroundColor: '#374151',
          borderRadius: '9999px',
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={handleSeek}
      >
        <div
          style={{
            height: '100%',
            borderRadius: '9999px',
            backgroundColor: '#dd2476',
            transition: 'width 0.3s',
            width: `${progressPercentage}%`,
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9a8d4')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#dd2476')}
        />
      </div>
    );
  };

  return (
    <>
      <style>{styleSheet}</style>
      <div style={containerStyle}>
        <div style={songInfoStyle} onClick={toggleFullPlayer}>
          <div style={thumbnailStyle}>
            {currentSong.thumbnail_url ? (
              <img
                src={currentSong.thumbnail_url}
                alt={currentSong.title}
                style={imageStyle}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: 'linear-gradient(to bottom right, #dd2476, #8b5cf6)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                }}
              >
                {currentSong.title?.charAt(0) || '♪'}
              </div>
            )}
          </div>

          <div style={songDetailsStyle}>
            <p style={songTitleStyle} 
            // className='w-1/2 truncate'
            >{currentSong.title}</p>
            <p style={artistNameStyle}>{currentSong.artist_name}</p>
          </div>
        </div>

        <div style={controlsStyle}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
            disabled={isLoading}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            style={{
              ...playButtonStyle,
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => {
              if (!isLoading) e.currentTarget.style.backgroundColor = playButtonHoverStyle.backgroundColor;
            }}
            onMouseLeave={e => {
              if (!isLoading) e.currentTarget.style.backgroundColor = playButtonStyle.backgroundColor;
            }}
          >
            {isLoading ? (
              <div style={spinnerStyle} />
            ) : isPlaying ? (
              <PauseIcon size={16} color="white" />
            ) : (
              <PlayIcon size={16} color="white" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next"
            style={nextButtonStyle}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = nextButtonHoverStyle.backgroundColor)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = nextButtonStyle.backgroundColor)}
          >
            <SkipForwardIcon size={14} color="white" />
          </button>
        </div>
      </div>

      <div style={progressBarContainerStyle}>
        <ProgressBar />
      </div>
    </>
  );
}