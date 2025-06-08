import { Play } from "lucide-react";
import { useState, useEffect } from "react";
import TrackList from "./TrackList";
import SongCardGrid from "./SongCardGrid";
import SongCardCarousel from "./SongCardCarousel";
import AlbumCardCarousel from "./AlbumCardCarousel";
import { usePopularTracks, useFeaturedTracks, useNewReleases, useSearchTracks, useAlbums } from "@/hooks/useJamendoApi";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

interface MainContentProps {
  searchQuery: string;
}

type TabType = 'all' | 'music' | 'albums';

const MainContent = ({ searchQuery }: MainContentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [currentOverlayGradient, setCurrentOverlayGradient] = useState('');
  const { playQueue } = useMusicPlayer();

  // Predefined gradient colors for different hover states
  const gradientOverlays = [
    'linear-gradient(to bottom, rgba(42, 31, 61, 0.8), rgba(31, 26, 46, 0.6), rgba(18, 18, 18, 0))', // Bright Purple
    'linear-gradient(to bottom, rgba(45, 27, 27, 0.8), rgba(36, 24, 24, 0.6), rgba(18, 18, 18, 0))', // Bright Red
    'linear-gradient(to bottom, rgba(27, 45, 31, 0.8), rgba(24, 36, 25, 0.6), rgba(18, 18, 18, 0))', // Bright Green
    'linear-gradient(to bottom, rgba(45, 36, 27, 0.8), rgba(36, 31, 24, 0.6), rgba(18, 18, 18, 0))', // Bright Orange
    'linear-gradient(to bottom, rgba(27, 36, 45, 0.8), rgba(24, 31, 36, 0.6), rgba(18, 18, 18, 0))', // Bright Blue
    'linear-gradient(to bottom, rgba(45, 33, 27, 0.8), rgba(36, 28, 24, 0.6), rgba(18, 18, 18, 0))', // Bright Brown
    'linear-gradient(to bottom, rgba(45, 27, 36, 0.8), rgba(36, 24, 31, 0.6), rgba(18, 18, 18, 0))', // Bright Pink
    'linear-gradient(to bottom, rgba(33, 27, 45, 0.8), rgba(28, 24, 36, 0.6), rgba(18, 18, 18, 0))', // Bright Indigo
    'linear-gradient(to bottom, rgba(31, 45, 27, 0.8), rgba(26, 36, 24, 0.6), rgba(18, 18, 18, 0))', // Bright Emerald
    'linear-gradient(to bottom, rgba(45, 27, 42, 0.8), rgba(36, 24, 33, 0.6), rgba(18, 18, 18, 0))', // Bright Magenta
  ];

  const handleCardHover = (index: number) => {
    const colorIndex = index % gradientOverlays.length;
    setCurrentOverlayGradient(gradientOverlays[colorIndex]);
    setOverlayOpacity(1);
  };

  const handleCardLeave = () => {
    setOverlayOpacity(0);
  };



  // API hooks
  const { data: popularTracks, isLoading: loadingPopular } = usePopularTracks(12);
  const { data: featuredTracks, isLoading: loadingFeatured } = useFeaturedTracks(50);
  const { data: newReleases, isLoading: loadingNew } = useNewReleases(10);
  const { data: albums, isLoading: loadingAlbums } = useAlbums(20);
  const { data: searchResults, isLoading: loadingSearch, error: searchError } = useSearchTracks(searchQuery, searchQuery.length > 0);

  const quickPlayTracks = popularTracks?.results.slice(0, 6) || [];
  
  const handlePlayAlbum = (tracks: any[]) => {
    if (tracks.length > 0) {
      playQueue(tracks);
    }
  };

  return (
    <div 
      className="flex-1 text-white overflow-y-auto rounded-xl relative bg-[#121212]"
    >
      {/* Color overlay that fades in/out */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: currentOverlayGradient,
          opacity: overlayOpacity,
          transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      ></div>
      
      <div className="min-h-full relative">
        <main className="p-6 relative z-10">
          {/* Filter tabs */}
          <div className="flex space-x-2 mb-6">
            <button 
              className={`rounded-full px-4 py-2 text-sm font-medium inline-flex items-center justify-center ${
                activeTab === 'all' 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`rounded-full px-4 py-2 text-sm inline-flex items-center justify-center ${
                activeTab === 'music'
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
              }`}
              onClick={() => setActiveTab('music')}
            >
              Music
            </button>
            <button 
              className={`rounded-full px-4 py-2 text-sm inline-flex items-center justify-center ${
                activeTab === 'albums'
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
              }`}
              onClick={() => setActiveTab('albums')}
            >
              Albums
            </button>
          </div>

          {/* Search Results */}
          {searchQuery && searchQuery.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Search Results</h2>
              {loadingSearch ? (
                <div className="text-center py-8">
                  <div className="text-[#a7a7a7]">Searching...</div>
                </div>
              ) : searchError ? (
                <div className="text-center py-8">
                  <div className="text-[#ff6b6b]">Error searching: {searchError.message}</div>
                  <p className="text-[#a7a7a7] mt-2">Please try again</p>
                </div>
              ) : searchResults && searchResults.results.length > 0 ? (
                <SongCardGrid 
                  tracks={searchResults.results} 
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-[#a7a7a7]">No results found for "{searchQuery}"</div>
                </div>
              )}
            </section>
          )}

          {/* Quick Play Grid - Only show when not searching */}
          {!searchQuery && (
            <section className="mb-8">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                              {quickPlayTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4 transition-all duration-300 cursor-pointer"
                  onClick={() => handlePlayAlbum([track])}
                  onMouseEnter={() => handleCardHover(index)}
                  onMouseLeave={handleCardLeave}
                >
                    <img
                      src={track.album_image || track.image || '/placeholder.svg'}
                      alt={track.name}
                      className="w-12 h-12 rounded object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{track.name}</h3>
                      <p className="text-sm text-white/70 truncate">{track.artist_name}</p>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1db954] hover:bg-[#1ed760] rounded-full h-10 w-10 inline-flex items-center justify-center"
                    >
                      <Play className="h-4 w-4 text-black fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Content based on active tab */}
          {!searchQuery && activeTab === 'all' && (
            <>
              {/* Featured Tracks */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Featured Tracks</h2>
                  <button
                    className="text-[#a7a7a7] hover:text-white text-sm font-semibold hover:bg-[#1a1a1a] px-3 py-1 rounded inline-flex items-center justify-center"
                  >
                    Show all
                  </button>
                </div>
                {loadingFeatured ? (
                  <div className="text-center py-8">
                    <div className="text-[#a7a7a7]">Loading featured tracks...</div>
                  </div>
                ) : featuredTracks?.results ? (
                  <SongCardCarousel 
                    tracks={featuredTracks.results} 
                    onCardLeave={handleCardLeave}
                  />
                ) : null}
              </section>

              {/* Popular Albums */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Popular Albums</h2>
                  <button
                    className="text-[#a7a7a7] hover:text-white text-sm font-semibold hover:bg-[#1a1a1a] px-3 py-1 rounded inline-flex items-center justify-center"
                  >
                    Show all
                  </button>
                </div>
                {loadingAlbums ? (
                  <div className="text-center py-8">
                    <div className="text-[#a7a7a7]">Loading albums...</div>
                  </div>
                ) : albums?.results ? (
                  <AlbumCardCarousel 
                    albums={albums.results} 
                    onCardHover={handleCardHover}
                    onCardLeave={handleCardLeave}
                  />
                ) : null}
              </section>
            </>
          )}

          {/* Music Tab Content */}
          {!searchQuery && activeTab === 'music' && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Popular Tracks</h2>
              </div>
              {loadingPopular ? (
                <div className="text-center py-8">
                  <div className="text-[#a7a7a7]">Loading tracks...</div>
                </div>
              ) : popularTracks?.results ? (
                <SongCardGrid 
                  tracks={popularTracks.results} 
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              ) : null}
            </section>
          )}

          {/* Albums Tab Content */}
          {!searchQuery && activeTab === 'albums' && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">New Releases</h2>
              </div>
              {loadingNew ? (
                <div className="text-center py-8">
                  <div className="text-[#a7a7a7]">Loading new releases...</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {newReleases?.results.map((track, index) => (
                    <div
                      key={track.id}
                      className="group bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-all duration-300 cursor-pointer"
                      onClick={() => handlePlayAlbum([track])}
                      onMouseEnter={() => handleCardHover(index + 20)} // Different offset for variety
                      onMouseLeave={handleCardLeave}
                    >
                      <div className="relative mb-4">
                        <img
                          src={track.album_image || track.image || '/placeholder.svg'}
                          alt={track.album_name}
                          className="w-full aspect-square rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        <button
                          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1db954] hover:bg-[#1ed760] rounded-full shadow-lg h-10 w-10 inline-flex items-center justify-center"
                        >
                          <Play className="h-4 w-4 text-black fill-current" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-white mb-2 truncate">{track.name}</h3>
                      <p className="text-[#a7a7a7] text-sm truncate">{track.artist_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default MainContent;
