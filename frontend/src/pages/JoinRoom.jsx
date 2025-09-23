import { useState, useRef } from "react";
import { joinRoomByCode } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";

export default function JoinRoom() {
  const nav = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const handleChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const join = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;
    
    const r = await joinRoomByCode(fullCode);
    nav(`/rooms/${r.id}`);
  };

  return (
    <div className="h-screen w-screen bg-[#010101] flex flex-col justify-center items-center gap-[20px] mt-[-64px] p-[12px]">
      {/* Header */}
        <div className="absolute top-[80px] left-[16px]">
          <button 
            onClick={() => window.history.back()} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
          >
            <IoArrowBackOutline />
          </button>
        </div>
      <h1 className="text-[18px] font-semibold mb-4">Join via Invite Code</h1>
      <div className="flex gap-[8px]">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            className="w-[32px] h-[32px] bg-[#161a23] rounded-[8px] text-center text-lg border-2 border-gray-600 focus:border-[#dd2476] focus:outline-none"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            maxLength={1}
            autoFocus={index === 0}
          />
        ))}
      </div>
      <button className="px-4 py-2 text-[#dd2476] rounded" onClick={join} disabled={code.join("").length !== 6}>Join</button>
    </div>
  );
}
