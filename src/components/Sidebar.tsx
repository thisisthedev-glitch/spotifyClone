import { Heart, Music, Search } from "lucide-react";
import { useState } from "react";
import { usePlaylists, useArtists, getArtistImage } from "@/hooks/useJamendoApi";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useLikedSongs } from "@/contexts/LikedSongsContext";
import { useNavigation } from "@/pages/Index";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState<'playlists' | 'artists'>('playlists');
  const { state } = useMusicPlayer();
  const { likedCount } = useLikedSongs();
  const { setCurrentView } = useNavigation();

  // API hooks
  const { data: playlists, isLoading: loadingPlaylists } = usePlaylists(15);
  const { data: artists, isLoading: loadingArtists } = useArtists(15);

  return (
    <div className="w-80 bg-[#121212] text-white h-full flex flex-col rounded-xl">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#a7a7a7] font-semibold">Your Library</h2>
        </div>

        {/* Filter tabs */}
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => setActiveTab('playlists')}
            className={`text-sm px-3 py-1 h-auto rounded-full inline-flex items-center justify-center ${
              activeTab === 'playlists' 
                ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]' 
                : 'text-[#a7a7a7] hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            Playlists
          </button>
          <button 
            onClick={() => setActiveTab('artists')}
            className={`text-sm px-3 py-1 h-auto rounded-full inline-flex items-center justify-center ${
              activeTab === 'artists' 
                ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]' 
                : 'text-[#a7a7a7] hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            Artists
          </button>
        </div>

        {/* Search and sort */}
        <div className="flex items-center justify-between mb-4">
          <button className="h-8 w-8 text-[#a7a7a7] hover:text-white hover:bg-[#1a1a1a] inline-flex items-center justify-center rounded">
            <Search className="h-4 w-4" />
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-[#a7a7a7] text-sm">Recents</span>
            <div className="flex flex-col space-y-1">
              <div className="w-3 h-0.5 bg-[#a7a7a7]"></div>
              <div className="w-3 h-0.5 bg-[#a7a7a7]"></div>
              <div className="w-3 h-0.5 bg-[#a7a7a7]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-2 overflow-y-auto">
        {(loadingPlaylists || loadingArtists) ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-[#a7a7a7] text-sm">Loading...</div>
          </div>
        ) : (
          <>
            {activeTab === 'playlists' && (
              <>
                {/* Liked Songs - Always first */}
                <div 
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer group transition-colors"
                  onClick={() => setCurrentView('liked-songs')}
                >
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-700 to-blue-300 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-white fill-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">Liked Songs</p>
                    <p className="text-[#a7a7a7] text-xs truncate">
                      Playlist • {likedCount} song{likedCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Real Playlists */}
                {playlists?.results.map((playlist, index) => (
                  <div 
                    key={playlist.id} 
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Music className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
                      <p className="text-[#a7a7a7] text-xs truncate">Playlist • {playlist.user_name}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'artists' && (
              <>
                {artists?.results.map((artist, index) => (
                  <div 
                    key={artist.id} 
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      {artist.image ? (
                        <img
                          src={getArtistImage(artist)}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.classList.add('bg-gradient-to-br', 'from-gray-600', 'to-gray-800');
                            target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{artist.name}</p>
                      <p className="text-[#a7a7a7] text-xs truncate">Artist</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
