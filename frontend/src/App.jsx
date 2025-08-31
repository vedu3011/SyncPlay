// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PlayerProvider } from "./contexts/PlayerContext";
import { usePlayer } from './contexts/PlayerContext';
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import SelectArtists from "./pages/SelectArtists";
import SelectGenres from "./pages/SelectGenres";
import BottomNav from "./components/BottomNav";
import MiniPlayer from "./components/MiniPlayer";
import FullPlayer from "./components/FullPlayer";
import Home from "./pages/Home";
import PlaylistDetail from "./pages/PlaylistDetail";
import ArtistDetail from "./pages/ArtistDetail";
import Search from "./pages/Search.jsx";
import PlaylistsPage from "./pages/PlaylistsPage";
import MyPlaylistDetail from "./pages/MyPlaylistDetail"; 

// Create placeholder components for missing pages
const Chat = () => <div className="p-4">Chat Page - Coming Soon</div>;
const Rooms = () => <div className="p-4">Rooms Page - Coming Soon</div>;


const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/signin" replace />;
};

function MainLayout({ children }) {
  const { isFullPlayerOpen } = usePlayer();

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white relative">
      {/* Main content */}
      <div className="pb-20">{children}</div>

      {/* MiniPlayer - show when full player is closed */}
      <MiniPlayer />

      {/* BottomNav - always visible */}
      <BottomNav />
      
      {/* Full Player - renders on top when open */}
      <FullPlayer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/artists" element={<SelectArtists />} />
          <Route path="/genres" element={<SelectGenres />} />
          
          {/* Authenticated routes with BottomNav and Player */}
          <Route
            path="/home"
            element={
              <RequireAuth>
                <MainLayout>
                  <Home />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/search"
            element={
              <RequireAuth>
                <MainLayout>
                  <Search />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <MainLayout>
                  <Chat />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/rooms"
            element={
              <RequireAuth>
                <MainLayout>
                  <Rooms />
                </MainLayout>
              </RequireAuth>
            }
          />
          
          
          {/* Detail pages */}
          <Route
            path="/playlist/:id"
            element={
              <RequireAuth>
                <MainLayout>
                  <PlaylistDetail />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/artist/:id"
            element={
              <RequireAuth>
                <MainLayout>
                  <ArtistDetail />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route path="/playlists" element={<RequireAuth><MainLayout><PlaylistsPage /></MainLayout></RequireAuth>} />
        <Route path="/my-playlist/:id" element={<RequireAuth><MainLayout><MyPlaylistDetail /></MainLayout></RequireAuth>} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </PlayerProvider>
    </BrowserRouter>
  );
}