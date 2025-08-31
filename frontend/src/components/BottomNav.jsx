import React from "react";
import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const containerStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60px",
    backgroundColor: "#222",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    color: "white",
    zIndex: 16000, // ensure above FullPlayer
    borderTop: "1px solid #444"
  };

  const linkStyle = {
    flex: 1,
    textAlign: "center",
    padding: "10px 0",
    color: "#aaa",
    textDecoration: "none",
    fontSize: "24px",
    userSelect: "none",
    transition: "color 0.2s, font-weight 0.2s"
  };

  return (
    <nav style={containerStyle}>
      <NavLink
        to="/home"
        style={({ isActive }) =>
          isActive
            ? { ...linkStyle, color: "white", fontWeight: "bold" }
            : linkStyle
        }
      >
        🏠
      </NavLink>
      <NavLink
        to="/search"
        style={({ isActive }) =>
          isActive
            ? { ...linkStyle, color: "white", fontWeight: "bold" }
            : linkStyle
        }
      >
        🔎
      </NavLink>
      <NavLink
        to="/chat"
        style={({ isActive }) =>
          isActive
            ? { ...linkStyle, color: "white", fontWeight: "bold" }
            : linkStyle
        }
      >
        💬
      </NavLink>
      <NavLink
        to="/rooms"
        style={({ isActive }) =>
          isActive
            ? { ...linkStyle, color: "white", fontWeight: "bold" }
            : linkStyle
        }
      >
        🧩
      </NavLink>
      <NavLink
        to="/playlists"
        style={({ isActive }) =>
          isActive
            ? { ...linkStyle, color: "white", fontWeight: "bold" }
            : linkStyle
        }
      >
        🎵
      </NavLink>
    </nav>
   
  );
}
