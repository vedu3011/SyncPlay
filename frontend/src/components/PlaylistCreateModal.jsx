import React, { useState } from 'react';

export default function PlaylistCreateModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return alert('Please enter a playlist name');
    onCreate(trimmed);
    setName('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-[0px] left-[0px] bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#010101] p-6 rounded-lg w-screen h-screen flex flex-col gap-[40px] items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl mb-4 text-center mt-[48%]">Create New Playlist</h2>
        <input
          className="w-1/2 p-3 bg-transparent border-b border-gray-600 text-white focus:outline-none transition-colors"
          style={{
            borderBottomColor: name ? '#ec4899' : '#4b5563' // Pink when typing, gray when empty
          }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Playlist name"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <div className="flex justify-between w-1/2 gap-4">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1 rounded text-[#dd2476] hover:bg-pink-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
