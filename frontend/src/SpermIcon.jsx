// frontend/src/SpermIcon.jsx
export default function SpermIcon({ color = "#a855f7", size = 90 }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: `drop-shadow(0 0 15px ${color})`,
          overflow: "visible",
        }}
      >
        {/* Head */}
        <circle cx="20" cy="20" r="10" fill={color} />
        {/* Tail */}
        <path
          d="M30 20 C45 25, 35 45, 50 50"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }  