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
  participantsOpenButton.textContent = "参加者紹介を見る";
  participantsOpenButton.className = "mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-festival px-6 py-4 text-lg font-black text-white shadow-sm transition hover:bg-festivalDark";
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
