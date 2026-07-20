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
} from "lucide-react";
import { seasons, films, interviews, books, honourLedger } from "./data";
import TrophyMark from "./TrophyMark";
import "./style.css";
import "./theme.css";
import "./media.css";
import "./trophies.css";
import "./library.css";

const STORE = "messi-vault-v1";
const PROFILE = "messi-vault-profile";
const getState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || {};
  } catch {
    return {};
  }
};
const getProfile = () => {
  let id = localStorage.getItem(PROFILE);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PROFILE, id);
  }
  return id;
};

function App() {
  const [profile] = useState(getProfile);
  const [syncReady, setSyncReady] = useState(false);
  const [tab, setTab] = useState("career"),
    [selected, setSelected] = useState(seasons[18]),
    [watch, setWatch] = useState(() => getState().watch || {}),
    [seen, setSeen] = useState(() => getState().seen || {}),
    [query, setQuery] = useState(""),
    [type, setType] = useState("All"),
    [modal, setModal] = useState(null);
  useEffect(() => {
    let active = true;
    fetch(`/api/progress/${profile}`)
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
  }, [profile]);
  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify({ watch, seen }));
    if (!syncReady) return;
    const timer = setTimeout(
      () =>
        fetch(`/api/progress/${profile}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ watch, seen }),
        }).catch(() => {}),
      250,
    );
    return () => clearTimeout(timer);
  }, [watch, seen, profile, syncReady]);
  const totalLibrary = films.length + interviews.length + books.length;
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
                : "Films, long-form conversations and books from around the world, all in one place."}
            </p>
          </div>
          <div className="avatar">LM</div>
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
              <span>
                <b>{s.season}</b>
                <small>{s.club}</small>
              </span>
              <ChevronRight />
            </button>
          ))}
        </section>
        <section className="chapter">
          <div
            className={`hero ${selected.club.startsWith("Barcelona") ? "barca" : selected.club.startsWith("Paris") ? "paris" : "miami"}`}
          >
            <span>{selected.season}</span>
            <div>
              <small>CHAPTER {String(idx + 1).padStart(2, "0")}</small>
              <h2>{selected.title}</h2>
              <p>{selected.club}</p>
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
  const foundBooks = books.filter(
    (b) =>
      (language === "All" || b.language === language) &&
      matches(`${b.title} ${b.author} ${b.language} ${b.kind}`),
  );
  const collections = [
    ["screen", "Films & series", films.length, Clapperboard],
    ["interviews", "Long interviews", interviews.length, Mic2],
    ["books", "Books", books.length, BookOpen],
  ];
  const activeItems =
    collection === "screen"
      ? filtered
      : collection === "interviews"
        ? foundInterviews
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
              : "stories"}
        </h2>
        <span>
          {collection === "screen"
            ? "IMDb ratings change over time · availability varies by country"
            : collection === "books"
              ? "Editions and Amazon availability vary by region"
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

createRoot(document.getElementById("root")).render(<App />);
