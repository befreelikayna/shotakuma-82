
import React from "react";

interface DiscordIconProps {
  className?: string;
}

const DiscordIcon: React.FC<DiscordIconProps> = ({ className = "h-5 w-5" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 9C18 9 16.586 7.707 15 7.5C15 7.5 14.5 8.5 14 9M6 9C6 9 7.414 7.707 9 7.5C9 7.5 9.5 8.5 10 9" />
      <path d="M20 14C19.5 17.5 16.8284 19.908 16.8284 19.908C13.5 22.5 9 21.5 9 21.5L10 19" />
      <path d="M4 14C4.5 17.5 7.17157 19.908 7.17157 19.908C10.5 22.5 15 21.5 15 21.5L14 19" />
      <path d="M12 22C14.5 22 17.5 20.5 17.5 20.5C18.5 20 19.5 19 20 17.5C21 14.5 21 12 21 9.5C20.5 8.5 19.5 7 19.5 7C18.83 7 17.79 6.67 17 6.5C16 6 15 6 15 6C12.5 7 10.5 7 10.5 7C10.5 7 9 6 7.5 6C7.5 6 6.5 6 5.5 6.5C4.71 6.67 3.67 7 3 7C3 7 2 8.5 1.5 9.5C1 12 1 14.5 2 17.5C2.5 19 3.5 20 4.5 20.5C4.5 20.5 7.5 22 10 22" />
      <path d="M8 14C8 13.4477 8.44772 13 9 13C9.55228 13 10 13.4477 10 14C10 14.5523 9.55228 15 9 15C8.44772 15 8 14.5523 8 14Z" />
      <path d="M14 14C14 13.4477 14.4477 13 15 13C15.5523 13 16 13.4477 16 14C16 14.5523 15.5523 15 15 15C14.4477 15 14 14.5523 14 14Z" />
    </svg>
  );
};

export default DiscordIcon;
