import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { JamendoTrack, jamendoApi } from '@/lib/jamendoApi';

interface MusicPlayerState {
  currentTrack: JamendoTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: JamendoTrack[];
  currentIndex: number;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  isLoadingMore: boolean;
  lastFetchOffset: number;
  queueSource: 'liked-songs' | 'general' | null;
}

type MusicPlayerAction =
  | { type: 'SET_TRACK'; payload: JamendoTrack }
  | { type: 'SET_QUEUE'; payload: { tracks: JamendoTrack[]; startIndex?: number; source?: 'liked-songs' | 'general' } }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'START_LOADING_MORE' }
  | { type: 'ADD_TRACKS_TO_QUEUE'; payload: JamendoTrack[] }
  | { type: 'SET_LAST_FETCH_OFFSET'; payload: number };

const initialState: MusicPlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  queue: [],
  currentIndex: 0,
  shuffle: false,
  repeat: 'none',
  isLoadingMore: false,
  lastFetchOffset: 0,
  queueSource: null,
};

function musicPlayerReducer(state: MusicPlayerState, action: MusicPlayerAction): MusicPlayerState {
  switch (action.type) {
    case 'SET_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        queue: state.queue.length === 0 ? [action.payload] : state.queue,
        currentIndex: state.queue.length === 0 ? 0 : state.currentIndex,
      };
    
    case 'SET_QUEUE':
      const startIndex = action.payload.startIndex ?? 0;
      return {
        ...state,
        queue: action.payload.tracks,
        currentIndex: startIndex,
        currentTrack: action.payload.tracks[startIndex] || null,
        queueSource: action.payload.source || 'general',
      };
    
    case 'PLAY':
      return { ...state, isPlaying: true };
    
    case 'PAUSE':
      return { ...state, isPlaying: false };
    
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    
    case 'SET_VOLUME':
      return { ...state, volume: Math.max(0, Math.min(1, action.payload)) };
    
    case 'NEXT_TRACK':
      if (state.queue.length === 0) return state;
      
      let nextIndex: number;
      
      if (state.repeat === 'one') {
        nextIndex = state.currentIndex;
      } else if (state.shuffle) {
        // Avoid playing the same track twice in a row when shuffling
        if (state.queue.length > 1) {
          do {
            nextIndex = Math.floor(Math.random() * state.queue.length);
          } while (nextIndex === state.currentIndex);
        } else {
          nextIndex = 0;
        }
      } else {
        nextIndex = state.currentIndex + 1;
        if (nextIndex >= state.queue.length) {
          if (state.repeat === 'all') {
            nextIndex = 0;
          } else {
            // With auto-loading, we should never reach here, but just in case
            // go back to the last available track
            nextIndex = Math.max(0, state.queue.length - 1);
          }
        }
      }
      
      return {
        ...state,
        currentIndex: nextIndex,
        currentTrack: state.queue[nextIndex],
        currentTime: 0,
      };
    
    case 'PREVIOUS_TRACK':
      if (state.queue.length === 0) return state;
      
      let prevIndex: number;
      if (state.currentTime > 3) {
        // If more than 3 seconds played, restart current track
        return { ...state, currentTime: 0 };
      } else {
        prevIndex = state.currentIndex - 1;
        if (prevIndex < 0) {
          prevIndex = state.repeat === 'all' ? state.queue.length - 1 : 0;
        }
      }
      
      return {
        ...state,
        currentIndex: prevIndex,
        currentTrack: state.queue[prevIndex],
        currentTime: 0,
      };
    
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    
    case 'TOGGLE_REPEAT':
      const repeatStates: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
      const currentRepeatIndex = repeatStates.indexOf(state.repeat);
      const nextRepeatIndex = (currentRepeatIndex + 1) % repeatStates.length;
      return { ...state, repeat: repeatStates[nextRepeatIndex] };
    
    case 'SET_CURRENT_INDEX':
      if (action.payload >= 0 && action.payload < state.queue.length) {
        return {
          ...state,
          currentIndex: action.payload,
          currentTrack: state.queue[action.payload],
          currentTime: 0,
        };
      }
      return state;
    
    case 'START_LOADING_MORE':
      return { ...state, isLoadingMore: true };
    
    case 'ADD_TRACKS_TO_QUEUE':
      return { 
        ...state, 
        queue: [...state.queue, ...action.payload],
        isLoadingMore: false,
      };
    
    case 'SET_LAST_FETCH_OFFSET':
      return { ...state, lastFetchOffset: action.payload };
    
    default:
      return state;
  }
}

interface MusicPlayerContextType {
  state: MusicPlayerState;
  dispatch: React.Dispatch<MusicPlayerAction>;
  audioRef: React.RefObject<HTMLAudioElement>;
  playTrack: (track: JamendoTrack) => void;
  playQueue: (tracks: JamendoTrack[], startIndex?: number, source?: 'liked-songs' | 'general') => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  loadMoreTracks: () => Promise<void>;
  loadInitialRandomSongs: () => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(musicPlayerReducer, initialState);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load random songs on initial app load (but don't play them)
  const loadInitialRandomSongs = async () => {
    try {
      // Get a random offset to fetch different songs each time
      const randomOffset = Math.floor(Math.random() * 100);
      
      const response = await jamendoApi.getTracks({
        order: 'popularity_total',
        limit: 20,
        offset: randomOffset,
      });
      
      if (response.results && response.results.length > 0) {
        // Shuffle the results for more randomness
        const shuffledTracks = [...response.results].sort(() => Math.random() - 0.5);
        
        dispatch({ 
          type: 'SET_QUEUE', 
          payload: { 
            tracks: shuffledTracks, 
            startIndex: 0, 
            source: 'general' 
          } 
        });
        dispatch({ type: 'SET_LAST_FETCH_OFFSET', payload: randomOffset });
        
        console.log('Loaded initial random songs:', shuffledTracks.length);
      }
    } catch (error) {
      console.error('Failed to load initial random songs:', error);
    }
  };

  // Load initial random songs on app start (only once)
  useEffect(() => {
    loadInitialRandomSongs();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Auto-load more tracks when approaching end of queue
  const loadMoreTracks = async () => {
    if (state.isLoadingMore) return;
    
    try {
      dispatch({ type: 'START_LOADING_MORE' });
      
      // Fetch more popular tracks with offset
      const response = await jamendoApi.getTracks({
        order: 'popularity_total',
        limit: 20,
        offset: state.lastFetchOffset + 20,
      });
      
      if (response.results && response.results.length > 0) {
        dispatch({ type: 'ADD_TRACKS_TO_QUEUE', payload: response.results });
        dispatch({ type: 'SET_LAST_FETCH_OFFSET', payload: state.lastFetchOffset + 20 });
      }
    } catch (error) {
      console.error('Failed to load more tracks:', error);
      dispatch({ type: 'START_LOADING_MORE' }); // Reset loading state
    }
  };

  // Check if we need to load more tracks - only for non-liked-songs queues
  useEffect(() => {
    const tracksRemaining = state.queue.length - state.currentIndex;
    const shouldLoadMore = tracksRemaining <= 5 && 
                          !state.isLoadingMore && 
                          state.queue.length > 0 && 
                          state.queueSource !== 'liked-songs';
    
    if (shouldLoadMore) {
      loadMoreTracks();
    }
  }, [state.currentIndex, state.queue.length, state.isLoadingMore, state.queueSource]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
    };

    const handleDurationChange = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration || 0 });
    };

    const handleEnded = () => {
      dispatch({ type: 'NEXT_TRACK' });
    };

    const handlePlay = () => {
      dispatch({ type: 'PLAY' });
    };

    const handlePause = () => {
      dispatch({ type: 'PAUSE' });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && state.currentTrack) {
      const wasPlaying = state.isPlaying;
      audio.src = state.currentTrack.audio;
      audio.volume = state.volume;
      
      // Wait for audio to be ready before playing
      const handleCanPlay = () => {
        if (wasPlaying) {
          audio.play().catch(console.error);
        }
        audio.removeEventListener('canplay', handleCanPlay);
      };
      
      audio.addEventListener('canplay', handleCanPlay);
      
      // Fallback in case canplay doesn't fire
      setTimeout(() => {
        if (wasPlaying && audio.paused) {
          audio.play().catch(console.error);
        }
        audio.removeEventListener('canplay', handleCanPlay);
      }, 1000);
    }
  }, [state.currentTrack]);

  // Update volume separately without reloading audio
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !isNaN(state.volume)) {
      audio.volume = state.volume;
    }
  }, [state.volume]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);

  const playTrack = async (track: JamendoTrack) => {
    dispatch({ type: 'SET_TRACK', payload: track });
    
    // If this is the first track and we don't have a proper queue, start auto-loading
    if (state.queue.length <= 1) {
      try {
        const response = await jamendoApi.getTracks({
          order: 'popularity_total',
          limit: 20,
          offset: 0,
        });
        
        if (response.results && response.results.length > 0) {
          // Add current track at the beginning if it's not already in the results
          const tracksToAdd = response.results.find(t => t.id === track.id) 
            ? response.results 
            : [track, ...response.results];
          
          dispatch({ type: 'SET_QUEUE', payload: { tracks: tracksToAdd, startIndex: 0, source: 'general' } });
          dispatch({ type: 'SET_LAST_FETCH_OFFSET', payload: 0 });
        }
      } catch (error) {
        console.error('Failed to initialize queue:', error);
      }
    }
    
    dispatch({ type: 'PLAY' });
  };

  const playQueue = (tracks: JamendoTrack[], startIndex = 0, source: 'liked-songs' | 'general' = 'general') => {
    dispatch({ type: 'SET_QUEUE', payload: { tracks, startIndex, source } });
    dispatch({ type: 'SET_LAST_FETCH_OFFSET', payload: 0 }); // Reset offset for new queue
    dispatch({ type: 'PLAY' });
  };

  const togglePlay = () => {
    dispatch({ type: 'TOGGLE_PLAY' });
  };

  const nextTrack = () => {
    dispatch({ type: 'NEXT_TRACK' });
  };

  const previousTrack = () => {
    dispatch({ type: 'PREVIOUS_TRACK' });
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      dispatch({ type: 'SET_CURRENT_TIME', payload: time });
    }
  };

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    const audio = audioRef.current;
    if (audio) {
      audio.volume = clampedVolume;
    }
    dispatch({ type: 'SET_VOLUME', payload: clampedVolume });
  };

  const toggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  const toggleRepeat = () => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  };

  const contextValue: MusicPlayerContextType = {
    state,
    dispatch,
    audioRef,
    playTrack,
    playQueue,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    loadMoreTracks,
    loadInitialRandomSongs,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}; 