import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Play,
  Check,
  ChevronRight,
  Trophy,
  CalendarDays,
  Clapperboard,
  RotateCcw,
  X,
  ExternalLink,
  Star,
  Mic2,
  BookOpen,
  Video,
  Headphones,
  LogOut,
} from "lucide-react";
import {
  seasons,
  films,
  interviews,
  podcasts,
  books,
  honourLedger,
} from "./data";
import TrophyMark from "./TrophyMark";
import "./style.css";
import "./theme.css";
import "./media.css";
import "./trophies.css";
import "./library.css";

const STORE = "messi-vault-v1";
const getState = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(`${STORE}:${userId}`)) || {};
  } catch {
    return {};
  }
};
function App({ user, onLogout }) {
  const storeKey = `${STORE}:${user.id}`;
  const [syncReady, setSyncReady] = useState(false);
  const [tab, setTab] = useState("career"),
    [selected, setSelected] = useState(seasons[18]),
    [watch, setWatch] = useState(() => getState(user.id).watch || {}),
    [seen, setSeen] = useState(() => getState(user.id).seen || {}),
    [query, setQuery] = useState(""),
    [type, setType] = useState("All"),
    [modal, setModal] = useState(null);
  useEffect(() => {
    let active = true;
    fetch("/api/progress")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((remote) => {
        if (active) {
          setWatch((v) => ({ ...v, ...remote.watch }));
          setSeen((v) => ({ ...v, ...remote.seen }));
        }
      })
      .catch(() => {})
      .finally(() => active && setSyncReady(true));
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    localStorage.setItem(storeKey, JSON.stringify({ watch, seen }));
    if (!syncReady) return;
    const timer = setTimeout(
      () =>
        fetch("/api/progress", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ watch, seen }),
        }).catch(() => {}),
      250,
    );
    return () => clearTimeout(timer);
  }, [watch, seen, syncReady, storeKey]);
  const totalLibrary =
    films.length + interviews.length + podcasts.length + books.length;
  const watched = Object.values(watch).filter(Boolean).length;
  const toggle = (id) => setWatch((v) => ({ ...v, [id]: !v[id] }));
  return (
    <div className="app">
      <aside>
        <div className="brand">
          <span>10</span>
          <div>
            THE MESSI
            <br />
            <b>ARCHIVE</b>
          </div>
        </div>
        <nav>
          <button
            className={tab === "career" ? "active" : ""}
            onClick={() => setTab("career")}
          >
            <CalendarDays /> Career timeline
          </button>
          <button
            className={tab === "watch" ? "active" : ""}
            onClick={() => setTab("watch")}
          >
            <Clapperboard /> Library <i>{totalLibrary}</i>
          </button>
        </nav>
        <div className="side-card">
          <p>YOUR JOURNEY</p>
          <strong>
            {watched}
            <small> / {totalLibrary}</small>
          </strong>
          <span>stories completed</span>
          <div className="bar">
            <i style={{ width: `${(watched / totalLibrary) * 100}%` }} />
          </div>
          <em>{Math.round((watched / totalLibrary) * 100)}% complete</em>
        </div>
        <blockquote>
          “You have to fight to reach your dream.”<small>— Lionel Messi</small>
        </blockquote>
      </aside>
      <main>
        <header>
          <div>
            <span>THE COMPLETE JOURNEY</span>
            <h1>
              {tab === "career" ? "Season by season." : "Watch. Listen. Read."}
            </h1>
            <p>
              {tab === "career"
                ? "From La Masia to the roof of the world — explore every chapter of Leo's career."
                : "Films, long-form conversations, guest podcasts and books from around the world."}
            </p>
          </div>
          <button className="account" onClick={onLogout} title="Sign out">
            <span>{user.email.slice(0, 1).toUpperCase()}</span>
            <small>{user.email}</small>
            <LogOut />
          </button>
        </header>
        {tab === "career" ? (
          <Career
            selected={selected}
            setSelected={setSelected}
            seen={seen}
            setSeen={setSeen}
          />
        ) : (
          <Library
            query={query}
            setQuery={setQuery}
            type={type}
            setType={setType}
            watch={watch}
            toggle={toggle}
            setModal={setModal}
            films={films}
            interviews={interviews}
            podcasts={podcasts}
            books={books}
          />
        )}
      </main>
      {modal && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setModal(null)}>
              <X />
            </button>
            <div
              className={`poster big ${modal.poster ? "has-image" : ""}`}
              style={
                modal.poster
                  ? {
                      backgroundImage: `linear-gradient(90deg,#08101c22,#08101c88),url(${modal.poster})`,
                    }
                  : undefined
              }
            >
              {!modal.poster && modal.year}
              <Play />
            </div>
            <label>
              {modal.type} · {modal.country}
            </label>
            <div className="modal-heading">
              <h2>{modal.title}</h2>
              <a
                className="imdb-rating large"
                href={modal.imdbUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Star />
                {modal.imdbRating || "NR"}
                <small>/10 IMDb</small>
              </a>
            </div>
            <p>{modal.description}</p>
            <div className="meta">
              <span>{modal.runtime}</span>
              <span>{modal.focus}</span>
              <PlatformMark name={modal.platform} withName />
            </div>
            <div className="modal-actions">
              <button
                className={watch[modal.id] ? "done" : ""}
                onClick={() => toggle(modal.id)}
              >
                {watch[modal.id] ? (
                  <>
                    <Check /> Watched
                  </>
                ) : (
                  <>
                    <Play /> Mark watched
                  </>
                )}
              </button>
              <a href={modal.url} target="_blank" rel="noreferrer">
                Find where to watch <ExternalLink />
              </a>
              <a href={modal.imdbUrl} target="_blank" rel="noreferrer">
                IMDb page <ExternalLink />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LegacyTrophyMark({ type }) {
  return (
    <svg
      className={`trophy-mark ${type}`}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {type === "ucl" ? (
          <>
            <path d="M14 9c-6 2-8 8-5 14 2 4 6 6 10 5M34 9c6 2 8 8 5 14-2 4-6 6-10 5" />
            <path d="M16 7h16v13c0 7-4 12-8 12s-8-5-8-12V7zM24 32v7M17 41h14" />
          </>
        ) : type === "world" ? (
          <>
            <circle cx="24" cy="11" r="7" />
            <path d="M19 17c-6 7-5 14 1 18l-4 7h16l-4-7c6-4 7-11 1-18M18 24h12" />
          </>
        ) : type === "ball" || type === "goldball" ? (
          <>
            <circle cx="24" cy="18" r="11" />
            <path d="M17 16l4-5 6 1 4 6-3 7-8 1-4-6zM19 33h10l4 9H15z" />
          </>
        ) : type === "boot" || type === "pichichi" ? (
          <>
            <path d="M10 28c8 0 12-9 13-18l8 3-2 10c4 4 8 6 11 7v7H10zM14 37v4M35 37v4" />
          </>
        ) : type === "shield" ? (
          <path d="M9 10h30v13c0 10-7 16-15 20-8-4-15-10-15-20V10zM16 18h16M16 25h16" />
        ) : type === "medal" ? (
          <>
            <path d="M15 5l9 14L33 5M19 5l5 8 5-8" />
            <circle cx="24" cy="29" r="11" />
            <path d="M24 24v10M19 29h10" />
          </>
        ) : type === "leagues" ? (
          <>
            <path d="M12 8l10 8-8 8-6-5zM36 8l-10 8 8 8 6-5zM17 29l7-7 7 7-7 13z" />
          </>
        ) : type === "mvp" || type === "star" ? (
          <>
            <path d="M24 5l5 11 12 2-9 8 3 12-11-6-11 6 3-12-9-8 12-2z" />
            <circle cx="24" cy="24" r="4" />
          </>
        ) : type === "assist" ? (
          <>
            <circle cx="15" cy="26" r="7" />
            <path d="M22 26h16M31 19l7 7-7 7" />
          </>
        ) : type === "clubworld" ? (
          <>
            <path d="M11 31c5-16 16-24 27-22-2 13-10 25-25 30M15 14c8 0 15 7 15 15" />
            <circle cx="25" cy="24" r="5" />
          </>
        ) : type === "mls" ? (
          <>
            <path d="M10 8h28v10c0 12-6 19-14 24-8-5-14-12-14-24V8z" />
            <path d="M15 13h18v7c0 7-4 12-9 16-5-4-9-9-9-16z" />
          </>
        ) : (
          <>
            <path d="M15 7h18v12c0 8-4 13-9 13s-9-5-9-13V7zM24 32v7M17 41h14M15 12H8c0 8 3 12 9 12M33 12h7c0 8-3 12-9 12" />
          </>
        )}
      </g>
    </svg>
  );
}

function Honours({ season }) {
  const h = honourLedger[season] || { team: [], individual: [] };
  const Group = ({ title, items, kind }) => (
    <div className="honour-group">
      <div className="honour-title">
        <span>{title}</span>
        <b>{items.length}</b>
      </div>
      {items.length ? (
        <div className="honour-list">
          {items.map(([name, type]) => (
            <div className="honour-item" key={name}>
              <TrophyMark type={type} />
              <span>
                <small>{kind}</small>
                {name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-honours">
          No major {kind.toLowerCase()} honours this season
        </p>
      )}
    </div>
  );
  return (
    <div className="honours-ledger">
      <Group title="TEAM HONOURS" items={h.team} kind="Trophy" />
      <Group title="INDIVIDUAL HONOURS" items={h.individual} kind="Award" />
    </div>
  );
}

const platformLogos = {
  netflix:
    "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
  disney:
    "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
  apple:
    "https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg",
  prime: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png",
  bbc: "https://upload.wikimedia.org/wikipedia/commons/e/ee/BBC_iPlayer_%282021%29.svg",
  max: "https://upload.wikimedia.org/wikipedia/commons/3/37/Max_2025_logo.svg",
};

function PlatformMark({ name, withName = false }) {
  const key = name.includes("Netflix")
    ? "netflix"
    : name.includes("Disney")
      ? "disney"
      : name.includes("Apple")
        ? "apple"
        : name.includes("Prime")
          ? "prime"
          : name.includes("BBC")
            ? "bbc"
            : name.includes("Max")
              ? "max"
              : "rent";
  return (
    <span className={`platform-mark ${key}`} title={name} aria-label={name}>
      {platformLogos[key] ? <img src={platformLogos[key]} alt="" /> : <Play />}
      {withName && <em>{name}</em>}
    </span>
  );
}

function Career({ selected, setSelected, seen, setSeen }) {
  const idx = seasons.indexOf(selected);
  const clubKey = selected.club.startsWith("Barcelona")
    ? "barca"
    : selected.club.startsWith("Paris")
      ? "paris"
      : "miami";
  const clubDetails = {
    barca: {
      name: "FC Barcelona",
      badge: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/120px-FC_Barcelona_%28crest%29.svg.png",
    },
    paris: {
      name: "Paris Saint-Germain",
      badge: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/120px-Paris_Saint-Germain_F.C..svg.png",
    },
    miami: {
      name: "Inter Miami CF",
      badge: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Inter_Miami_CF_logo.svg/120px-Inter_Miami_CF_logo.svg.png",
    },
  }[clubKey];
  const shirtNumber = clubKey === "paris" ? 30 : clubKey === "miami" ? 10 : idx < 2 ? 30 : idx < 4 ? 19 : 10;
  return (
    <>
      <section className="stats">
        <div>
          <Trophy />
          <span>
            <b>48</b>career trophies
          </span>
        </div>
        <div>
          <b>8×</b>
          <span>Ballon d’Or</span>
        </div>
        <div>
          <b>4×</b>
          <span>Champions League</span>
        </div>
        <div>
          <b>1×</b>
          <span>World Cup</span>
        </div>
      </section>
      <div className="career-grid">
        <section className="timeline">
          <div className="section-head">
            <div>
              <span>CHAPTERS</span>
              <h2>Senior career</h2>
            </div>
            <small>{seasons.length} seasons</small>
          </div>
          {seasons.map((s, i) => (
            <button
              key={s.id}
              className={selected.id === s.id ? "season active" : ""}
              onClick={() => setSelected(s)}
            >
              <i className={seen[s.id] ? "seen" : ""}>
                {seen[s.id] ? <Check /> : i + 1}
              </i>
              <span className="season-copy">
                <b className="season-year">{s.season}</b>
                <small className="season-club">{s.club}</small>
              </span>
              <ChevronRight />
            </button>
          ))}
        </section>
        <section className="chapter">
          <div
            className={`hero ${clubKey}`}
          >
            <span className="season-watermark">{selected.season}</span>
            <div className="hero-copy">
              <small>CHAPTER {String(idx + 1).padStart(2, "0")}</small>
              <h2>{selected.title}</h2>
              <p>{selected.club}</p>
            </div>
            <div className="club-kit">
              <img src={clubDetails.badge} alt={`${clubDetails.name} badge`} />
              <div className={`messi-shirt ${clubKey}`} aria-label={`Messi number ${shirtNumber} shirt`}>
                <span>MESSI</span>
                <b>{shirtNumber}</b>
              </div>
            </div>
          </div>
          <div className="chapter-body">
            <p className="lead">{selected.story}</p>
            {selected.apps && (
              <div className="numbers">
                <div>
                  <b>{selected.apps}</b>
                  <span>Appearances</span>
                </div>
                <div>
                  <b>{selected.goals}</b>
                  <span>Goals</span>
                </div>
                <div>
                  <b>{selected.assists}</b>
                  <span>Assists</span>
                </div>
              </div>
            )}
            <Honours season={selected.season} />
            <button
              className={seen[selected.id] ? "complete" : ""}
              onClick={() =>
                setSeen((v) => ({ ...v, [selected.id]: !v[selected.id] }))
              }
            >
              {seen[selected.id] ? (
                <>
                  <Check /> Chapter explored
                </>
              ) : (
                <>
                  Mark chapter explored <ChevronRight />
                </>
              )}
            </button>
            <small className="note">
              Club stats across all competitions. Honours are assigned to the
              season or calendar year in which they were won; monthly awards and
              team-of-the-week selections are excluded.
            </small>
          </div>
        </section>
      </div>
    </>
  );
}

function Library({
  query,
  setQuery,
  type,
  setType,
  watch,
  toggle,
  setModal,
  films,
  interviews,
  podcasts,
  books,
}) {
  const [collection, setCollection] = useState("screen");
  const [playing, setPlaying] = useState(null);
  const [language, setLanguage] = useState("All");
  const matches = (value) => value.toLowerCase().includes(query.toLowerCase());
  const filtered = films.filter(
    (f) =>
      (type === "All" || f.type === type) &&
      matches(`${f.title} ${f.country} ${f.focus} ${f.platform}`),
  );
  const foundInterviews = interviews.filter((i) =>
    matches(`${i.title} ${i.host} ${i.language} ${i.year}`),
  );
  const foundPodcasts = podcasts.filter((p) =>
    matches(`${p.title} ${p.show} ${p.language} ${p.platform} ${p.year}`),
  );
  const foundBooks = books.filter(
    (b) =>
      (language === "All" || b.language === language) &&
      matches(`${b.title} ${b.author} ${b.language} ${b.kind}`),
  );
  const collections = [
    ["screen", "Films & series", films.length, Clapperboard],
    ["interviews", "Long interviews", interviews.length, Mic2],
    ["podcasts", "Podcasts", podcasts.length, Headphones],
    ["books", "Books", books.length, BookOpen],
  ];
  const activeItems =
    collection === "screen"
      ? filtered
      : collection === "interviews"
        ? foundInterviews
        : collection === "podcasts"
          ? foundPodcasts
          : foundBooks;
  const play = (id) => setPlaying((current) => (current === id ? null : id));
  return (
    <>
      <div className="collection-tabs">
        {collections.map(([id, label, count, Icon]) => (
          <button
            key={id}
            className={collection === id ? "active" : ""}
            onClick={() => {
              setCollection(id);
              setPlaying(null);
            }}
          >
            <Icon /> <span>{label}</span> <i>{count}</i>
          </button>
        ))}
      </div>
      <div className="library-tools">
        <div className="search">
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              collection === "books"
                ? "Search books, authors, languages…"
                : collection === "interviews"
                  ? "Search interviews, hosts, years…"
                  : collection === "podcasts"
                    ? "Search podcasts, shows, platforms…"
                    : "Search titles, countries, eras…"
            }
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X />
            </button>
          )}
        </div>
        {collection === "screen" && (
          <div className="chips">
            {["All", "Film", "Docuseries", "Episode"].map((x) => (
              <button
                key={x}
                className={type === x ? "active" : ""}
                onClick={() => setType(x)}
              >
                {x}
              </button>
            ))}
          </div>
        )}
        {collection === "books" && (
          <div className="chips">
            {["All", ...new Set(books.map((b) => b.language))].map((x) => (
              <button
                key={x}
                className={language === x ? "active" : ""}
                onClick={() => setLanguage(x)}
              >
                {x}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="library-head">
        <h2>
          {activeItems.length}{" "}
          {collection === "books"
            ? "books"
            : collection === "interviews"
              ? "conversations"
              : collection === "podcasts"
                ? "guest episodes"
                : "stories"}
        </h2>
        <span>
          {collection === "screen"
            ? "IMDb ratings change over time · availability varies by country"
            : collection === "books"
              ? "Editions and Amazon availability vary by region"
              : collection === "podcasts"
                ? "Verified guest appearances only · podcasts merely discussing Messi are excluded"
                : "Full-length original conversations · no press conferences or clip compilations"}
        </span>
      </div>
      {collection === "screen" && (
        <section className="film-grid">
          {filtered.map((f, i) => (
            <React.Fragment key={f.id}>
              <article className={watch[f.id] ? "watched" : ""}>
                <button
                  className={`poster ${f.poster ? "has-image" : ""}`}
                  style={
                    f.poster
                      ? {
                          backgroundImage: `linear-gradient(0deg,#08101ccc 0%,transparent 65%),url(${f.poster})`,
                        }
                      : undefined
                  }
                  onClick={() => setModal(f)}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <Play />
                </button>
                <div className="film-copy">
                  <div className="film-kicker">
                    <label>
                      {f.year} · {f.country}
                    </label>
                    <a
                      className="imdb-rating"
                      href={f.imdbUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Open IMDb"
                    >
                      <Star />
                      {f.imdbRating || "NR"}
                      <small>/10</small>
                    </a>
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                  <div className="tags">
                    <span>{f.type}</span>
                    <span>{f.runtime}</span>
                    <PlatformMark name={f.platform} />
                  </div>
                  <div className="actions">
                    {f.trailerId ? (
                      <button
                        className="trailer-button"
                        onClick={() => play(f.id)}
                      >
                        <Video />{" "}
                        {playing === f.id ? "Close trailer" : "Watch trailer"}
                      </button>
                    ) : (
                      <button onClick={() => setModal(f)}>
                        View details <ChevronRight />
                      </button>
                    )}
                    <a
                      className="imdb-link"
                      href={f.imdbUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      IMDb <ExternalLink />
                    </a>
                    <button
                      className="tick"
                      title="Mark watched"
                      onClick={() => toggle(f.id)}
                    >
                      {watch[f.id] ? <Check /> : <span />}
                    </button>
                  </div>
                </div>
              </article>
              {playing === f.id && f.trailerId && (
                <Trailer
                  videoId={f.trailerId}
                  title={`${f.title} trailer`}
                  close={() => setPlaying(null)}
                />
              )}
            </React.Fragment>
          ))}
        </section>
      )}
      {collection === "interviews" && (
        <section className="interview-grid">
          {foundInterviews.map((item) => (
            <article
              className={watch[`interview:${item.id}`] ? "watched" : ""}
              key={item.id}
            >
              <button
                className="video-thumb"
                onClick={() => play(item.id)}
                style={{
                  backgroundImage: `linear-gradient(0deg,#07101dcc,transparent),url(https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg)`,
                }}
              >
                <Play />
                <span>{item.runtime}</span>
              </button>
              <div className="interview-copy">
                <label>
                  {item.year} · {item.language}
                </label>
                <h3>{item.title}</h3>
                <strong>{item.host}</strong>
                <p>{item.description}</p>
                <div className="actions">
                  <button onClick={() => play(item.id)}>
                    <Video /> {playing === item.id ? "Close" : "Watch here"}
                  </button>
                  <button
                    className="tick"
                    onClick={() => toggle(`interview:${item.id}`)}
                  >
                    {watch[`interview:${item.id}`] ? <Check /> : <span />}
                  </button>
                </div>
              </div>
              {playing === item.id && (
                <Trailer
                  videoId={item.videoId}
                  title={item.title}
                  close={() => setPlaying(null)}
                />
              )}
            </article>
          ))}
        </section>
      )}
      {collection === "podcasts" && (
        <section className="interview-grid podcast-grid">
          {foundPodcasts.map((item) => (
            <article
              className={watch[`podcast:${item.id}`] ? "watched" : ""}
              key={item.id}
            >
              {item.videoId ? (
                <button
                  className="video-thumb"
                  onClick={() => play(item.id)}
                  style={{
                    backgroundImage: `linear-gradient(0deg,#07101dcc,transparent),url(https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg)`,
                  }}
                >
                  <Headphones />
                  <span>{item.runtime}</span>
                </button>
              ) : (
                <a
                  className="video-thumb podcast-art"
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Headphones />
                  <b>BIG TIME</b>
                  <span>{item.runtime}</span>
                </a>
              )}
              <div className="interview-copy">
                <label>
                  {item.year} · {item.language}
                </label>
                <h3>{item.title}</h3>
                <strong>{item.show}</strong>
                <p>{item.description}</p>
                <div className="actions">
                  {item.videoId ? (
                    <button onClick={() => play(item.id)}>
                      <Video /> {playing === item.id ? "Close" : "Watch here"}
                    </button>
                  ) : (
                    <a
                      className="podcast-link"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open on {item.platform} <ExternalLink />
                    </a>
                  )}
                  <button
                    className="tick"
                    title="Mark listened"
                    onClick={() => toggle(`podcast:${item.id}`)}
                  >
                    {watch[`podcast:${item.id}`] ? <Check /> : <span />}
                  </button>
                </div>
              </div>
              {playing === item.id && item.videoId && (
                <Trailer
                  videoId={item.videoId}
                  title={item.title}
                  close={() => setPlaying(null)}
                />
              )}
            </article>
          ))}
        </section>
      )}
      {collection === "books" && (
        <section className="book-grid">
          {foundBooks.map((book) => (
            <article
              className={watch[`book:${book.id}`] ? "watched" : ""}
              key={book.id}
            >
              <div
                className={`book-cover ${book.cover ? "" : "fallback"}`}
                style={
                  book.cover
                    ? { backgroundImage: `url(${book.cover})` }
                    : undefined
                }
              >
                {!book.cover && (
                  <>
                    <small>LIONEL</small>
                    <b>MESSI</b>
                    <span>10</span>
                  </>
                )}
              </div>
              <div className="book-copy">
                <label>
                  {book.language} · {book.year}
                </label>
                <h3>{book.title}</h3>
                <strong>{book.author}</strong>
                <p>{book.kind}</p>
                <div className="actions">
                  <a
                    className="amazon-link"
                    href={book.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Find on Amazon <ExternalLink />
                  </a>
                  <button
                    className="tick"
                    title="Mark read"
                    onClick={() => toggle(`book:${book.id}`)}
                  >
                    {watch[`book:${book.id}`] ? <Check /> : <span />}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
      {!activeItems.length && (
        <div className="empty">
          <RotateCcw />
          <h2>No stories found</h2>
          <button
            onClick={() => {
              setQuery("");
              setType("All");
              setLanguage("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}

function Trailer({ videoId, title, close }) {
  return (
    <div className="trailer-panel">
      <button
        className="trailer-close"
        onClick={close}
        aria-label="Close video"
      >
        <X />
      </button>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function Login({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not sign in");
      onAuthenticated(data.user);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-mark">10</div>
        <span>THE MESSI ARCHIVE</span>
        <h1>{mode === "login" ? "Welcome back." : "Start your journey."}</h1>
        <p>Your progress follows you across every device.</p>
        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password</label>
          <input
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            minLength="8"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="login-error">{error}</div>}
          <button disabled={busy}>
            {busy
              ? "One moment…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
        <button
          className="login-switch"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already registered? Sign in"}
        </button>
      </section>
    </main>
  );
}

function Root() {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) =>
        setUser(response.ok ? (await response.json()).user : null),
      )
      .catch(() => setUser(null));
  }, []);
  if (user === undefined) return <div className="app-loading">10</div>;
  if (!user) return <Login onAuthenticated={setUser} />;
  return (
    <App
      user={user}
      onLogout={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
      }}
    />
  );
}

createRoot(document.getElementById("root")).render(<Root />);
