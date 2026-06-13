const participantsList = document.querySelector("#participants-list");
const participantsLocked = document.querySelector("#participants-locked");
const participantsDirectory = document.querySelector("#participants-directory");
const participantsOpenAt = new Date("2026-06-17T00:00:00+09:00");

const courseLabels = {
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

  const noteLink = document.createElement("a");
  noteLink.className = "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#eadfd4] px-4 py-2 text-sm font-black text-deep hover:border-festival hover:text-festivalDark";
  noteLink.href = participant.noteUrl;
  noteLink.target = "_blank";
  noteLink.rel = "noopener noreferrer";
  noteLink.textContent = "note";

  const substackLink = document.createElement("a");
  substackLink.className = "inline-flex min-h-11 items-center justify-center rounded-lg bg-festival px-4 py-2 text-sm font-black text-white hover:bg-festivalDark";
  substackLink.href = participant.substackUrl;
  substackLink.target = "_blank";
  substackLink.rel = "noopener noreferrer";
  substackLink.textContent = "Substack";

  links.append(noteLink, substackLink);
  card.append(header, links);
  return card;
}

function renderParticipants(participants) {
  participantsList.replaceChildren();

  if (participants.length === 0) {
    const empty = document.createElement("p");
    empty.className = "rounded-lg border border-dashed border-[#eadfd4] bg-white p-6 text-center text-slate-500 md:col-span-2 xl:col-span-3";
    empty.textContent = "参加者紹介はこれから追加されます。";
    participantsList.appendChild(empty);
    return;
  }

  participants.forEach((participant) => {
    participantsList.appendChild(createParticipantCard(participant));
  });
}

async function loadParticipants() {
  try {
    const response = await fetch("participants.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("participants.json could not be loaded.");
    }
    const participants = await response.json();
    renderParticipants(Array.isArray(participants) ? participants : []);
  } catch (error) {
    console.error(error);
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
