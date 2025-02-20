export default async function handler(req, res) {
  try {
    // Last.fm 'user.getRecentTracks' can indicate nowplaying="true" if something is currently playing.
    // We'll fetch that endpoint and pick the first track if it's marked as now playing.
    const username = process.env.LASTFM_USERNAME;
    const apiKey = process.env.LASTFM_API_KEY;
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=5`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch from Last.fm' });
    }

    const data = await response.json();
    const recentTracks = data?.recenttracks?.track;

    if (!recentTracks || recentTracks.length === 0) {
      return res.status(200).json({ tracks: [] });
    }

    const tracks = recentTracks.map(track => ({
      title: track.name,
      artist: track.artist['#text'],
      album: track.album['#text'],
      coverArt: track.image?.[2]['#text'] || '', // medium-sized image
      isPlaying: track['@attr']?.nowplaying === 'true'
    }));

    res.status(200).json({ tracks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

