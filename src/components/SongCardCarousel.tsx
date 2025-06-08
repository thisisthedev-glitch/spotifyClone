import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { JamendoTrack } from "@/lib/jamendoApi";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import SongCard from "./SongCard";

interface SongCardCarouselProps {
  tracks: JamendoTrack[];
  onCardHover?: (index: number) => void;
  onCardLeave?: () => void;
}

const SongCardCarousel: React.FC<SongCardCarouselProps> = ({ 
  tracks, 
  onCardLeave
}) => {
  const { playQueue, togglePlay, state } = useMusicPlayer();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleTrackClick = (track: JamendoTrack, index: number) => {
    if (state.currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playQueue(tracks, index);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
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
        {tracks.map((track, index) => (
          <div key={track.id} className="flex-shrink-0 w-[180px]">
            <SongCard
              track={track}
              index={index}
              onLeave={onCardLeave}
              onClick={handleTrackClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongCardCarousel; 