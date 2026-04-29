import React from 'react';

/**
 * Animated stickman scene used as a soft background on the hero.
 * Pure SVG + CSS animations — no extra dependencies, GPU-cheap, and
 * `pointer-events-none` so it never blocks foreground interaction.
 *
 * Scene loop (~9s):
 *   - Person A walks in from the left holding a wallet
 *   - Hands the wallet to Person B
 *   - Person B says "Thank you!" (speech bubble fades in)
 *   - Both bow slightly, scene resets
 */
const AnimatedBackground = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
  >
    {/* Soft animated gradient blobs */}
    <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl animate-float" />
    <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-brand-teal/10 blur-3xl animate-float [animation-delay:1.5s]" />

    {/* Scene SVG */}
    <svg
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-x-0 bottom-0 w-full h-64 sm:h-72 md:h-80 opacity-70"
    >
      <defs>
        <linearGradient id="ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
      </defs>

      {/* Ground line */}
      <rect x="0" y="240" width="800" height="60" fill="url(#ground)" />
      <line x1="0" y1="240" x2="800" y2="240" stroke="#cbd5e1" strokeWidth="1" />

      {/* === Person A (walks in, hands over wallet) === */}
      <g className="stickman-a">
        {/* head */}
        <circle cx="0" cy="120" r="14" stroke="#1d4ed8" strokeWidth="3" fill="#ffffff" />
        {/* body */}
        <line x1="0" y1="134" x2="0" y2="190" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        {/* arm holding wallet — animates from down to extended */}
        <line className="arm-give" x1="0" y1="150" x2="22" y2="170" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="150" x2="-18" y2="172" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        {/* legs (walk) */}
        <line className="leg-l" x1="0" y1="190" x2="-10" y2="222" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        <line className="leg-r" x1="0" y1="190" x2="10" y2="222" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        {/* wallet (held in hand, then handed over) */}
        <rect className="wallet" x="18" y="164" width="14" height="10" rx="2" fill="#f59e0b" stroke="#92400e" strokeWidth="1.2" />
      </g>

      {/* === Person B (waiting, then receives, then says Thank you) === */}
      <g className="stickman-b">
        {/* head */}
        <circle cx="0" cy="120" r="14" stroke="#0f766e" strokeWidth="3" fill="#ffffff" />
        {/* eyes (smile) */}
        <circle cx="-4" cy="118" r="1.4" fill="#0f766e" />
        <circle cx="4" cy="118" r="1.4" fill="#0f766e" />
        {/* body */}
        <line x1="0" y1="134" x2="0" y2="190" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
        {/* arm reaching out to receive */}
        <line className="arm-receive" x1="0" y1="150" x2="-22" y2="170" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="150" x2="18" y2="172" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
        {/* legs */}
        <line x1="0" y1="190" x2="-10" y2="222" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="190" x2="10" y2="222" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />

        {/* speech bubble */}
        <g className="bubble">
          <rect x="14" y="60" width="110" height="36" rx="10" fill="#ffffff" stroke="#0f766e" strokeWidth="1.5" />
          <polygon points="30,96 26,108 42,96" fill="#ffffff" stroke="#0f766e" strokeWidth="1.5" />
          <text x="69" y="83" textAnchor="middle" fontSize="14" fontFamily="Inter, sans-serif" fill="#0f766e" fontWeight="600">
            Thank you!
          </text>
        </g>

        {/* tiny hearts floating up */}
        <g className="hearts">
          <text x="-30" y="100" fontSize="14" fill="#ef4444">♥</text>
          <text x="20" y="90" fontSize="10" fill="#ef4444">♥</text>
        </g>
      </g>
    </svg>

    {/* Local CSS — kept inline to avoid editing global stylesheets */}
    <style>{`
      @keyframes walkIn {
        0%   { transform: translate(80px, 0); }
        35%  { transform: translate(290px, 0); }
        100% { transform: translate(290px, 0); }
      }
      @keyframes legSwingL {
        0%, 35%, 100% { transform: rotate(0deg); }
        15%           { transform: rotate(28deg); }
      }
      @keyframes legSwingR {
        0%, 35%, 100% { transform: rotate(0deg); }
        15%           { transform: rotate(-28deg); }
      }
      @keyframes armGive {
        0%, 30%      { transform: rotate(0deg); }
        45%, 65%     { transform: rotate(-50deg); }
        80%, 100%    { transform: rotate(0deg); }
      }
      @keyframes armReceive {
        0%, 35%      { transform: rotate(0deg); }
        45%, 65%     { transform: rotate(50deg); }
        80%, 100%    { transform: rotate(0deg); }
      }
      @keyframes walletHandoff {
        0%, 30%      { transform: translate(0, 0); opacity: 1; }
        45%, 65%     { transform: translate(60px, 0); opacity: 1; }
        80%          { transform: translate(60px, 0); opacity: 0; }
        100%         { transform: translate(0, 0); opacity: 1; }
      }
      @keyframes bubblePop {
        0%, 55%   { opacity: 0; transform: scale(0.7); }
        62%, 90%  { opacity: 1; transform: scale(1); }
        100%      { opacity: 0; transform: scale(0.9); }
      }
      @keyframes heartsRise {
        0%, 60%   { opacity: 0; transform: translateY(0); }
        70%       { opacity: 1; }
        100%      { opacity: 0; transform: translateY(-30px); }
      }
      @keyframes bowB {
        0%, 70%   { transform: translateY(0); }
        80%       { transform: translateY(4px); }
        100%      { transform: translateY(0); }
      }

      .stickman-a {
        transform-origin: center;
        animation: walkIn 9s ease-in-out infinite;
      }
      .stickman-a .leg-l { transform-origin: 0px 190px; animation: legSwingL 0.7s ease-in-out infinite; }
      .stickman-a .leg-r { transform-origin: 0px 190px; animation: legSwingR 0.7s ease-in-out infinite; }
      .stickman-a .arm-give { transform-origin: 0px 150px; animation: armGive 9s ease-in-out infinite; }
      .stickman-a .wallet  { animation: walletHandoff 9s ease-in-out infinite; }

      .stickman-b {
        transform: translate(560px, 0);
        animation: bowB 9s ease-in-out infinite;
      }
      .stickman-b .arm-receive { transform-origin: 0px 150px; animation: armReceive 9s ease-in-out infinite; }
      .stickman-b .bubble {
        transform-origin: 60px 78px;
        animation: bubblePop 9s ease-in-out infinite;
      }
      .stickman-b .hearts {
        animation: heartsRise 9s ease-in-out infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .stickman-a, .stickman-a .leg-l, .stickman-a .leg-r,
        .stickman-a .arm-give, .stickman-a .wallet,
        .stickman-b, .stickman-b .arm-receive,
        .stickman-b .bubble, .stickman-b .hearts {
          animation: none !important;
        }
      }
    `}</style>
  </div>
);

export default AnimatedBackground;
