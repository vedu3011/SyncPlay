import React, { useState, useEffect } from "react";
import { getSearchResults } from "../lib/api";
import { Link } from "react-router-dom";
import { usePlayer } from '../contexts/PlayerContext';


function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300); // 300ms debounce
  const [data, setData] = useState({ artists: [], songs: [], playlists: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { playSong } = usePlayer();


  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setData({ artists: [], songs: [], playlists: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    getSearchResults(debouncedQuery)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const SectionTitle = ({ children }) => (
    <h2 className="text-base font-semibold mt-6 mb-3">{children}</h2>
  );

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white p-4">
      <input
        type="search"
        placeholder="Search artists, songs, playlists..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 rounded-md bg-[#222733] text-white"
        autoFocus
      />
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          {data.artists.length > 0 && (
            <>
              <SectionTitle>Artists</SectionTitle>
              <div className="flex gap-4 overflow-x-auto">
                {data.artists.map((a, idx) => (
                  <Link
                    to={`/artist/${a.browse_id}`}
                    key={idx}
                    className="flex flex-col items-center min-w-[70px]"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-700">
                      {a.image_url ? (
                        <img
                          src={a.image_url}
                          alt={a.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#222733]" />
                      )}
                    </div>
                    <p className="text-xs mt-2 max-w-[70px] truncate text-center">
                      {a.name}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}

          {data.songs.length > 0 && (
            <>
              <SectionTitle>Songs</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                {data.songs.map((s, idx) => (
                  <div
                    key={idx}
                    className="bg-[#161a23] rounded-xl overflow-hidden"
                    onClick={() => playSong(s, { type: 'search', songs: data.songs })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="w-full h-24 bg-gray-700">
                      {s.thumbnail_url && (
                        <img
                          src={s.thumbnail_url}
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-semibold truncate">{s.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {s.artist_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {data.playlists.length > 0 && (
            <>
              <SectionTitle>Playlists</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                {data.playlists.map((p, idx) => (
                  <Link
                    to={`/playlist/${p.id}`}
                    key={idx}
                    className="bg-[#161a23] rounded-xl overflow-hidden"
                  >
                    <div className="w-full h-24 bg-gray-700">
                      {p.cover_url && (
                        <img
                          src={p.cover_url}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-semibold truncate">{p.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {p.track_count} songs
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {!data.artists.length &&
            !data.songs.length &&
            !data.playlists.length && <p>No results found</p>}
        </>
      )}
    </div>
  );
}
