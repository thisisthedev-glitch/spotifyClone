export interface JamendoTrack {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  artist_id: string;
  album_name: string;
  album_id: string;
  album_image: string;
  audio: string;
  audiodownload: string;
  prourl: string;
  shorturl: string;
  shareurl: string;
  waveform: string;
  image: string;
  audiodownload_allowed: boolean;
}

export interface JamendoAlbum {
  id: string;
  name: string;
  releasedate: string;
  artist_name: string;
  artist_id: string;
  image: string;
  zip: string;
  shorturl: string;
  shareurl: string;
}

export interface JamendoArtist {
  id: string;
  name: string;
  website: string;
  joindate: string;
  image: string;
  shorturl: string;
  shareurl: string;
}

export interface JamendoPlaylist {
  id: string;
  name: string;
  creationdate: string;
  user_name: string;
  user_id: string;
}

export interface JamendoRadio {
  id: string;
  name: string;
  dispname: string;
  stream: string;
  callmeback: string;
  image: string;
}

export interface JamendoApiResponse<T> {
  headers: {
    status: string;
    code: number;
    error_message?: string;
    warnings?: string;
    results_count: number;
  };
  results: T[];
}

class JamendoApi {
  private readonly baseUrl = 'https://api.jamendo.com/v3.0';
  private readonly clientId: string;

  constructor(clientId: string = 'default') {
    this.clientId = clientId;
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string | number | boolean> = {}
  ): Promise<JamendoApiResponse<T>> {
    const urlParams = new URLSearchParams({
      client_id: this.clientId,
      format: 'json',
      limit: '50',
      ...Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, value.toString()])
      ),
    });

    const response = await fetch(`${this.baseUrl}/${endpoint}/?${urlParams}`);
    
    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.status}`);
    }

    return response.json();
  }

  // Tracks methods
  async getTracks(params: {
    order?: 'popularity_total' | 'popularity_month' | 'popularity_week' | 'releasedate' | 'name';
    tags?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<JamendoApiResponse<JamendoTrack>> {
    return this.makeRequest<JamendoTrack>('tracks', {
      ...params,
      audioformat: 'mp32',
      include: 'musicinfo',
    });
  }

  async getTrackById(id: string): Promise<JamendoApiResponse<JamendoTrack>> {
    return this.makeRequest<JamendoTrack>('tracks', {
      id,
      audioformat: 'mp32',
      include: 'musicinfo',
    });
  }

  async searchTracks(query: string, limit: number = 20): Promise<JamendoApiResponse<JamendoTrack>> {
    return this.makeRequest<JamendoTrack>('tracks', {
      search: query,
      audioformat: 'mp32',
      limit,
      include: 'musicinfo',
    });
  }

  // Albums methods
  async getAlbums(params: {
    order?: 'popularity_total' | 'popularity_month' | 'releasedate' | 'name';
    tags?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<JamendoApiResponse<JamendoAlbum>> {
    return this.makeRequest<JamendoAlbum>('albums', params);
  }

  async getAlbumTracks(albumId: string): Promise<JamendoApiResponse<JamendoTrack>> {
    return this.makeRequest<JamendoTrack>('albums/tracks', {
      id: albumId,
      audioformat: 'mp32',
      include: 'musicinfo',
    });
  }

  // Artists methods
  async getArtists(params: {
    order?: 'popularity_total' | 'popularity_month' | 'joindate' | 'name';
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<JamendoApiResponse<JamendoArtist>> {
    return this.makeRequest<JamendoArtist>('artists', params);
  }

  async getArtistTracks(artistId: string, limit: number = 20): Promise<JamendoApiResponse<JamendoTrack>> {
    return this.makeRequest<JamendoTrack>('artists/tracks', {
      id: artistId,
      audioformat: 'mp32',
      limit,
      include: 'musicinfo',
    });
  }

  async getArtistAlbums(artistId: string, limit: number = 20): Promise<JamendoApiResponse<JamendoAlbum>> {
    return this.makeRequest<JamendoAlbum>('artists/albums', {
      id: artistId,
      limit,
    });
  }

  // Playlists methods
  async getPlaylists(params: {
    order?: 'popularity_total' | 'popularity_month' | 'creationdate' | 'name';
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<JamendoApiResponse<JamendoPlaylist>> {
    return this.makeRequest<JamendoPlaylist>('playlists', params);
  }

  async getPlaylistTracks(playlistId: string): Promise<JamendoApiResponse<JamendoTrack>> {
    return this.makeRequest<JamendoTrack>('playlists/tracks', {
      id: playlistId,
      audioformat: 'mp32',
      include: 'musicinfo',
    });
  }

  // Radios methods
  async getRadios(): Promise<JamendoApiResponse<JamendoRadio>> {
    return this.makeRequest<JamendoRadio>('radios');
  }

  async getRadioStream(radioId: string): Promise<JamendoApiResponse<{ stream: string }>> {
    return this.makeRequest<{ stream: string }>('radios/stream', {
      id: radioId,
    });
  }

  // Featured content
  async getFeaturedTracks(limit: number = 20): Promise<JamendoApiResponse<JamendoTrack>> {
    return this.getTracks({
      featured: true,
      order: 'popularity_total',
      limit,
    });
  }

  async getPopularTracks(limit: number = 20): Promise<JamendoApiResponse<JamendoTrack>> {
    return this.getTracks({
      order: 'popularity_total',
      limit,
    });
  }

  async getNewReleases(limit: number = 20): Promise<JamendoApiResponse<JamendoTrack>> {
    return this.getTracks({
      order: 'releasedate',
      limit,
    });
  }

  // Genre-based discovery
  async getTracksByGenre(genre: string, limit: number = 20): Promise<JamendoApiResponse<JamendoTrack>> {
    return this.getTracks({
      tags: genre,
      order: 'popularity_total',
      limit,
    });
  }

  // Autocomplete for search
  async getAutocomplete(query: string): Promise<JamendoApiResponse<{ name: string }>> {
    return this.makeRequest<{ name: string }>('autocomplete', {
      prefix: query,
      entity: 'artist',
    });
  }
}

// Create a singleton instance
export const jamendoApi = new JamendoApi(import.meta.env.VITE_JAMENDO_CLIENT_ID);

export default jamendoApi; 