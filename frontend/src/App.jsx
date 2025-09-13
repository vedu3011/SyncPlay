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
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import PlaylistView from "./pages/PlaylistView.jsx";
import JamUI from "./pages/JamUI.jsx";
import { Toaster } from "react-hot-toast";
import Rooms from "./pages/Rooms";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import RoomView from "./pages/RoomView";



// Create placeholder components for missing pages




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
        <Toaster position="top-right" />
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
        
        <Route path="/chat" element={<RequireAuth><MainLayout><ChatList /></MainLayout></RequireAuth>} />
        <Route path="/chat/:fid" element={<RequireAuth><MainLayout><ChatRoom /></MainLayout></RequireAuth>} />
        {/* <Route path="/playlist/:id" element={<RequireAuth><MainLayout><PlaylistView /></MainLayout></RequireAuth>} /> */}
        <Route
  path="/jam/playlists/by_friendship/:id"
  element={
    <RequireAuth>
      <MainLayout>
        <PlaylistView /> {/* Or create a new JamFriendshipPlaylist component */}
      </MainLayout>
    </RequireAuth>
  }
/>
          <Route path="/rooms" element={<RequireAuth><MainLayout><Rooms /></MainLayout></RequireAuth>} />
        <Route path="/rooms/create" element={<RequireAuth><MainLayout><CreateRoom /></MainLayout></RequireAuth>} />
        <Route path="/rooms/join" element={<RequireAuth><MainLayout><JoinRoom /></MainLayout></RequireAuth>} />
        <Route path="/rooms/:roomId" element={<RequireAuth><MainLayout><RoomView /></MainLayout></RequireAuth>} />

          {/* Fallback route */}
          {/* <Route path="*" element={<Navigate to="/" />} /> */}
        </Routes>
      </PlayerProvider>
    </BrowserRouter>
  );
}