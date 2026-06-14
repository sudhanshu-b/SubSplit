// Split-panel auth layout — dark visual left, clean form right

const PANEL_LOGOS = [
  { name: "Netflix",    icon: "https://cdn.simpleicons.org/netflix/ffffff",       bg: "#E50914" },
  { name: "Spotify",    icon: "https://cdn.simpleicons.org/spotify/ffffff",       bg: "#1DB954" },
  { name: "YouTube",    icon: "https://cdn.simpleicons.org/youtube/ffffff",       bg: "#FF0000" },
  { name: "Notion",     icon: "https://cdn.simpleicons.org/notion/ffffff",        bg: "#191919" },
  { name: "Dropbox",    icon: "https://cdn.simpleicons.org/dropbox/ffffff",       bg: "#0061FF" },
  { name: "iCloud+",    icon: "https://cdn.simpleicons.org/icloud/ffffff",        bg: "#3693F3" },
  { name: "Copilot",    icon: "https://cdn.simpleicons.org/githubcopilot/ffffff", bg: "#6941C6" },
  { name: "Duolingo",   icon: "https://cdn.simpleicons.org/duolingo/ffffff",      bg: "#58CC02" },
];

// How many logo circles to show before the "+N more" badge
const VISIBLE = 5;
const EXTRA   = PANEL_LOGOS.length - VISIBLE;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — visual / brand ── */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col overflow-hidden bg-gray-950 flex-shrink-0">

        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1557683311-eac922347aa1?q=85&w=1400&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.45 }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #030712 0%, #030712cc 30%, #03071240 70%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">

          {/* ── Logo — larger ── */}
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-dark.png"
              alt="LetsSplit"
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* ── Tagline block — vertically centered ── */}
          <div className="flex-1 flex flex-col justify-center">

            {/* Stylish label with decorative lines */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-6 bg-indigo-500" />
              <span
                className="text-[11px] font-black uppercase tracking-[0.2em]"
                style={{
                  background: "linear-gradient(90deg, #818cf8, #c084fc, #f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Subscription sharing, simplified
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/60 to-transparent" />
            </div>

            <h2 className="text-4xl sm:text-[2.6rem] font-bold text-white leading-[1.12] tracking-tight">
              Split the cost.
              <br />
              Keep the access.
            </h2>
            <p className="mt-5 text-base text-gray-400 leading-relaxed max-w-xs">
              Share Netflix, Spotify, YouTube & more with people you trust — pay a fraction of the price.
            </p>
          </div>

          {/* ── "Works with" — overlapping logo circles + count badge ── */}
          <div className="flex-shrink-0">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
              Works with
            </p>

            <div className="flex items-center gap-3">
              {/* Overlapping avatar stack */}
              <div className="flex items-center">
                {PANEL_LOGOS.slice(0, VISIBLE).map((s, i) => (
                  <div
                    key={s.name}
                    title={s.name}
                    className="w-9 h-9 rounded-full flex items-center justify-center
                               ring-2 ring-gray-950 flex-shrink-0"
                    style={{
                      backgroundColor: s.bg,
                      marginLeft: i === 0 ? 0 : "-10px",
                      zIndex: VISIBLE - i,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.icon} alt={s.name} className="w-4 h-4 object-contain" />
                  </div>
                ))}

                {/* "+N more" circle */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center
                             ring-2 ring-gray-950 bg-white/10 backdrop-blur-sm flex-shrink-0"
                  style={{ marginLeft: "-10px", zIndex: 0 }}
                >
                  <span className="text-[10px] font-black text-white/80">+{EXTRA}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-tight">
                Netflix, Spotify, YouTube
                <br />
                and many more
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-950
                      px-6 py-12 overflow-y-auto">
        {children}
      </div>

    </div>
  );
}
