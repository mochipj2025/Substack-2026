const participantsList = document.querySelector("#participants-list");
const participantsLocked = document.querySelector("#participants-locked");
const participantsDirectory = document.querySelector("#participants-directory");
const participantsFilter = document.querySelector("#participants-filter");
const participantsFilterStatus = document.querySelector("#participants-filter-status");
const participantsOpenAt = new Date("2026-06-17T00:00:00+09:00");
let allParticipants = [];
let activeCourseFilter = "all";

const courseLabels = {
  A: "Aコース：使う理由",
  B: "Bコース：記事紹介",
  C: "Cコース：使い分け"
};

const filterLabels = {
  all: "すべて",
  A: "Aコース：使う理由",
  B: "Bコース：記事紹介",
  C: "Cコース：使い分け"
};

function createParticipantCard(participant) {
  const card = document.createElement("article");
  card.className = "flex min-h-64 flex-col justify-between rounded-lg border border-[#eadfd4] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";

  const header = document.createElement("div");
  header.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-black text-festivalDark">${courseLabels[participant.course] ?? "参加者"}</p>
        <h3 class="mt-2 text-2xl font-black leading-tight text-deep">${participant.name}</h3>
      </div>
      <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-festival text-lg font-black text-white">${participant.course}</span>
    </div>
    <p class="mt-4 leading-8 text-slate-600">${participant.bio}</p>
    <p class="mt-4 rounded-lg bg-[#fff4e8] px-4 py-3 font-bold text-deep">${participant.substackName}</p>
  `;

  const links = document.createElement("div");
  links.className = "mt-6 grid grid-cols-2 gap-3";

  const noteLink = createExternalLink("note", participant.noteUrl, "border border-[#eadfd4] text-deep hover:border-festival hover:text-festivalDark");
  const substackLink = createExternalLink("Substack", participant.substackUrl, "bg-festival text-white hover:bg-festivalDark");

  links.append(noteLink, substackLink);
  card.append(header, links);
  return card;
}

function createExternalLink(label, url, className) {
  const link = document.createElement("a");
  link.className = `inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-black transition ${className}`;
  link.textContent = label;

  if (url) {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  } else {
    link.href = "#";
    link.setAttribute("aria-disabled", "true");
    link.className = "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#eadfd4] px-4 py-2 text-sm font-black text-slate-400";
    link.addEventListener("click", (event) => event.preventDefault());
  }

  return link;
}

function getFilteredParticipants() {
  if (activeCourseFilter === "all") return allParticipants;
  return allParticipants.filter((participant) => participant.course === activeCourseFilter);
}

function updateFilterButtons() {
  if (!participantsFilter) return;

  participantsFilter.querySelectorAll("[data-course-filter]").forEach((button) => {
    const isActive = button.dataset.courseFilter === activeCourseFilter;
    button.setAttribute("aria-pressed", String(isActive));
    button.className = isActive
      ? "rounded-full bg-deep px-3 py-2 text-sm font-black text-white"
      : "rounded-full bg-[#fff4e8] px-3 py-2 text-sm font-black text-festivalDark transition hover:bg-[#ffe3c2]";
  });
}

function updateFilterStatus(count) {
  if (!participantsFilterStatus) return;

  const total = allParticipants.length;
  const label = filterLabels[activeCourseFilter] ?? "参加者";
  participantsFilterStatus.textContent = activeCourseFilter === "all"
    ? `現在 ${total}人を掲載しています。確認できた参加者から順次追加します。`
    : `${label}：${count}人を表示中です。`;
}

function renderParticipants(participants = getFilteredParticipants()) {
  participantsList.replaceChildren();
  updateFilterButtons();
  updateFilterStatus(participants.length);

  if (participants.length === 0) {
    const empty = document.createElement("p");
    empty.className = "rounded-lg border border-dashed border-[#eadfd4] bg-white p-6 text-center text-slate-500 md:col-span-2 xl:col-span-3";
    empty.textContent = activeCourseFilter === "all"
      ? "参加者紹介はこれから追加されます。"
      : "このコースの参加者は、確認できしだい追加します。";
    participantsList.appendChild(empty);
    return;
  }

  participants.forEach((participant) => {
    participantsList.appendChild(createParticipantCard(participant));
  });
}

async function loadParticipants() {
  try {
    const participantsResponse = await fetch("participants.json", { cache: "no-store" });
    if (!participantsResponse.ok) {
      throw new Error("participants.json could not be loaded.");
    }
    const participants = await participantsResponse.json();
    allParticipants = Array.isArray(participants) ? participants : [];
    renderParticipants();
  } catch (error) {
    console.error(error);
    allParticipants = [];
    renderParticipants([]);
  }
}

function isParticipantsPageOpen() {
  return new Date() >= participantsOpenAt;
}

if (isParticipantsPageOpen()) {
  participantsLocked.classList.add("hidden");
  participantsDirectory.classList.remove("hidden");
  loadParticipants();
} else {
  participantsLocked.classList.remove("hidden");
  participantsDirectory.classList.add("hidden");
}

if (participantsFilter) {
  participantsFilter.addEventListener("click", (event) => {
    const button = event.target.closest("[data-course-filter]");
    if (!button) return;

    activeCourseFilter = button.dataset.courseFilter;
    renderParticipants();
  });
}
