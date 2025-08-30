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
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#161a23] p-6 rounded-lg w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl mb-4">Create New Playlist</h2>
        <input
          className="w-full p-2 rounded mb-4 bg-gray-700 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Playlist name"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1 rounded bg-pink-500 hover:bg-pink-600 text-white"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
