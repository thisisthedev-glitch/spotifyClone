import { useQuery } from '@tanstack/react-query';
import { jamendoApi, JamendoTrack, JamendoAlbum, JamendoArtist } from '@/lib/jamendoApi';

export const usePopularTracks = (limit: number = 20) => {
  return useQuery({
    queryKey: ['popularTracks', limit],
    queryFn: () => jamendoApi.getPopularTracks(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFeaturedTracks = (limit: number = 20) => {
  return useQuery({
    queryKey: ['featuredTracks', limit],
    queryFn: () => jamendoApi.getFeaturedTracks(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useNewReleases = (limit: number = 20) => {
  return useQuery({
    queryKey: ['newReleases', limit],
    queryFn: () => jamendoApi.getNewReleases(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useTracksByGenre = (genre: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['tracksByGenre', genre, limit],
    queryFn: () => jamendoApi.getTracksByGenre(genre, limit),
    enabled: !!genre,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSearchTracks = (query: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['searchTracks', query],
    queryFn: () => jamendoApi.searchTracks(query, 50),
    enabled: enabled && !!query && query.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAlbums = (limit: number = 20) => {
  return useQuery({
    queryKey: ['albums', limit],
    queryFn: () => jamendoApi.getAlbums({ 
      order: 'popularity_total',
      limit 
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useArtists = (limit: number = 20) => {
  return useQuery({
    queryKey: ['artists', limit],
    queryFn: () => jamendoApi.getArtists({ 
      order: 'popularity_total',
      limit 
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useArtistTracks = (artistId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['artistTracks', artistId],
    queryFn: () => jamendoApi.getArtistTracks(artistId),
    enabled: enabled && !!artistId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAlbumTracks = (albumId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['albumTracks', albumId],
    queryFn: () => jamendoApi.getAlbumTracks(albumId),
    enabled: enabled && !!albumId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useRadios = () => {
  return useQuery({
    queryKey: ['radios'],
    queryFn: () => jamendoApi.getRadios(),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

export const usePlaylists = (limit: number = 20) => {
  return useQuery({
    queryKey: ['playlists', limit],
    queryFn: () => jamendoApi.getPlaylists({ 
      order: 'popularity_total',
      limit 
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useRecommendedTracks = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recommendedTracks', limit],
    queryFn: () => jamendoApi.getTracks({ 
      order: 'popularity_week',
      limit,
      tags: 'electronic+rock+jazz'
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Helper function to format duration
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Helper function to get default image if none provided
export const getTrackImage = (track: JamendoTrack): string => {
  return track.album_image || track.image || '/placeholder.svg';
};

// Helper function to get artist image
export const getArtistImage = (artist: JamendoArtist): string => {
  return artist.image || '/placeholder.svg';
}; 