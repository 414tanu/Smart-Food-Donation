const FoodBridgeLogo = ({ className = 'h-10 w-10' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      role="img"
      aria-label="FoodBridge logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="14" fill="#ecfdf5" />
      <path
        d="M14 28c0-7.18 5.82-13 13-13h7c0 7.18-5.82 13-13 13h-7Z"
        fill="#16a34a"
      />
      <path
        d="M13 32c6.4-2.1 12.2-6.9 17-14"
        stroke="#064e3b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M14 34h20"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default FoodBridgeLogo;
