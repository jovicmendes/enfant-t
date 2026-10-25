import { useEffect, useRef, useState } from "react";
import "./App.css";

const initialFiles = [
  {
    id: "about",
    name: "Sobre mim.txt",
    type: "text",
    x: 36,
    y: 38,
    icon: "document",
  },
  {
    id: "projects",
    name: "Projetos",
    type: "folder",
    x: 36,
    y: 148,
    icon: "folder",
  },
  {
    id: "music",
    name: "Music",
    type: "music",
    x: 36,
    y: 258,
    icon: "music",
  },
  {
    id: "gallery",
    name: "Galeria",
    type: "folder",
    x: 36,
    y: 368,
    icon: "folder",
  },
];

const folderContents = {
  projects: [
    {
      id: "project1",
      name: "Projeto 01.txt",
      type: "text",
      icon: "document",
      content:
        "Um espaço para ideias, projetos e coisas que ainda estão em construção.",
    },
    {
      id: "project2",
      name: "Anotações.txt",
      type: "text",
      icon: "document",
      content:
        "Ideias, referências e pensamentos.\n\nTudo começa em algum lugar.",
    },
  ],

  gallery: [
    {
      id: "gallery-info",
      name: "Galeria.txt",
      type: "text",
      icon: "document",
      content:
        "Este espaço pode receber imagens, fotografias e referências visuais.",
    },
  ],
};

function Icon({ type, size = 28 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "folder") {
    return (
      <svg {...common}>
        <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
        <path d="M3.5 10h17" />
      </svg>
    );
  }

  if (type === "music") {
    return (
      <svg {...common}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }

  if (type === "video") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m10 9 5 3-5 3z" />
      </svg>
    );
  }

  if (type === "image") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M14 3.5V8h4" />
      <path d="M8 13h8M8 17h8" />
    </svg>
  );
}

function WindowControls({ onClose }) {
  return (
    <div className="window-controls">
      <button
        className="window-control close"
        onClick={onClose}
        aria-label="Fechar janela"
        title="Fechar"
      />
      <span className="window-control minimize" />
      <span className="window-control maximize" />
    </div>
  );
}

function App() {
  const [nameInput, setNameInput] = useState("");
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [files, setFiles] = useState(() => {
    try {
      const saved = localStorage.getItem("enfant-files");
      return saved ? JSON.parse(saved) : initialFiles;
    } catch {
      return initialFiles;
    }
  });

  const [windows, setWindows] = useState([]);
  const [activeWindow, setActiveWindow] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [clock, setClock] = useState(new Date());

  const [trackTitle, setTrackTitle] = useState("Carregando playlist...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [upNext, setUpNext] = useState([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 600px)").matches);
  const playerRef = useRef(null);
  const playerIntervalRef = useRef(null);

  const dragRef = useRef(null);
  const windowDragRef = useRef(null);
  const nextZ = useRef(10);

  useEffect(() => {
    localStorage.setItem("enfant-files", JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 600px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  // Inicializa a playlist do YouTube quando o usuário entra no desktop.
  useEffect(() => {
    if (!loggedIn) return;

    let cancelled = false;

    const createPlayer = () => {
      if (cancelled || !document.getElementById("enfant-youtube-engine")) return;
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player("enfant-youtube-engine", {
        width: "200",
        height: "200",
        videoId: "TGbVaJ5kl7s",
        playerVars: {
          listType: "playlist",
          list: "PL5q-rMWXtL75Ndmb_4dUNTf7dQMuVuLYh",
          autoplay: 1,
          controls: 0,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(55);
            event.target.loadPlaylist({
              listType: "playlist",
              list: "PL5q-rMWXtL75Ndmb_4dUNTf7dQMuVuLYh",
              index: 0,
            });
            event.target.playVideo();
            window.setTimeout(() => {
              try {
                const data = event.target.getVideoData();
                if (data?.title) setTrackTitle(data.title);
                setDuration(event.target.getDuration() || 0);
              } catch {}
            }, 1200);
          },
          onStateChange: (event) => {
            const yt = window.YT;
            setIsPlaying(event.data === yt.PlayerState.PLAYING);
            try {
              const data = event.target.getVideoData();
              if (data?.title) setTrackTitle(data.title);
              setDuration(event.target.getDuration() || 0);
              const currentIndex = event.target.getPlaylistIndex?.();
              if (Number.isInteger(currentIndex) && currentIndex >= 0) {
                setPlaylistIndex(currentIndex);
              }
            } catch {}
          },
          onError: () => setTrackTitle("Não foi possível carregar a playlist"),
        },
      });
    };

    const loadApi = () => {
      if (window.YT?.Player) {
        createPlayer();
        return;
      }

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousCallback === "function") previousCallback();
        createPlayer();
      };
    };

    loadApi();

    playerIntervalRef.current = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== "function") return;
      try {
        setCurrentTime(player.getCurrentTime() || 0);
        setDuration(player.getDuration() || 0);
        const data = player.getVideoData();
        if (data?.title) setTrackTitle(data.title);
      } catch {}
    }, 1000);

    return () => {
      cancelled = true;
      if (playerIntervalRef.current) window.clearInterval(playerIntervalRef.current);
    };
  }, [loggedIn]);

  useEffect(() => {
    let cancelled = false;
    const updateUpcoming = async () => {
      const player = playerRef.current;
      if (!player || typeof player.getPlaylist !== "function") return;
      try {
        const ids = player.getPlaylist() || [];
        const currentIndex = Math.max(0, player.getPlaylistIndex?.() ?? 0);
        if (!ids.length) return;
        const nextTracks = Array.from({ length: Math.min(5, Math.max(0, ids.length - 1)) }, (_, i) => {
          const index = (currentIndex + i + 1) % ids.length;
          return { videoId: ids[index], index };
        }).filter((track) => Boolean(track.videoId));
        const tracks = await Promise.all(nextTracks.map(async (track) => {
          try {
            const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${track.videoId}`)}&format=json`);
            if (!response.ok) throw new Error("oEmbed indisponível");
            const data = await response.json();
            return { ...track, title: data.title || "Faixa do YouTube" };
          } catch {
            return { ...track, title: `Faixa ${track.videoId.slice(0, 6)}` };
          }
        }));
        if (!cancelled) setUpNext(tracks);
      } catch {}
    };
    const timer = window.setInterval(updateUpcoming, 8000);
    updateUpcoming();
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [loggedIn, playlistIndex]);

  function playPlaylistTrack(index) {
    const player = playerRef.current;
    if (!player || !Number.isInteger(index)) return;
    try {
      // Mantém a reprodução dentro da playlist para que Próxima/Anterior e UP NEXT continuem sincronizados.
      player.playVideoAt(index);
      setPlaylistIndex(index);
    } catch {}
  }

  function togglePlayback() {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (player.getPlayerState() === window.YT?.PlayerState?.PLAYING) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } catch {}
  }

  function nextTrack() {
    try {
      playerRef.current?.nextVideo();
    } catch {}
  }

  function previousTrack() {
    try {
      playerRef.current?.previousVideo();
    } catch {}
  }

  function seekTrack(event) {
    const player = playerRef.current;
    if (!player || !duration) return;
    const value = Number(event.target.value);
    player.seekTo(value, true);
    setCurrentTime(value);
  }

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) return "0:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  useEffect(() => {
    function handlePointerMove(event) {
      if (dragRef.current) {
        const drag = dragRef.current;

        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;

        setFiles((current) =>
          current.map((file) =>
            file.id === drag.id
              ? {
                  ...file,
                  x: Math.max(0, drag.fileX + dx),
                  y: Math.max(0, drag.fileY + dy),
                }
              : file
          )
        );
      }

      if (windowDragRef.current) {
        const drag = windowDragRef.current;

        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;

        setWindows((current) =>
          current.map((win) =>
            win.id === drag.id
              ? {
                  ...win,
                  x: Math.max(-window.innerWidth + 100, Math.min(window.innerWidth - 80, drag.windowX + dx)),
                  y: Math.max(48, Math.min(window.innerHeight - 90, drag.windowY + dy)),
                }
              : win
          )
        );
      }
    }

    function handlePointerUp() {
      dragRef.current = null;
      windowDragRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  function login(event) {
    event.preventDefault();

    const name = nameInput.trim();

    if (!name) return;

    setUsername(name);
    setLoggedIn(true);
  }

  function openWindow(file, content = null) {
    const id = `${file.id}-${Date.now()}`;

    const newWindow = {
      id,
      fileId: file.id,
      title: file.name,
      type: file.type,
      content: content ?? file.content ?? "",
      x: isMobile ? 12 + (windows.length % 4) * 12 : 180 + (windows.length % 5) * 35,
      y: isMobile ? 60 + (windows.length % 4) * 18 : 100 + (windows.length % 5) * 30,
      z: ++nextZ.current,
    };

    setWindows((current) => [...current, newWindow]);
    setActiveWindow(id);
  }

  function openFile(file) {
    if (file.type === "folder") {
      openWindow({
        ...file,
        type: "folder",
      });
      return;
    }

    if (file.type === "music") {
      openWindow(file);
      return;
    }

    openWindow(file);
  }

  function closeWindow(id) {
    setWindows((current) => current.filter((win) => win.id !== id));

    if (activeWindow === id) {
      setActiveWindow(null);
    }
  }

  function focusWindow(id) {
    setActiveWindow(id);
    setWindows((current) =>
      current.map((win) =>
        win.id === id ? { ...win, z: ++nextZ.current } : win
      )
    );
  }

  function startWindowDrag(event, win) {
    if (event.target.closest("button")) return;

    focusWindow(win.id);
    if (event.currentTarget.setPointerCapture && event.pointerId !== undefined) {
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch {}
    }

    windowDragRef.current = {
      id: win.id,
      startX: event.clientX,
      startY: event.clientY,
      windowX: win.x,
      windowY: win.y,
    };
  }

  function startFileDrag(event, file) {
    if (event.button !== 0) return;

    dragRef.current = {
      id: file.id,
      startX: event.clientX,
      startY: event.clientY,
      fileX: file.x,
      fileY: file.y,
    };

    setSelectedFile(file.id);
  }

  function getYouTubeId(url) {
    try {
      const parsed = new URL(url);

      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.slice(1).split("/")[0];
      }

      if (
        parsed.hostname.includes("youtube.com") ||
        parsed.hostname.includes("youtube-nocookie.com")
      ) {
        if (parsed.pathname === "/watch") {
          return parsed.searchParams.get("v");
        }

        const match = parsed.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/);

        return match ? match[2] : null;
      }

      return null;
    } catch {
      return null;
    }
  }

  function renderWindowContent(win) {
    if (win.type === "folder") {
      const contents = folderContents[win.fileId] ?? [];

      return (
        <div className="folder-content">
          {contents.map((file) => (
            <button
              className="folder-item"
              key={file.id}
              onDoubleClick={() => openFile(file)}
              onClick={() => setSelectedFile(file.id)}
            >
              <Icon type={file.icon} size={25} />
              <span>{file.name}</span>
            </button>
          ))}

          {contents.length === 0 && (
            <p className="empty-folder">Esta pasta está vazia.</p>
          )}
        </div>
      );
    }

    if (win.type === "music") {
      const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

      return (
        <div className="music-content">
          <div className="music-heading">
            <div className="music-artwork music-cover">
              <Icon type="music" size={38} />
            </div>

            <div className="music-track-info">
              <h3>{trackTitle}</h3>
              <p>ENFANT RADIO · YouTube playlist</p>
            </div>
          </div>

          <div className="music-progress-wrap">
            <input
              className="music-progress"
              aria-label="Progresso da música"
              type="range"
              min="0"
              max={Math.max(duration, 1)}
              value={Math.min(currentTime, duration || 0)}
              onChange={seekTrack}
              style={{ "--progress": `${progress}%` }}
            />
            <div className="music-time">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="music-controls">
            <button type="button" onClick={previousTrack} aria-label="Música anterior" title="Anterior">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14M19 6l-9 6 9 6z" /></svg>
            </button>
            <button type="button" className="music-play" onClick={togglePlayback} aria-label={isPlaying ? "Pausar" : "Reproduzir"} title={isPlaying ? "Pausar" : "Reproduzir"}>
              {isPlaying ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z" /></svg>
              )}
            </button>
            <button type="button" onClick={nextTrack} aria-label="Próxima música" title="Próxima">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5v14M5 6l9 6-9 6z" /></svg>
            </button>
          </div>

          <div className="music-footer">
            <span className={isPlaying ? "music-live-dot playing" : "music-live-dot"} />
            <span>{isPlaying ? "TOCANDO" : "PLAYER PRONTO"}</span>
            <span className="music-volume-label">VOLUME DO YOUTUBE</span>
          </div>

          <section className="up-next" aria-label="Próximas cinco faixas">
            <div className="up-next-heading">
              <span>UP NEXT</span>
              <span>PRÓXIMAS FAIXAS</span>
            </div>
            {upNext.length ? (
              <ol className="up-next-list">
                {upNext.slice(0, 5).map((track, index) => (
                  <li key={track.videoId}>
                    <button type="button" onClick={() => playPlaylistTrack(track.index)}>
                      <span className="up-next-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="up-next-title">{track.title}</span>
                      <span className="up-next-play" aria-hidden="true">▶</span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="up-next-empty">Carregando a fila da playlist…</p>
            )}
          </section>
        </div>
      );
    }

    if (win.type === "video") {
      return (
        <div className="file-placeholder">
          <Icon type="video" size={44} />
          <h3>Vídeo</h3>
          <p>Adicione um vídeo a este espaço quando quiser.</p>
        </div>
      );
    }

    if (win.type === "image") {
      return (
        <div className="file-placeholder">
          <Icon type="image" size={44} />
          <h3>Imagem</h3>
          <p>Suas imagens poderão aparecer aqui.</p>
        </div>
      );
    }

    return (
      <div className="text-content">
        {win.fileId === "about" ? (
          <>
            <p className="document-date">ENFANT T. / NOTAS PESSOAIS</p>
            <h2>Sobre mim.</h2>
            <p>
              Um espaço pessoal para reunir ideias, projetos, músicas e
              referências.
            </p>
            <p>
              Aos poucos, este lugar ganha a sua cara.
            </p>
          </>
        ) : (
          <p>{win.content || "Este arquivo está vazio."}</p>
        )}
      </div>
    );
  }

  if (!loggedIn) {
  return (
    <main className="login-screen">
      <div className="lock-screen">
        <div className="lock-clock">
          <h1>
            {clock.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </h1>

          <p>
            {clock.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        <div className="signin-panel">
          <div className="signin-avatar">
            <svg
              viewBox="0 0 24 24"
              width="46"
              height="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
            </svg>
          </div>

          <h2>ENFANT T.</h2>

          <form onSubmit={login} className="signin-form">
            <input
              id="username"
              type="text"
              placeholder="Nome de usuário"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              autoComplete="name"
              maxLength={32}
              autoFocus
            />

            <button
              type="submit"
              disabled={!nameInput.trim()}
              aria-label="Entrar"
              title="Entrar"
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>

        <div className="lock-footer">
          <span>ENFANT T.</span>

          <div className="lock-status">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>

            <span>SESSÃO LOCAL</span>
          </div>
        </div>
      </div>
    </main>
  );
}

  return (
    <main
      className="desktop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          setSelectedFile(null);
        }
      }}
    >
      <header className="topbar">
        <div className="topbar-brand">
          <span className="mini-brand">E.</span>
          <span>ENFANT T.</span>
        </div>

        <div className="topbar-right">
          <span>{username}</span>
          <span className="topbar-divider" />
          <span>
            {clock.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </header>

      <div id="enfant-youtube-engine" className="youtube-engine" aria-hidden="true" />

      <aside className="persistent-player" aria-label="Player de música">
        <div className="persistent-art">
          <Icon type="music" size={20} />
        </div>
        <div className="persistent-track">
          <strong>{trackTitle}</strong>
          <span>{isPlaying ? "Tocando agora" : "ENFANT RADIO"}</span>
        </div>
        <button type="button" onClick={previousTrack} aria-label="Faixa anterior" title="Anterior">|◀</button>
        <button type="button" className="persistent-play" onClick={togglePlayback} aria-label={isPlaying ? "Pausar música" : "Tocar música"} title={isPlaying ? "Pausar" : "Tocar"}>
          {isPlaying ? "Ⅱ" : "▶"}
        </button>
        <button type="button" onClick={nextTrack} aria-label="Próxima faixa" title="Próxima">▶|</button>
      </aside>

      <section className="desktop-files" aria-label="Arquivos da área de trabalho">
        {files.map((file) => (
          <button
            key={file.id}
            className={`desktop-file ${
              selectedFile === file.id ? "selected" : ""
            }`}
            style={{
              left: file.x,
              top: file.y,
            }}
            onPointerDown={(event) => startFileDrag(event, file)}
            onClick={() => {
              setSelectedFile(file.id);
              if (isMobile) openFile(file);
            }}
            onDoubleClick={() => { if (!isMobile) openFile(file); }}
            onContextMenu={(event) => {
              event.preventDefault();
              openFile(file);
            }}
            title={`Clique duas vezes para abrir ${file.name}`}
          >
            <span className={`file-icon icon-${file.icon}`}>
              <Icon type={file.icon} size={29} />
            </span>

            <span className="file-name">{file.name}</span>
          </button>
        ))}
      </section>

      {windows.map((win) => (
        <section
          key={win.id}
          className={`window ${
            activeWindow === win.id ? "window-active" : ""
          }`}
          style={{
            left: win.x,
            top: win.y,
            zIndex: win.z,
          }}
          onPointerDown={() => focusWindow(win.id)}
        >
          <header
            className="window-header"
            onPointerDown={(event) => startWindowDrag(event, win)}
          >
            <WindowControls onClose={() => closeWindow(win.id)} />

            <span className="window-title">{win.title}</span>

            <span className="window-header-spacer" />
          </header>

          <div className="window-body">{renderWindowContent(win)}</div>
        </section>
      ))}

      <nav className="dock" aria-label="Dock">
        <button
          className="dock-app home-app"
          onClick={() => {
            setWindows([]);
            setActiveWindow(null);
          }}
          title="Área de trabalho"
        >
          E.
        </button>

        <span className="dock-separator" />

        {windows.map((win) => (
          <button
            key={win.id}
            className={`dock-app ${
              activeWindow === win.id ? "dock-app-active" : ""
            }`}
            onClick={() => focusWindow(win.id)}
            title={win.title}
          >
            <Icon type={win.type === "folder" ? "folder" : win.type} size={22} />
          </button>
        ))}

        <span className="dock-separator" />

        <span className="dock-clock">
          {clock.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </nav>

    </main>
  );
}

export default App;