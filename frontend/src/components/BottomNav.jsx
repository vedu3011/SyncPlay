import React from "react";
import { NavLink } from "react-router-dom";
import { RiHome2Line } from "react-icons/ri";
import { IoSearch } from "react-icons/io5";
import { MdOutlineChat } from "react-icons/md";
import { RiUserCommunityLine } from "react-icons/ri";
import { TbPlaylist } from "react-icons/tb";

export default function BottomNav() {
  const containerStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60px",
    backgroundColor: "rgba(1, 1, 1, 0.9)",
    // background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Linear gradient
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    color: "white",
    zIndex: 16000, // ensure above FullPlayer
    borderTop: "2px solid #555"
  };

  const linkStyle = {
    textAlign: "center",
    // padding: "10px 0",
    color: "#aaa",
    textDecoration: "none",
    fontSize: "24px",
    userSelect: "none",
    transition: "color 0.2s, font-weight 0.2s"
  };

  return (
    <nav style={containerStyle} className="w-screen, px-[20px]">
      <NavLink
        to="/home"
        style={({ isActive }) =>
          isActive
            ? { ...linkStyle, color: "#dd2476"}
            : linkStyle
        }
      >
        <RiHome2Line />
      </NavLink>
      <NavLink
        to="/search"
        style={({ isActive }) =>
          isActive
            ? { ...linkStyle, color: "#dd2476"}
            : linkStyle
        }
      >
        <IoSearch />
      </NavLink>
      <NavLink
        to="/chat"
        style={({ isActive }) =>
          isActive
            ? { ...linkStyle, color: "#dd2476"}
            : linkStyle
        }
      >
        <MdOutlineChat />
      </NavLink>
      <NavLink
        to="/rooms"
        style={({ isActive }) =>
          isActive
            ? { ...linkStyle, color: "#dd2476"}
            : linkStyle
        }
      >
        <RiUserCommunityLine />
      </NavLink>
      <NavLink
        to="/playlists"
        style={({ isActive }) =>
          isActive
            ? { ...linkStyle, color: "#dd2476"}
            : linkStyle
        }
      >
        <TbPlaylist />
      </NavLink>
    </nav>
   
  );
}
