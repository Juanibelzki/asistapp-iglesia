import React from 'react';

interface AppleButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'emerald' | 'white';
}

export default function AppleButton({ text, onClick, variant = 'emerald' }: AppleButtonProps) {
  const baseClasses = "h-[50px] w-[200px] relative bg-transparent cursor-pointer overflow-hidden rounded-[30px] transition-all duration-500 ease-in-out flex items-center justify-center border-2";
  const colorClasses = variant === 'emerald' 
    ? "border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white hover:border-[#10b981]"
    : "border-[#252525] text-[#333] hover:bg-[#252525] hover:text-white";

  return (
    <button className={`${baseClasses} ${colorClasses} group`} onClick={onClick}>
      <span className="relative z-10 font-extrabold tracking-widest">{text}</span>
      <div className={`absolute left-0 top-0 transition-all duration-500 ease-in-out rounded-[30px] invisible h-[10px] w-[10px] z-0 group-hover:visible group-hover:scale-[100] ${variant === 'emerald' ? 'bg-[#10b981]' : 'bg-[#333]'}`}></div>
    </button>
  );
}
