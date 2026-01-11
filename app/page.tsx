import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      {/* Navbar */}
      <div className="w-full border-b border-solid border-border-dark bg-background-dark/95 backdrop-blur-sm fixed top-0 z-50">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center">
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
              <header className="flex items-center justify-between whitespace-nowrap py-3">
                <div className="flex items-center gap-3 text-white">
                  <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-2xl">
                      sports_esports
                    </span>
                  </div>
                  <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">
                    MARIO <span className="text-accent">QUIZ</span> RACER
                  </h2>
                </div>
                <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
                  <div className="hidden md:flex items-center gap-6 lg:gap-9">
                    <Link
                      className="text-white hover:text-primary transition-colors text-sm font-medium leading-normal"
                      href="#"
                    >
                      Home
                    </Link>
                    <Link
                      className="text-white hover:text-primary transition-colors text-sm font-medium leading-normal"
                      href="#"
                    >
                      Leaderboard
                    </Link>
                    <Link
                      className="text-white hover:text-primary transition-colors text-sm font-medium leading-normal"
                      href="#"
                    >
                      How to Play
                    </Link>
                  </div>
                  <Link
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary hover:bg-red-600 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(234,42,51,0.4)]"
                    href="/login"
                  >
                    <span className="mr-2 hidden sm:inline">Login</span>
                    <span className="material-symbols-outlined text-[20px]">
                      login
                    </span>
                  </Link>
                </div>
              </header>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <main className="flex flex-col pt-20">
        {/* Hero Section */}
        <div className="w-full px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5 md:py-10">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="relative flex min-h-[560px] flex-col gap-6 overflow-hidden rounded-xl bg-cover bg-center bg-no-repeat @[480px]:gap-8 items-center justify-center p-8 text-center shadow-2xl shadow-primary/10 border border-border-dark"
                  data-alt="Dark abstract racing track background with neon red accents"
                  style={{
                    backgroundImage:
                      'linear-gradient(to bottom, rgba(33, 17, 17, 0.7) 0%, rgba(33, 17, 17, 0.9) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuArFYH0tyfcdSDTt_XR_n-38TwP44U68xGjJoOQt4XgCfDI2pxxBuXfaxAWYew4pdJUIZYq8xzKkU725b9xnHRzaGBnH29QB9c0Uf2RP7-v0cT3Xb041uvXEJE7g-TpDqNGx9y4BtTk2YOzls5-9J8d-RWm4s5zOwfXnh0GxqBiI23oVC7MtiZxLsXtiBCyuiJiqYNdpBX4CSQ3cwackjgjUpllzu2VqzbswA_Q_b0GY--Avw-DFYU3ni_bq-GtI0ibIIJX3UkZ9NY")',
                  }}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-10 left-10 opacity-20">
                    <span className="material-symbols-outlined text-white text-[120px]">
                      question_mark
                    </span>
                  </div>
                  <div className="absolute bottom-10 right-10 opacity-20">
                    <span className="material-symbols-outlined text-white text-[120px]">
                      sports_score
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 max-w-[800px] z-10">
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        Season 2 is Live
                      </div>
                    </div>
                    <h1 className="text-white text-5xl font-black leading-tight tracking-[-0.033em] @[480px]:text-6xl drop-shadow-xl">
                      RACE SMART. <br />
                      <span className="text-primary">DRIVE FAST.</span>
                    </h1>
                    <h2 className="text-slate-300 text-base font-normal leading-relaxed @[480px]:text-xl max-w-2xl mx-auto">
                      The ultimate multiplayer racing quiz. Answer trivia
                      correctly to boost your kart speed and leave your friends
                      in the dust.
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center w-full z-10 pt-4">
                    <button className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-primary hover:bg-red-600 hover:scale-105 transition-all text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/30">
                      <span className="material-symbols-outlined mr-2">
                        sports_motorsports
                      </span>
                      <span>Login to Race</span>
                    </button>
                    <button className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-[#472426]/50 hover:bg-[#472426] backdrop-blur-md border border-primary/30 hover:border-primary text-white text-base font-bold leading-normal tracking-[0.015em] transition-all">
                      <span>Create Account</span>
                    </button>
                  </div>
                  {/* Platform Icons */}
                  <div className="flex gap-6 mt-8 opacity-50 z-10">
                    <span className="material-symbols-outlined text-white text-3xl">
                      desktop_windows
                    </span>
                    <span className="material-symbols-outlined text-white text-3xl">
                      smartphone
                    </span>
                    <span className="material-symbols-outlined text-white text-3xl">
                      gamepad
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Info Section */}
        <div className="w-full px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
              {/* Card 1 */}
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-[#2a1617] border border-border-dark hover:border-primary/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary">
                      local_fire_department
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    Real-time
                  </span>
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium leading-normal">
                    Live Races
                  </p>
                  <p className="text-white tracking-tight text-3xl font-bold leading-tight mt-1">
                    42
                  </p>
                </div>
              </div>
              {/* Card 2 */}
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-[#2a1617] border border-border-dark hover:border-accent/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors">
                    <span className="material-symbols-outlined text-accent">
                      groups
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    Global
                  </span>
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium leading-normal">
                    Active Racers
                  </p>
                  <p className="text-white tracking-tight text-3xl font-bold leading-tight mt-1">
                    1,204
                  </p>
                </div>
              </div>
              {/* Card 3 */}
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-[#2a1617] border border-border-dark hover:border-green-500/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-colors">
                    <span className="material-symbols-outlined text-green-500">
                      dns
                    </span>
                  </div>
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-green-500">
                      Stable
                    </span>
                  </span>
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium leading-normal">
                    Server Status
                  </p>
                  <p className="text-white tracking-tight text-3xl font-bold leading-tight mt-1">
                    Online
                  </p>
                </div>
              </div>
            </div>

            {/* How it Works (Brief) */}
            <div className="mt-12 mb-8 px-4">
              <div className="flex flex-col md:flex-row gap-8 items-center bg-[#2a1617] rounded-2xl p-8 border border-border-dark">
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-bold text-white">
                    How it Works
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 min-w-6 text-accent">
                        <span className="material-symbols-outlined">quiz</span>
                      </div>
                      <p className="text-slate-300 text-sm md:text-base">
                        Answer trivia questions while you drive. Correct answers
                        give you a{" "}
                        <span className="text-accent font-bold">
                          speed boost
                        </span>
                        .
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 min-w-6 text-primary">
                        <span className="material-symbols-outlined">bolt</span>
                      </div>
                      <p className="text-slate-300 text-sm md:text-base">
                        Watch out for obstacles! Wrong answers spin you out.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 min-w-6 text-green-400">
                        <span className="material-symbols-outlined">
                          trophy
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm md:text-base">
                        Race against friends or random players worldwide to top
                        the leaderboard.
                      </p>
                    </li>
                  </ul>
                </div>
                <div
                  className="w-full md:w-1/3 h-48 rounded-xl bg-cover bg-center border border-border-dark relative overflow-hidden group"
                  data-alt="Abstract representation of a kart on a digital track"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBPJ2EAi_HYX4f-fbo9tWb2XRhyJFZ6EgwogCf39t6BQYXTfJ3o-5edTHPQO_6suXINugEsi7GWddTn-Kt29AU-5T88-ykfZ-sbsDgCfpQI2s7tRQpW4xlZJM-lvMfEdLt8gBc8DiF1eqKqdV6tLfD3nNc9MnlZI4cGxTyTON5QXbG-kVN0n150DMV6qn3kfIxJRj9qJEMdYeYHLg_e3cyzUdjDrhrqrZuH3fk9F-WcNgBexq1nhosLVd5R4BSbnEJZOf7kxnCQNs")',
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-6xl drop-shadow-lg">
                      play_circle
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full border-t border-border-dark bg-[#1a0d0e] mt-auto">
          <div className="px-4 md:px-10 lg:px-40 flex justify-center py-10">
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
              <div className="flex flex-col gap-8 text-center @container">
                <div className="flex justify-center mb-2">
                  <div className="size-8 text-white/50">
                    <span className="material-symbols-outlined text-3xl">
                      sports_esports
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                  <Link
                    className="text-slate-400 hover:text-white transition-colors text-sm font-medium leading-normal flex items-center gap-2"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-lg">
                      videogame_asset
                    </span>
                    Controls
                  </Link>
                  <Link
                    className="text-slate-400 hover:text-white transition-colors text-sm font-medium leading-normal flex items-center gap-2"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-lg">
                      leaderboard
                    </span>
                    Leaderboard
                  </Link>
                  <Link
                    className="text-slate-400 hover:text-white transition-colors text-sm font-medium leading-normal flex items-center gap-2"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-lg">
                      info
                    </span>
                    About
                  </Link>
                  <Link
                    className="text-slate-400 hover:text-white transition-colors text-sm font-medium leading-normal flex items-center gap-2"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-lg">
                      code
                    </span>
                    GitHub
                  </Link>
                </div>
                <div className="h-px w-full bg-border-dark/50 max-w-md mx-auto"></div>
                <p className="text-[#c89295] text-sm font-normal leading-normal opacity-80">
                  Built with Next.js + Socket.io + HTML5 Canvas. <br />
                  <span className="text-xs opacity-60">
                    Not affiliated with Nintendo. This is a fan-made educational
                    project.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
