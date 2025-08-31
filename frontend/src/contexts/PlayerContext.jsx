// src/contexts/PlayerContext.jsx
import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { getArtistDetail, recordPlayed } from '../lib/api';

const PlayerContext = createContext();

// Player state management
const initialState = {
  currentSong: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  isFullPlayerOpen: false,
  playbackContext: null, // 'playlist', 'artist', 'search', etc.
};

function playerReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_SONG':
      return {
        ...state,
        currentSong: action.payload.song,
        queue: action.payload.queue || [],
        currentIndex: action.payload.index || 0,
        playbackContext: action.payload.context,
      };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'NEXT_SONG':
      const nextIndex = state.currentIndex + 1;
      if (nextIndex < state.queue.length) {
        return {
          ...state,
          currentIndex: nextIndex,
          currentSong: state.queue[nextIndex],
        };
      }
      return state;
    case 'PREVIOUS_SONG':
      const prevIndex = state.currentIndex - 1;
      if (prevIndex >= 0) {
        return {
          ...state,
          currentIndex: prevIndex,
          currentSong: state.queue[prevIndex],
        };
      }
      return state;
    case 'TOGGLE_FULL_PLAYER':
      return { ...state, isFullPlayerOpen: !state.isFullPlayerOpen };
    case 'SET_FULL_PLAYER':
      return { ...state, isFullPlayerOpen: action.payload };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const playerRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);

  // YouTube Player initialization
  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  const initializePlayer = () => {
    if (!document.getElementById('youtube-player')) {
      const playerDiv = document.createElement('div');
      playerDiv.id = 'youtube-player';
      playerDiv.style.position = 'absolute';
      playerDiv.style.left = '-9999px';
      playerDiv.style.width = '1px';
      playerDiv.style.height = '1px';
      playerDiv.style.opacity = '0';
      document.body.appendChild(playerDiv);
    }

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = () => {
    console.log('YouTube player ready');
  };

  const onPlayerStateChange = (event) => {
    const player = playerRef.current;
    if (!player) return;

    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        dispatch({ type: 'SET_PLAYING', payload: true });
        dispatch({ type: 'SET_LOADING', payload: false });
        startTimeUpdate();
        break;
      case window.YT.PlayerState.PAUSED:
        dispatch({ type: 'SET_PLAYING', payload: false });
        stopTimeUpdate();
        break;
      case window.YT.PlayerState.BUFFERING:
        dispatch({ type: 'SET_LOADING', payload: true });
        break;
      case window.YT.PlayerState.ENDED:
        handleNext();
        break;
    }
  };

  const startTimeUpdate = () => {
    if (timeUpdateIntervalRef.current) return;
    
    timeUpdateIntervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        dispatch({ type: 'SET_TIME', payload: currentTime });
        dispatch({ type: 'SET_DURATION', payload: duration });
      }
    }, 1000);
  };

  const stopTimeUpdate = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  };

  // Generate queue based on context
  const generateQueue = async (song, context) => {
    let queue = [song];

    try {
      if (context?.type === 'playlist' && context.songs) {
        queue = context.songs;
      } else if (context?.type === 'artist' && song.artist_name) {
        // Try to get artist details for more songs
        const artistName = song.artist_name.split(',')[0].trim();
        const searchResults = await getArtistDetail(artistName);
        if (searchResults?.songs) {
          queue = [song, ...searchResults.songs.slice(0, 19)];
        }
      } else {
        // Default: just the single song
        queue = [song];
      }
    } catch (error) {
      console.error('Error generating queue:', error);
      queue = [song];
    }

    return queue;
  };
  const playSong = async (songOrQueue, context = null, startIndex = 0) => {
  if (!playerRef.current) return;

  // Check if first argument is a queue array or single song
  let queue = [];
  let songToPlay;

  if (Array.isArray(songOrQueue)) {
    queue = songOrQueue;
    songToPlay = queue[startIndex] || queue[0];
  } else {
    songToPlay = songOrQueue;
    queue = await generateQueue(songToPlay, context);
  }

  if (!songToPlay?.yt_video_id) return;

  dispatch({ type: "SET_LOADING", payload: true });

  try {
    if (!Array.isArray(songOrQueue)) {
      // Existing behavior: generate queue if single song
      queue = await generateQueue(songToPlay, context);
    }

    const songIndex = queue.findIndex(s => s.yt_video_id === songToPlay.yt_video_id);
    dispatch({
      type: "SET_CURRENT_SONG",
      payload: {
        song: songToPlay,
        queue,
        index: Math.max(0, songIndex),
        context: context?.type || "single",
      },
    });

    playerRef.current.loadVideoById(songToPlay.yt_video_id);

    await recordPlayed({
      type: "track",
      title: songToPlay.title,
      subtitle: songToPlay.artist_name,
      image_url: songToPlay.thumbnail_url,
      yt_video_id: songToPlay.yt_video_id,
    });

  } catch (error) {
    console.error("Error playing song:", error);
    dispatch({ type: "SET_LOADING", payload: false });
  }
};


  const handlePlay = () => {
    if (playerRef.current && state.currentSong) {
      if (state.isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleNext = () => {
    if (state.currentIndex < state.queue.length - 1) {
      dispatch({ type: 'NEXT_SONG' });
      const nextSong = state.queue[state.currentIndex + 1];
      if (nextSong?.yt_video_id && playerRef.current) {
        playerRef.current.loadVideoById(nextSong.yt_video_id);
      }
    }
  };

  const handlePrevious = () => {
    if (state.currentIndex > 0) {
      dispatch({ type: 'PREVIOUS_SONG' });
      const prevSong = state.queue[state.currentIndex - 1];
      if (prevSong?.yt_video_id && playerRef.current) {
        playerRef.current.loadVideoById(prevSong.yt_video_id);
      }
    }
  };

  const seekTo = (seconds) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds);
    }
  };

  const toggleFullPlayer = () => {
    dispatch({ type: 'TOGGLE_FULL_PLAYER' });
  };

  const setFullPlayer = (isOpen) => {
    dispatch({ type: 'SET_FULL_PLAYER', payload: isOpen });
  };

  const value = {
    ...state,
    playSong,
    handlePlay,
    handleNext,
    handlePrevious,
    seekTo,
    toggleFullPlayer,
    setFullPlayer,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};