const silver = "url(#silver)",
  gold = "url(#gold)",
  edge = "#59687a";
function Shape({ type }) {
  switch (type) {
    case "ucl":
      return (
        <>
          <path
            fill={silver}
            stroke={edge}
            d="M20 9h24l-2 25c-.7 8-6.8 14-10 14s-9.3-6-10-14L20 9Z"
          />
          <path
            fill="none"
            stroke={silver}
            strokeWidth="5"
            d="M21 14C9 7 5 16 10 28c3 7 8 9 14 8M43 14c12-7 16 2 11 14-3 7-8 9-14 8"
          />
          <path fill="#dbe3ec" d="M26 47h12v7H26zM20 54h24v5H20z" />
          <path
            fill="none"
            stroke="#fff"
            strokeOpacity=".65"
            d="M26 13c0 17 1 27 6 30"
          />
        </>
      );
    case "world":
      return (
        <image href="/trophies/fifa-world-cup.svg" x="5" y="2" width="54" height="58" />
      );
    case "league":
      return (
        <>
          <circle cx="32" cy="8" r="5" fill={gold} />
          <path
            fill={silver}
            stroke={edge}
            d="M22 14h20l3 20c1 8-5 14-13 14s-14-6-13-14z"
          />
          <path
            fill="none"
            stroke={silver}
            strokeWidth="4"
            d="M21 20C9 14 8 29 21 34M43 20c12-6 13 9 0 14"
          />
          <path fill="#dbe2ea" d="M28 47h8v7h-8zM21 54h22v5H21z" />
          <path
            fill="none"
            stroke="#fff"
            strokeOpacity=".7"
            d="M26 17l-2 18c0 5 3 8 6 9"
          />
        </>
      );
    case "copa":
      return (
        <>
          <path
            fill={silver}
            stroke={edge}
            d="M21 6h22l-2 8-5 5 6 18c1 6-4 10-10 10s-11-4-10-10l6-18-5-5z"
          />
          <path
            fill="none"
            stroke="#fff"
            strokeOpacity=".7"
            d="M28 9h9M28 23l-3 15c0 3 2 5 5 6"
          />
          <path fill="#bdc8d4" d="M29 47h6v7h-6zM20 54h24v5H20z" />
          <path
            fill="none"
            stroke={silver}
            strokeWidth="3"
            d="M22 24c-9-2-10 8 1 12M40 24c9-2 10 8-1 12"
          />
        </>
      );
    case "supercup":
      return (
        <>
          <path fill={silver} stroke={edge} d="M17 9h30l-8 13-3 25h-8l-3-25z" />
          <path fill="#98a7b8" d="m17 9 9 13h12L47 9 36 26h-8z" />
          <path fill="#e8eef4" d="M27 47h10v7H27zM20 54h24v5H20z" />
          <path
            fill="none"
            stroke="#fff"
            strokeOpacity=".75"
            d="M22 12l7 8M29 25l2 20"
          />
        </>
      );
    case "clubworld":
      return (
        <>
          <circle cx="37" cy="17" r="8" fill={silver} stroke={edge} />
          <path
            fill="none"
            stroke={silver}
            strokeWidth="6"
            d="M18 52C18 30 25 12 44 7"
          />
          <path
            fill="none"
            stroke="#8795a6"
            strokeWidth="3"
            d="M13 51C11 28 21 11 39 7"
          />
          <path fill={silver} stroke={edge} d="M12 51h18l4 8H9z" />
          <path fill="none" stroke="#fff" d="M34 12c5 0 8 3 8 8" />
        </>
      );
    case "leagues":
      return (
        <>
          <path
            fill="#c8d2dc"
            stroke={edge}
            d="m13 8 14 9-9 14-10-9zM51 8l-14 9 9 14 10-9z"
          />
          <path fill={silver} stroke={edge} d="m32 13 10 14-6 25h-8l-6-25z" />
          <path fill="#e84982" d="m27 18 5-5 5 5-5 8z" />
          <path fill="#b9c4d0" d="M24 52h16l4 7H20z" />
          <path
            fill="none"
            stroke="#fff"
            strokeOpacity=".65"
            d="m15 12 8 6M49 12l-8 6M29 28l2 21"
          />
        </>
      );
    case "shield":
      return (
        <>
          <path
            fill={silver}
            stroke={edge}
            d="M8 10c14-5 34-5 48 0v21c0 14-10 23-24 29C18 54 8 45 8 31Z"
          />
          <path
            fill="#1c2940"
            d="M13 15c12-4 26-4 38 0v15c0 10-7 18-19 24-12-6-19-14-19-24z"
          />
          <path fill="#dce4ec" d="M17 19h30v4H17zM17 27h30v3H17z" />
          <path fill="#00a7e7" d="M18 35h28v3H18z" />
          <path fill="#a50044" d="M22 42h20v3H22z" />
        </>
      );
    case "medal":
      return (
        <>
          <path fill="#65b5e6" d="M15 4h12l8 23H24z" />
          <path fill="#fff" d="M27 4h10l3 23H32z" />
          <path fill="#65b5e6" d="M37 4h12L40 27h-8z" />
          <circle
            cx="32"
            cy="39"
            r="17"
            fill={gold}
            stroke="#936600"
            strokeWidth="2"
          />
          <path
            fill="none"
            stroke="#fff2a0"
            strokeWidth="2"
            d="M32 27v24M20 39h24"
          />
        </>
      );
    case "ball":
      return (
        <>
          <circle cx="32" cy="24" r="19" fill={gold} stroke="#9a6b00" />
          <path
            fill="#a97700"
            d="m32 9 8 6-3 10H27l-3-10zM13 23l11-8 3 10-8 7zM51 23l-11-8-3 10 8 7zM19 32l8-7h10l8 7-5 10H24z"
            opacity=".62"
          />
          <path fill="#7f765e" d="m17 48 11-7 9 2 11 8-5 9H18z" />
          <path fill="#d0c39d" d="m22 49 8-5 5 2-7 5z" />
        </>
      );
    case "goldball":
      return (
        <>
          <circle cx="32" cy="22" r="18" fill={gold} stroke="#9a6b00" />
          <path
            fill="none"
            stroke="#fff0a3"
            d="M17 18c8-10 22-10 30 0M16 27c10 7 22 8 32-1"
          />
          <path fill="#b48319" d="M27 40h10l3 11H24z" />
          <path fill="#77551b" d="M20 51h24l4 8H16z" />
        </>
      );
    case "silverball":
      return (
        <>
          <circle cx="32" cy="22" r="18" fill={silver} stroke="#647182" />
          <path
            fill="none"
            stroke="#f4f8fc"
            d="M17 18c8-10 22-10 30 0M16 27c10 7 22 8 32-1"
          />
          <path fill="#98a5b4" d="M27 40h10l3 11H24z" />
          <path fill="#596575" d="M20 51h24l4 8H16z" />
        </>
      );
    case "boot":
      return (
        <>
          <path
            fill={gold}
            stroke="#976600"
            d="M12 35c11-2 17-13 18-28l13 5-3 16c4 5 10 8 17 10v11H9c-4-6-2-11 3-14Z"
          />
          <path fill="#6d4b00" d="M9 49h48v6H9z" />
          <path
            fill="none"
            stroke="#fff0a3"
            strokeWidth="1.5"
            d="m31 14 10 4M30 19l10 4M28 25l10 4M17 39c9 2 20 2 31 0"
          />
          <circle cx="17" cy="54" r="2" fill="#d9b633" />
          <circle cx="47" cy="54" r="2" fill="#d9b633" />
        </>
      );
    case "pichichi":
      return (
        <>
          <circle cx="34" cy="9" r="5" fill={gold} />
          <path
            fill={gold}
            stroke="#976600"
            d="m28 15 11 2 5 14-6 2-4-9-2 13 8 13-6 3-7-10-4 10-7-3 7-16-2-10-7 9-5-4 11-13z"
          />
          <circle cx="47" cy="47" r="8" fill={gold} stroke="#976600" />
          <path fill="#76521c" d="M8 55h45v5H8z" />
        </>
      );
    case "mvp":
    case "star":
      return (
        <>
          <path
            fill="url(#crystal)"
            stroke="#6fcff4"
            d="M32 4 43 23l-3 27-8 10-8-10-3-27z"
          />
          <path
            fill="none"
            stroke="#fff"
            strokeOpacity=".7"
            d="m32 8-6 17 6 28 6-28zM22 23h20"
          />
          <path fill="#173f67" d="M19 54h26l4 6H15z" />
        </>
      );
    case "assist":
      return (
        <>
          <circle cx="23" cy="25" r="16" fill={gold} stroke="#976600" />
          <path
            fill="#a87800"
            d="m23 12 6 5-2 8h-8l-3-8zM9 24l7-7 3 8-6 5zM37 24l-8-7-2 8 7 5zM14 31l5-6h8l6 6-4 8H18z"
          />
          <path
            fill="none"
            stroke="#00a7e7"
            strokeWidth="5"
            d="M39 17c10 2 14 9 12 18"
          />
          <path fill="#00a7e7" d="m48 39-7-9 12 1z" />
          <path fill="#68758a" d="M15 45h16l4 14H11z" />
        </>
      );
    case "mls":
      return (
        <>
          <circle cx="32" cy="9" r="5" fill={silver} />
          <path
            fill={silver}
            stroke={edge}
            d="M19 13h26l-3 29c-1 8-5 13-10 13s-9-5-10-13z"
          />
          <path
            fill="none"
            stroke={silver}
            strokeWidth="4"
            d="M20 19C9 14 8 27 21 34M44 19c11-5 12 8-1 15"
          />
          <path fill="#8f9dac" d="m25 22 7-7 7 7-7 7z" />
          <path fill="#dce4ec" d="M24 54h16l4 6H20z" />
          <path
            fill="none"
            stroke="#fff"
            strokeOpacity=".65"
            d="M26 18v23c0 5 2 8 5 10"
          />
        </>
      );
    default:
      return (
        <>
          <path
            fill={silver}
            stroke={edge}
            d="M20 9h24l-3 27c-1 8-5 13-9 13s-8-5-9-13z"
          />
          <path
            fill="none"
            stroke={silver}
            strokeWidth="4"
            d="M21 17C8 10 8 31 23 34M43 17c13-7 13 14-2 17"
          />
          <path fill="#dce4ec" d="M28 48h8v7h-8zM20 55h24v5H20z" />
        </>
      );
  }
}
export default function TrophyMark({ type }) {
  return (
    <svg
      className={`trophy-mark ${type}`}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${type} trophy`}
    >
      <defs>
        <linearGradient id="silver" x2="1" y2="1">
          <stop stopColor="#fff" />
          <stop offset=".3" stopColor="#8795a7" />
          <stop offset=".56" stopColor="#f4f7fa" />
          <stop offset="1" stopColor="#647285" />
        </linearGradient>
        <linearGradient id="gold" x2="1" y2="1">
          <stop stopColor="#fff0a0" />
          <stop offset=".26" stopColor="#dcae20" />
          <stop offset=".55" stopColor="#fff3a8" />
          <stop offset="1" stopColor="#9b6800" />
        </linearGradient>
        <linearGradient id="crystal" x2="1" y2="1">
          <stop stopColor="#d9f6ff" stopOpacity=".9" />
          <stop offset=".5" stopColor="#3ca4d4" stopOpacity=".65" />
          <stop offset="1" stopColor="#133d69" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="60" rx="20" ry="2" fill="#000" opacity=".25" />
      <Shape type={type} />
    </svg>
  );
}
