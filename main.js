const courseContainers = {
  A: document.querySelector("#articles-course-a"),
  B: document.querySelector("#articles-course-b"),
  C: document.querySelector("#articles-course-c")
};

const articleLibraryLists = document.querySelector("#article-library-lists");
const articleLibraryOpenAt = new Date("2026-06-17T00:00:00+09:00");

const emptyMessages = {
  A: "Aコースの記事はこれから追加されます。",
  B: "Bコースの記事はこれから追加されます。",
  C: "Cコースの記事はこれから追加されます。"
};

function createArticleCard(article) {
  const card = document.createElement("article");
  card.className = "flex min-h-44 flex-col justify-between rounded-lg border border-[#eadfd4] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";

  const title = document.createElement("a");
  title.className = "text-lg font-black leading-7 text-deep underline decoration-festival/40 underline-offset-4 hover:text-festivalDark";
  title.href = article.url;
  title.target = "_blank";
  title.rel = "noopener noreferrer";
  title.textContent = article.title;

  const meta = document.createElement("dl");
  meta.className = "mt-5 grid gap-2 text-sm text-slate-600";
  meta.innerHTML = `
    <div class="flex items-center justify-between gap-3 border-t border-[#f0e7df] pt-2">
      <dt class="font-bold text-slate-500">note</dt>
      <dd class="text-right">${article.authorName}</dd>
    </div>
    <div class="flex items-center justify-between gap-3 border-t border-[#f0e7df] pt-2">
      <dt class="font-bold text-slate-500">Substack</dt>
      <dd class="text-right">${article.substackName}</dd>
    </div>
  `;

  card.append(title, meta);
  return card;
}

function renderEmptyState(course) {
  const container = courseContainers[course];
  const empty = document.createElement("p");
  empty.className = "rounded-lg border border-dashed border-[#eadfd4] bg-white p-6 text-center text-slate-500 md:col-span-2 xl:col-span-3";
  empty.textContent = emptyMessages[course];
  container.appendChild(empty);
}

function renderArticles(articles) {
  Object.values(courseContainers).forEach((container) => {
    container.replaceChildren();
  });

  Object.keys(courseContainers).forEach((course) => {
    const courseArticles = articles.filter((article) => article.course === course);

    if (courseArticles.length === 0) {
      renderEmptyState(course);
      return;
    }

    courseArticles.forEach((article) => {
      courseContainers[course].appendChild(createArticleCard(article));
    });
  });
}

async function loadArticles() {
  if (new Date() < articleLibraryOpenAt) {
    return;
  }

  articleLibraryLists.classList.remove("hidden");
  articleLibraryLists.classList.add("grid");

  try {
    const response = await fetch("articles.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("articles.json could not be loaded.");
    }
    const articles = await response.json();
    renderArticles(Array.isArray(articles) ? articles : []);
  } catch (error) {
    console.error(error);
    renderArticles([]);
  }
}

loadArticles();

const participantsOpenButton = document.querySelector("#participants-open-button");

function setupParticipantsOpenButton() {
  if (!participantsOpenButton) return;

  const openAt = new Date(participantsOpenButton.dataset.openAt);
  const now = new Date();
  const isOpen = now >= openAt;

  if (!isOpen) {
    participantsOpenButton.textContent = "6月17日（水）公開予定";
    participantsOpenButton.setAttribute("aria-disabled", "true");
    return;
  }

  participantsOpenButton.disabled = false;
  participantsOpenButton.removeAttribute("aria-disabled");
  participantsOpenButton.textContent = "参加者を見る";
  participantsOpenButton.className = "inline-flex min-h-12 items-center justify-center rounded-lg bg-deep px-5 py-3 font-black text-white transition hover:bg-slate-700";
  participantsOpenButton.addEventListener("click", () => {
    window.location.href = participantsOpenButton.dataset.href;
  });
}

setupParticipantsOpenButton();

const audioPlayer = document.querySelector("[data-audio-player]");

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function setupAudioPlayer() {
  if (!audioPlayer) return;

  const audio = audioPlayer.querySelector("audio");
  const toggle = audioPlayer.querySelector(".audio-toggle");
  const seek = audioPlayer.querySelector(".audio-seek");
  const time = audioPlayer.querySelector(".audio-time");

  function updateTime() {
    seek.value = audio.duration ? String((audio.currentTime / audio.duration) * 100) : "0";
    time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  }

  toggle.addEventListener("click", async () => {
    if (audio.paused) {
      await audio.play();
      toggle.textContent = "Ⅱ";
      toggle.setAttribute("aria-label", "テーマソングを一時停止");
    } else {
      audio.pause();
      toggle.textContent = "▶";
      toggle.setAttribute("aria-label", "テーマソングを再生");
    }
  });

  seek.addEventListener("input", () => {
    if (!audio.duration) return;
    audio.currentTime = (Number(seek.value) / 100) * audio.duration;
  });

  audio.addEventListener("loadedmetadata", updateTime);
  audio.addEventListener("timeupdate", updateTime);
  audio.addEventListener("ended", () => {
    toggle.textContent = "▶";
    toggle.setAttribute("aria-label", "テーマソングを再生");
    updateTime();
  });
}

setupAudioPlayer();
