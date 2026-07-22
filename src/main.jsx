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
  Newspaper,
  Users,
  Download,
} from "lucide-react";
import {
  seasons,
  films,
  interviews,
  podcasts,
  books,
  honourLedger,
  seasonStories,
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
  const initialView = new URLSearchParams(window.location.search).get("view");
  const storeKey = `${STORE}:${user.id}`;
  const [syncReady, setSyncReady] = useState(false);
  const [tab, setTab] = useState(initialView === "articles" ? "articles" : ["films", "interviews", "podcasts", "books"].includes(initialView) ? "watch" : "career"),
    [selected, setSelected] = useState(seasons[18]),
    [watch, setWatch] = useState(() => getState(user.id).watch || {}),
    [seen, setSeen] = useState(() => getState(user.id).seen || {}),
    [query, setQuery] = useState(""),
    [type, setType] = useState("All"),
    [collection, setCollection] = useState(initialView === "films" ? "screen" : ["interviews", "podcasts", "books"].includes(initialView) ? initialView : "screen"),
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
  const isAdmin = user.email === "ukaushik37@gmail.com";
  const toggle = (id) => setWatch((v) => ({ ...v, [id]: !v[id] }));
  const libraryNav = [
    ["screen", "Films", films.length, Clapperboard],
    ["interviews", "Interviews", interviews.length, Mic2],
    ["podcasts", "Podcasts", podcasts.length, Headphones],
    ["books", "Books", books.length, BookOpen],
  ];
  const openCollection = (id) => {
    setTab("watch");
    setCollection(id);
  };
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span>10</span>
          <div>
            THE MESSI
            <br />
            <b>ARCHIVE</b>
          </div>
        </div>
        <nav className="primary-nav" aria-label="Main navigation">
          <button
            className={tab === "career" ? "active" : ""}
            onClick={() => setTab("career")}
          >
            <CalendarDays /> Timeline
          </button>
          <button
            className={tab === "articles" ? "active" : ""}
            onClick={() => setTab("articles")}
          >
            <Newspaper /> Articles <i>{Object.keys(seasonStories).length}</i>
          </button>
          {libraryNav.map(([id, label, count, Icon]) => (
            <button
              key={id}
              className={tab === "watch" && collection === id ? "active" : ""}
              onClick={() => openCollection(id)}
            >
              <Icon /> {label} <i>{count}</i>
            </button>
          ))}
          {isAdmin && <button className={tab === "admin" ? "active" : ""} onClick={() => setTab("admin")}><Users /> Admin</button>}
        </nav>
        <div className="journey-pulse" title="Your library progress">
          <span>{watched}</span>
          <small>/{totalLibrary} watched</small>
        </div>
        <button className="account" onClick={onLogout} title="Sign out">
          <span>{user.email.slice(0, 1).toUpperCase()}</span>
          <small>{user.email}</small>
          <LogOut />
        </button>
      </header>
      <main>
        <section className="page-intro">
          <div>
            <span>THE COMPLETE JOURNEY</span>
            <h1>
              {tab === "career"
                ? "Season by season."
                : tab === "articles"
                  ? "The long reads."
                : tab === "admin" ? "Your readership." : "Watch. Listen. Read."}
            </h1>
            <p>
              {tab === "career"
                ? "Every season as a complete archive — the story, honours, films, conversations and books in one place."
                : tab === "articles"
                  ? "Original, researched season stories from the first steps at Barça to the final chapters."
                  : tab === "admin" ? "A private view of the readers following Floodlight Editions." : "Films, long-form conversations, guest podcasts and books from around the world."}
            </p>
          </div>
        </section>
        {tab === "career" ? (
          <Career
            selected={selected}
            setSelected={setSelected}
            seen={seen}
            setSeen={setSeen}
            setModal={setModal}
          />
        ) : tab === "articles" ? (
          <Articles />
        ) : tab === "admin" && isAdmin ? (
          <AdminSubscribers />
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
            collection={collection}
          />
        )}
      </main>
      <SiteFooter source="app" />
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

function AdminSubscribers() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/admin/subscribers")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load subscribers");
        setData(body);
      })
      .catch((failure) => setError(failure.message));
  }, []);
  return <section className="admin-subscribers">
    <header><div><span>FLOODLIGHT EDITIONS</span><h2>{data ? data.total : "—"} subscribers</h2><p>Your private manuscript and publishing audience.</p></div><a href="/api/admin/subscribers.csv"><Download /> Export CSV</a></header>
    {error && <div className="admin-empty">{error}</div>}
    {!data && !error && <div className="admin-empty">Loading readership…</div>}
    {data && <div className="subscriber-table"><div className="subscriber-row table-head"><span>Email</span><span>Source</span><span>Joined</span><span>Status</span></div>{data.subscribers.map((subscriber) => <div className="subscriber-row" key={subscriber.email}><strong>{subscriber.email}</strong><span>{subscriber.source}</span><time>{new Date(subscriber.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time><i>{subscriber.status}</i></div>)}</div>}
    {data?.total === 0 && <div className="admin-empty"><Users /><b>Your first readers will appear here.</b><span>Every footer signup is saved automatically.</span></div>}
  </section>;
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

const readingMinutes = (story) =>
  Math.max(1, Math.ceil([story.dek, ...story.paragraphs].join(" ").trim().split(/\s+/).length / 220));

const articlePath = (season, story) =>
  `/articles/${season.replace("–", "-")}/${story.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}/`;
const storyEntries = seasons
  .map(({ season }) => [season, seasonStories[season]])
  .filter(([, story]) => story);

function LongRead({ story, season }) {
  if (!story) return null;
  return (
    <details className="season-essay" id={`long-read-${season.replace(/[^0-9]/g, "-")}`}>
      <summary>
        <span><small>THE LONG READ · {season}</small><b>{story.title}</b></span>
        <em>{readingMinutes(story)} min read</em><ChevronRight />
      </summary>
      <article>
        <p className="essay-dek">{story.dek}</p>
        {story.paragraphs.map((paragraph, i) => {
          const photo = story.photos?.find((item) => item.after === i);
          const video = story.videos?.find((item) => item.after === i);
          return <React.Fragment key={i}>
            <p>{paragraph}</p>
            {photo && <figure><img src={photo.src} alt={photo.alt} loading="lazy" /><figcaption><span>{photo.caption}</span><a href={photo.href} target="_blank" rel="noreferrer">Photo: {photo.credit} <ExternalLink /></a></figcaption></figure>}
            {video && <figure className="essay-video"><div><iframe src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0`} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><figcaption><span>{video.caption}</span><a href={video.href} target="_blank" rel="noreferrer">Video: {video.credit} <ExternalLink /></a></figcaption></figure>}
          </React.Fragment>;
        })}
        <footer><span>RESEARCH SOURCES</span>{story.sources.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{label} <ExternalLink /></a>)}</footer>
      </article>
    </details>
  );
}

function Articles() {
  return <section className="articles-page">
    <div className="articles-heading"><span>{Object.keys(seasonStories).length} PUBLISHED</span><h2>A career, told properly.</h2><p>Original, researched and chronological long-form football writing.</p></div>
    {storyEntries.map(([season, story]) => <div className="article-volume" key={season}>
      <a className="article-volume-cover" href={articlePath(season, story)} style={{ backgroundImage: `linear-gradient(90deg,rgba(3,10,23,.9) 0%,rgba(3,10,23,.66) 54%,rgba(3,10,23,.78) 100%),linear-gradient(0deg,rgba(3,10,23,.8),transparent 55%),url(${story.photos?.[0]?.src || ""})` }} aria-label={`Read ${story.title}`}>
        <span>{season}</span><small>{readingMinutes(story)} MIN READ</small><h3>{story.title}</h3><p>{story.dek}</p>
        <b className="article-open">READ THE CHAPTER <ChevronRight /></b>
      </a>
      <LongRead story={story} season={season} />
    </div>)}
  </section>;
}

function SeasonArchive({ season, setModal }) {
  const year = Number(season.season.slice(0, 4));
  const story = seasonStories[season.season];
  const groups = [
    ["Films & series", films.filter((item) => Number(item.year) === year), "screen"],
    ["Interviews", interviews.filter((item) => Number(item.year) === year), "interview"],
    ["Podcasts", podcasts.filter((item) => Number(item.year) === year), "podcast"],
    ["Books", books.filter((item) => Number(item.year) === year), "book"],
  ].filter(([, items]) => items.length);
  const total = (story ? 1 : 0) + groups.reduce((sum, [, items]) => sum + items.length, 0);
  const renderArchiveItem = (label, item, kind) => {
    const href = kind === "interview" ? `https://www.youtube.com/watch?v=${item.videoId}` : item.url;
    const content = <>{item.poster || item.cover ? <img src={item.poster || item.cover} alt="" /> : kind === "screen" ? <Clapperboard /> : kind === "interview" ? <Mic2 /> : kind === "podcast" ? <Headphones /> : <BookOpen />}<span><small>{label} · {item.year}</small><b>{item.title}</b></span><ChevronRight /></>;
    return kind === "screen" ? <button className="archive-link" key={item.id} onClick={() => setModal(item)}>{content}</button> : <a className="archive-link" key={item.id} href={href} target="_blank" rel="noreferrer">{content}</a>;
  };
  return <section className="season-archive">
    <div className="season-archive-head"><div><span>SEASON ARCHIVE</span><h3>Everything from {season.season}</h3></div><small>{total} {total === 1 ? "piece" : "pieces"}</small></div>
    {story && <section className="archive-shelf long-read"><h4>Long read</h4><div className="archive-links"><a className="archive-link article-link" href={articlePath(season.season, story)} style={{ backgroundImage: `linear-gradient(90deg,rgba(4,12,27,.94),rgba(4,12,27,.63) 70%,rgba(4,12,27,.82)),url(${story.photos?.[0]?.src || ""})` }}><span className="archive-article-content"><small><Newspaper /> LONG READ · {season.season} · {readingMinutes(story)} MIN</small><b>{story.title}</b><p>{story.dek}</p><em>READ THE CHAPTER</em></span><ChevronRight /></a></div></section>}
    {groups.map(([label, items, kind]) => <section className={`archive-shelf ${kind}`} key={kind}><h4>{label}</h4><div className="archive-links">{items.map((item) => renderArchiveItem(label, item, kind))}</div></section>)}
    {!total && <p className="archive-empty">Nothing published for this season yet—the archive will grow as each chapter is researched.</p>}
  </section>;
}

function Career({ selected, setSelected, seen, setSeen, setModal }) {
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
              className={`season${selected.id === s.id ? " active" : ""}`}
              onClick={() => setSelected(s)}
            >
              <i className={seen[s.id] ? "seen" : ""}>
                {seen[s.id] ? <Check /> : i + 1}
              </i>
              <span className="season-copy">
                <b className="season-year">{s.season}</b>
                <small className="season-club">
                  <img
                    src={
                      s.club.startsWith("Barcelona")
                        ? "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/120px-FC_Barcelona_%28crest%29.svg.png"
                        : s.club.startsWith("Paris")
                          ? "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/120px-Paris_Saint-Germain_F.C..svg.png"
                          : "https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Inter_Miami_CF_logo.svg/120px-Inter_Miami_CF_logo.svg.png"
                    }
                    alt=""
                  />
                  {s.club}
                </small>
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
              <p className="hero-club">
                <img src={clubDetails.badge} alt={`${clubDetails.name} badge`} />
                {selected.club}
              </p>
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
            <SeasonArchive season={selected} setModal={setModal} />
            <Honours season={selected.season} />
            {seasonStories[selected.season] && (
              <details className="season-essay" id={`long-read-${selected.season.replace(/[^0-9]/g, "-")}`}>
                <summary>
                  <span>
                    <small>THE LONG READ</small>
                    <b>{seasonStories[selected.season].title}</b>
                  </span>
                  <em>
                    {Math.max(
                      1,
                      Math.ceil(
                        [
                          seasonStories[selected.season].dek,
                          ...seasonStories[selected.season].paragraphs,
                        ]
                          .join(" ")
                          .trim()
                          .split(/\s+/).length / 220,
                      ),
                    )} min read
                  </em>
                  <ChevronRight />
                </summary>
                <article>
                  <p className="essay-dek">{seasonStories[selected.season].dek}</p>
                  {seasonStories[selected.season].paragraphs.map((paragraph, i) => {
                    const photo = seasonStories[selected.season].photos?.find(
                      (item) => item.after === i,
                    );
                    const video = seasonStories[selected.season].videos?.find(
                      (item) => item.after === i,
                    );
                    return (
                      <React.Fragment key={i}>
                        <p>{paragraph}</p>
                        {photo && (
                          <figure>
                            <img src={photo.src} alt={photo.alt} loading="lazy" />
                            <figcaption>
                              <span>{photo.caption}</span>
                              <a href={photo.href} target="_blank" rel="noreferrer">
                                Photo: {photo.credit} <ExternalLink />
                              </a>
                            </figcaption>
                          </figure>
                        )}
                        {video && (
                          <figure className="essay-video">
                            <div>
                              <iframe
                                src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0`}
                                title={video.title}
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                            <figcaption>
                              <span>{video.caption}</span>
                              <a href={video.href} target="_blank" rel="noreferrer">
                                Video: {video.credit} <ExternalLink />
                              </a>
                            </figcaption>
                          </figure>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <footer>
                    <span>RESEARCH SOURCES</span>
                    {seasonStories[selected.season].sources.map(([label, url]) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer">
                        {label} <ExternalLink />
                      </a>
                    ))}
                  </footer>
                </article>
              </details>
            )}
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
  collection,
}) {
  const [playing, setPlaying] = useState(null);
  const [language, setLanguage] = useState("All");
  useEffect(() => setPlaying(null), [collection]);
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
    <div className="public-shell">
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
    <SiteFooter source="login" />
    </div>
  );
}

const legalCopy = {
  privacy: {
    title: "Privacy notice",
    intro: "A plain account of what we collect, why we collect it and the choices you have.",
    sections: [
      ["Who we are", <>The Messi Archive is published by Floodlight Editions, an independent editorial project operated by Utkarsh Kaushik. Privacy enquiries and deletion requests can be sent to <a href="mailto:ukaushik37@gmail.com">ukaushik37@gmail.com</a>.</>],
      ["What we collect", "When you create an account, we store your email address, a cryptographically hashed and salted password, authentication sessions, and the films, books, interviews, podcasts and seasons you mark as completed. If you join the mailing list, we store your email address, consent record, signup source and subscription status."],
      ["Why we use it", "We use account data to provide sign-in and synchronise your archive progress. We use mailing-list data only to send editorial news, new chapters and occasional publishing updates that you asked to receive. We do not sell personal data."],
      ["Storage and retention", "The service is hosted using Cloudflare. Login sessions expire after 30 days. Account and progress records remain while your account is active; subscriber records remain until you unsubscribe or ask us to delete them."],
      ["Your choices and rights", "You may ask for access, correction, deletion or a copy of your personal data, and may withdraw newsletter consent at any time. You may also complain to the UK Information Commissioner’s Office. Contact us using the address above."],
      ["Third-party media", "The archive links to and embeds services such as YouTube, IMDb, Amazon and streaming platforms. Opening or playing third-party media may allow that provider to process data under its own privacy policy."],
    ],
  },
  terms: {
    title: "Terms of use",
    intro: "The simple rules for using The Messi Archive.",
    sections: [
      ["The service", "The Messi Archive is an independent research, writing and media-discovery project. It is not affiliated with Lionel Messi, his representatives, FC Barcelona, Paris Saint-Germain, Inter Miami, the AFA, FIFA, UEFA or any other club or governing body."],
      ["Accounts", "Keep your sign-in details secure and provide accurate information. You are responsible for activity on your account. We may suspend access used to disrupt, scrape, attack or misuse the service."],
      ["Editorial material", "Original writing, site design and software are protected by copyright. You may link to articles and quote short passages with clear attribution. Reproduction, republication or commercial use requires written permission."],
      ["Third-party rights", "Club badges, trademarks, photographs, book covers, platform marks, trailers and linked material belong to their respective owners. Their appearance is for identification, criticism, review and archival context and does not imply endorsement."],
      ["Accuracy and availability", "We research the archive carefully, but cannot promise that every statistic, availability link or third-party listing will remain complete or current. The service may change or occasionally be unavailable."],
      ["Contact", <>Questions, corrections and rights requests may be sent to <a href="mailto:ukaushik37@gmail.com">ukaushik37@gmail.com</a>.</>],
    ],
  },
  cookies: {
    title: "Cookie notice",
    intro: "No advertising cookies, no analytics cookies and no unnecessary banner.",
    sections: [
      ["Essential session cookie", <><code>messi_session</code> keeps you securely signed in. It is HttpOnly, Secure and SameSite=Lax, and expires after 30 days. It is essential to the account service and cannot be switched off while you are signed in.</>],
      ["Device storage", "The app keeps a local copy of your viewing and reading progress in your browser so the interface remains responsive and can recover gracefully if the connection drops. Signed-in progress is also synchronised with your account."],
      ["Embedded services", "YouTube videos use the privacy-enhanced youtube-nocookie.com domain. A third-party provider may still store information when you choose to play or open its content. External destinations apply their own cookie policies."],
      ["Future changes", "If we introduce analytics, advertising or any non-essential cookies, we will update this notice and ask for consent before placing them."],
    ],
  },
};

function NewsletterForm({ source }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  async function subscribe(event) {
    event.preventDefault();
    setState("busy");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source, company: form.get("company") }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not subscribe");
      setState("done");
      setMessage("You’re on the list. Welcome to Floodlight Editions.");
      setEmail("");
    } catch (error) {
      setState("error");
      setMessage(error.message);
    }
  }
  return (
    <form className="newsletter-form" onSubmit={subscribe}>
      <label htmlFor={`newsletter-${source}`}>The next chapter, when it is ready.</label>
      <div><input id={`newsletter-${source}`} type="email" required placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} /><button disabled={state === "busy"}>{state === "busy" ? "Joining…" : "Join the list"}</button></div>
      <input className="field-trap" name="company" tabIndex="-1" autoComplete="off" aria-hidden="true" />
      <small>New long reads, archive releases and the road to the manuscript. Unsubscribe at any time.</small>
      {message && <p className={state === "error" ? "form-error" : "form-success"} role="status">{message}</p>}
    </form>
  );
}

function SiteFooter({ source = "site" }) {
  return (
    <footer className="site-footer">
      <div className="footer-editorial"><span>FLOODLIGHT EDITIONS</span><h2>Football lives,<br />told season by season.</h2><p>Independent, researched football writing with the patience of a book and the memory of an archive.</p></div>
      <NewsletterForm source={source} />
      <div className="footer-base"><p><b>The Messi Archive</b> is an independent editorial project and is not affiliated with Lionel Messi or any club or governing body.</p><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/cookies">Cookies</a><a href="mailto:ukaushik37@gmail.com">Contact</a></nav><small>© 2026 Floodlight Editions. All rights reserved. Third-party marks and media remain the property of their respective owners.</small></div>
    </footer>
  );
}

function LegalPage({ page }) {
  const content = legalCopy[page];
  return <div className="legal-page"><header><a className="legal-brand" href="/"><span>FLOODLIGHT EDITIONS</span><b>THE MESSI ARCHIVE</b></a><a href="/">Back to the archive</a></header><main><span>LAST UPDATED · 21 JULY 2026</span><h1>{content.title}</h1><p className="legal-intro">{content.intro}</p>{content.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}</main><SiteFooter source={`legal-${page}`} /></div>;
}

function Root() {
  const legalRoute = window.location.pathname.match(/^\/(privacy|terms|cookies)\/?$/)?.[1];
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) =>
        setUser(response.ok ? (await response.json()).user : null),
      )
      .catch(() => setUser(null));
  }, []);
  if (legalRoute) return <LegalPage page={legalRoute} />;
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
