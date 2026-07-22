import { execFileSync } from "node:child_process";
import { seasonStories } from "../src/data.js";

const MAX_SECONDS = 12 * 60;
const failures = [];

for (const [season, story] of Object.entries(seasonStories)) {
  for (const video of story.videos || []) {
    let result;
    try {
      result = execFileSync("yt-dlp", [
        "--no-update", "--skip-download", "--no-warnings",
        "--print", "%(duration)s\t%(playable_in_embed)s\t%(availability)s\t%(age_limit)s\t%(channel)s\t%(title)s",
        `https://www.youtube.com/watch?v=${video.youtubeId}`,
      ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    } catch (error) {
      const reason = error.code === "ENOENT" ? "yt-dlp is not installed" : "video could not be resolved";
      failures.push(`${season} ${video.youtubeId}: ${reason}`);
      continue;
    }

    const [durationValue, embedValue, availability, ageLimitValue, channel, currentTitle] = result.split("\t");
    const duration = Number(durationValue);
    const problems = [];
    if (!Number.isFinite(duration) || duration <= 0) problems.push("unknown duration");
    if (duration > MAX_SECONDS) problems.push(`${Math.ceil(duration / 60)} minutes exceeds the 12-minute ceiling`);
    if (embedValue !== "True") problems.push("external embedding is disabled");
    if (availability !== "public") problems.push(`availability is ${availability || "unknown"}`);
    if (Number(ageLimitValue) > 0) problems.push(`age restriction is ${ageLimitValue}+`);
    if (problems.length) failures.push(`${season} ${video.youtubeId}: ${problems.join(", ")}`);
    else console.log(`Video verified: ${season} · ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")} · ${channel} · ${currentTitle}`);
  }
}

if (failures.length) {
  console.error(`\nVideo gate failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}

console.log(`\nVideo gate passed for ${Object.values(seasonStories).reduce((total, story) => total + (story.videos?.length || 0), 0)} chapter videos.`);
