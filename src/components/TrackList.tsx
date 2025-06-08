import { Play, Pause, MoreHorizontal, Clock } from "lucide-react";
import { JamendoTrack } from "@/lib/jamendoApi";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { formatDuration, getTrackImage } from "@/hooks/useJamendoApi";
import { LikedSong } from "@/contexts/LikedSongsContext";
import { formatRelativeTime } from "@/utils/dateUtils";
import HeartButton from "./HeartButton";

interface TrackListProps {
  tracks: (JamendoTrack | LikedSong)[];
  showHeader?: boolean;
  showAlbum?: boolean;
  showArtwork?: boolean;
  showDateAdded?: boolean;
  source?: 'liked-songs' | 'general';
}

const TrackList: React.FC<TrackListProps> = ({ 
  tracks, 
  showHeader = true, 
  showAlbum = true,
  showArtwork = false,
  showDateAdded = false,
  source = 'general'
}) => {
  const { state, playTrack, playQueue, togglePlay } = useMusicPlayer();

  const handlePlayTrack = (track: JamendoTrack | LikedSong, index: number) => {
    if (state.currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playQueue(tracks, index, source);
    }
  };

  const isCurrentTrack = (track: JamendoTrack | LikedSong) => state.currentTrack?.id === track.id;
  const isPlaying = (track: JamendoTrack | LikedSong) => isCurrentTrack(track) && state.isPlaying;
  
  const isLikedSong = (track: JamendoTrack | LikedSong): track is LikedSong => {
    return 'dateAdded' in track;
  };

  // Dynamic grid columns based on what we're showing
  const getGridCols = () => {
    if (showDateAdded && showAlbum) {
      return 'grid-cols-[16px_4fr_2fr_1fr_1fr_50px]'; // # Title Album DateAdded Duration Actions
    } else if (showAlbum) {
      return 'grid-cols-[16px_4fr_2fr_1fr_50px]'; // # Title Album Duration Actions
    } else {
      return 'grid-cols-[16px_5fr_1fr_50px]'; // # Title Duration Actions
    }
  };

  return (
    <div className="w-full">
      {showHeader && (
        <div className={`grid ${getGridCols()} gap-4 py-2 text-sm text-[#a7a7a7] border-b border-[#282828] mb-2`}>
          <div className="flex justify-center">#</div>
          <div>TITLE</div>
          {showAlbum && <div>ALBUM</div>}
          {showDateAdded && <div className="text-right">DATE ADDED</div>}
          <div className="flex justify-center">
            <Clock className="h-4 w-4" />
          </div>
          <div></div>
        </div>
      )}
      
      <div className="space-y-1">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className={`group w-full grid ${getGridCols()} gap-4 py-2  rounded hover:bg-[#1a1a1a] transition-colors cursor-pointer ${
              isCurrentTrack(track) ? 'bg-[#1a1a1a]' : ''
            }`}
            onClick={() => handlePlayTrack(track, index)}
          >
            {/* Track Number / Play Button */}
            <div className="flex items-center justify-center text-[#a7a7a7] group-hover:text-white">
              <span className={`text-sm ${isCurrentTrack(track) ? 'text-[#1db954]' : ''} group-hover:hidden`}>
                {isCurrentTrack(track) && state.isPlaying ? (
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-3 bg-[#1db954] animate-pulse"></div>
                    <div className="w-1 h-2 bg-[#1db954] animate-pulse delay-75"></div>
                    <div className="w-1 h-4 bg-[#1db954] animate-pulse delay-150"></div>
                  </div>
                ) : (
                  index + 1
                )}
              </span>
              <button
                className="hidden group-hover:flex h-8 w-8 rounded-full bg-transparent hover:bg-white/10 text-white items-center justify-center"
              >
                {isPlaying(track) ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0">
              {showArtwork && (
                <img
                  src={getTrackImage(track)}
                  alt={track.album_name}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div className="min-w-0">
                <div className={`font-medium truncate ${isCurrentTrack(track) ? 'text-[#1db954]' : 'text-white'}`}>
                  {track.name}
                </div>
                <div className="text-sm text-[#a7a7a7] truncate">
                  {track.artist_name}
                </div>
              </div>
            </div>

            {/* Album */}
            {showAlbum && (
              <div className="flex items-center text-sm text-[#a7a7a7] truncate">
                {track.album_name}
              </div>
            )}

            {/* Date Added */}
            {showDateAdded && (
              <div className="flex items-center justify-end text-sm text-[#a7a7a7]">
                {isLikedSong(track) ? formatRelativeTime(track.dateAdded) : '-'}
              </div>
            )}

            {/* Duration */}
            <div className="flex items-center justify-center text-sm text-[#a7a7a7]">
              {formatDuration(track.duration)}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div onClick={(e) => e.stopPropagation()}>
                <HeartButton 
                  track={track} 
                  size="sm" 
                  variant="ghost"
                />
              </div>
              <button
                className="h-8 w-8 text-[#a7a7a7] hover:text-white inline-flex items-center justify-center rounded hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  // More options functionality
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackList; 