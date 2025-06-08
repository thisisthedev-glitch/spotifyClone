import { Play } from "lucide-react";
import { JamendoTrack } from "@/lib/jamendoApi";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { getTrackImage } from "@/hooks/useJamendoApi";

interface SongCardProps {
  track: JamendoTrack;
  index: number;
  onHover?: (index: number) => void;
  onLeave?: () => void;
  onClick?: (track: JamendoTrack, index: number) => void;
}

const SongCard: React.FC<SongCardProps> = ({
  track,
  index,
  onHover,
  onLeave,
  onClick,
}) => {
  const { state } = useMusicPlayer();

  const handleClick = () => {
    if (onClick) {
      onClick(track, index);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(track, index);
    }
  };

  const isCurrentTrack = state.currentTrack?.id === track.id;

  return (
    <div
      className="group  hover:bg-[#282828] rounded-lg p-4 transition-all duration-300 cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={onLeave}
    >
      <div className="relative mb-4">
        <img
          src={getTrackImage(track)}
          alt={track.name}
          className="w-full aspect-square rounded-lg object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        <button
          onClick={handlePlayClick}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1db954] hover:bg-[#1ed760] rounded-full shadow-lg h-10 w-10 inline-flex items-center justify-center"
        >
          <Play className="h-4 w-4 text-black fill-current" />
        </button>
      </div>
      <div className="min-w-0">
        <h3
          className={`font-semibold mb-2 truncate ${
            isCurrentTrack ? "text-[#1db954]" : "text-white"
          }`}
        >
          {track.name}
        </h3>
        <p className="text-[#a7a7a7] text-sm truncate">{track.artist_name}</p>
      </div>
    </div>
  );
};

export default SongCard;
