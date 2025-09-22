import React, { useState, useEffect } from "react";
import { getSearchResults } from "../lib/api";
import { Link } from "react-router-dom";
import { usePlayer } from '../contexts/PlayerContext';
import { IoSearch } from "react-icons/io5";


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
    <h2 className="text-lg font-bold mt-6 mb-[4px]">{children}</h2>
  );

  return (
    <div className="min-h-screen w-screen bg-[#010101] text-white p-[12px] flex flex-col">
      {/* <div className="w-screen flex flex-col items-center"> */}
      <div className="w-full p-[8px] my-[8px] border border-bg-[#555] bg-[#101010] flex justify-between items-center"  style={{ borderRadius: '12px' }}>
      <input
        type="search"
        placeholder="Search artists, songs, playlists..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="text-white bg-transparent outline-none flex-1"
        autoFocus
      />
      <IoSearch className="text-[#dd2476] w-[20px] h-[20px]"/>
      </div>
      {/* </div> */}
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          {data.artists.length > 0 && (
            <>
              <SectionTitle>Artists</SectionTitle>
              <div className="flex gap-[8px] overflow-x-auto w-full p-[4px] mb-[12px]" 
            style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }`}</style>
                {data.artists.map((a, idx) => (
                  <Link
                    to={`/artist/${a.browse_id}`}
                    key={idx}
                    className="flex flex-col items-center min-w-[70px]"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#fff]">
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
                    <p className="text-xs mt-2 max-w-[70px] truncate text-center text-[#ffffff]">
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
              <div className="flex flex-col gap-[8px] mb-[12px]">
                {data.songs.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden flex items-center gap-[4px]"
                    onClick={() => playSong(s, { type: 'search', songs: data.songs })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="w-[64px] h-[64px] bg-gray-700 flex-shrink-0">
                      {s.thumbnail_url && (
                        <img
                          src={s.thumbnail_url}
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-3 flex-1 min-w-0">
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
              <div className="flex gap-[8px] overflow-x-auto pb-[96px]"
              style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
               }`}</style>
                {data.playlists.map((p, idx) => (
                  <Link
                    to={`/playlist/${p.id}`}
                    key={idx}
                    className="bg-[#0E1516] rounded-xl overflow-hidden w-[160px] shrink-0"
                  >
                    <div className="w-full h-[160px] bg-gray-700">
                      {p.cover_url && (
                        <img
                          src={p.cover_url}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-[8px] text-[#fff]">
                      <p className="text-sm font-semibold truncate">{p.title}</p>
                      <p className="text-xs text-gray-400 truncate hidden">
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
