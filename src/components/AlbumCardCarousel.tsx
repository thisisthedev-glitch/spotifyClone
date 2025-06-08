import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { JamendoAlbum } from "@/lib/jamendoApi";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

interface AlbumCardCarouselProps {
  albums: JamendoAlbum[];
  onCardHover?: (index: number) => void;
  onCardLeave?: () => void;
}

const AlbumCardCarousel: React.FC<AlbumCardCarouselProps> = ({ 
  albums, 
  onCardHover,
  onCardLeave
}) => {
  const { playQueue } = useMusicPlayer();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleAlbumClick = (album: JamendoAlbum, index: number) => {
    // For now, we'll play the album as a single track
    // In a real implementation, you might want to fetch album tracks
    const albumAsTrack = {
      id: album.id,
      name: album.name,
      artist_name: album.artist_name,
      artist_id: album.artist_id,
      album_name: album.name,
      album_id: album.id,
      duration: 240, // Default duration
      audio: `https://api.jamendo.com/v3.0/tracks/file/?client_id=${import.meta.env.VITE_JAMENDO_CLIENT_ID}&id=${album.id}&audioformat=mp31`,
      album_image: album.image,
      image: album.image,
      audiodownload: '',
      prourl: '',
      shorturl: album.shorturl,
      shareurl: album.shareurl,
      waveform: '',
      audiodownload_allowed: false
    };
    
    playQueue([albumAsTrack], 0);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200; // Width of one album card plus gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'right' ? scrollAmount : -scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {showLeftButton && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ transform: 'translateY(-50%) translateX(-50%)' }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightButton && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ transform: 'translateY(-50%) translateX(50%)' }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-4"
      >
        {albums.map((album, index) => (
          <div key={album.id} className="flex-shrink-0 w-[160px]">
            <div
              className="group bg-[#181818] hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 cursor-pointer"
              onClick={() => handleAlbumClick(album, index)}
              onMouseEnter={() => onCardHover?.(index + 10)} // Offset for different colors
              onMouseLeave={onCardLeave}
            >
              <div className="relative mb-3">
                <img
                  src={album.image || '/placeholder.svg'}
                  alt={album.name}
                  className="w-full aspect-square rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAlbumClick(album, index);
                  }}
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1db954] hover:bg-[#1ed760] rounded-full shadow-lg h-8 w-8 inline-flex items-center justify-center"
                >
                  <Play className="h-3 w-3 text-black fill-current" />
                </button>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white mb-1 truncate text-sm">{album.name}</h3>
                <p className="text-[#a7a7a7] text-xs truncate">{album.artist_name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumCardCarousel; 