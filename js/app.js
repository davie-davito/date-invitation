/**
 * Date Invitation — main application logic
 */
(function () {
  "use strict";

  const FORMSPREE_URL = window.FORMSPREE_CONFIG?.formId
    ? `https://formspree.io/f/${window.FORMSPREE_CONFIG.formId}`
    : null;

  // DOM refs
  const screenAsk = document.getElementById("screen-ask");
  const screenWizard = document.getElementById("screen-wizard");
  const screenSuccess = document.getElementById("screen-success");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const buttonArea = document.getElementById("button-area");
  const teaseText = document.getElementById("tease-text");
  const btnBack = document.getElementById("btn-back");
  const btnNext = document.getElementById("btn-next");
  const formError = document.getElementById("form-error");
  const summaryEl = document.getElementById("summary");
  const datePicker = document.getElementById("date-picker");
  const confettiCanvas = document.getElementById("confetti-canvas");

  const wizardSteps = document.querySelectorAll(".wizard-step");
  const progressDots = document.querySelectorAll(".progress-dots .dot");

  let currentStep = 0;
  let noDodgeCount = 0;
  let lastProximityDodge = 0;
  const PROXIMITY_MARGIN = 58;
  const PROXIMITY_COOLDOWN_MS = 130;
  const teaseMessages = [
    "Are you sure? 🥺",
    "Really  sure?",
    "The Yes button is right there…",
    "I'll make it worth your while 💕",
    "you will never regret it sweetie ",
    "Pretty please?",
  ];

  // --- Screen transitions ---
  function showScreen(from, to) {
    from.classList.remove("active");
    from.hidden = true;
    to.hidden = false;
    requestAnimationFrame(() => to.classList.add("active"));
  }

  // --- Runaway No button ---
  function moveNoButton() {
    const area = buttonArea.getBoundingClientRect();
    const btn = btnNo.getBoundingClientRect();
    const padding = 8;
    const maxX = area.width - btn.width - padding;
    const maxY = area.height - btn.height - padding;

    const x = Math.max(padding, Math.random() * maxX);
    const y = Math.max(padding, Math.random() * maxY);

    btnNo.style.left = `${x}px`;
    btnNo.style.top = `${y}px`;

    noDodgeCount++;
    if (noDodgeCount >= 1) {
      teaseText.classList.remove("hidden");
      const msgIndex = Math.min(noDodgeCount - 1, teaseMessages.length - 1);
      teaseText.textContent = teaseMessages[msgIndex];
    }
    if (noDodgeCount >= 7) {
      btnNo.classList.add("shrinking");
    }
  }

  function isNearNoButton(clientX, clientY) {
    const rect = btnNo.getBoundingClientRect();
    return (
      clientX >= rect.left - PROXIMITY_MARGIN &&
      clientX <= rect.right + PROXIMITY_MARGIN &&
      clientY >= rect.top - PROXIMITY_MARGIN &&
      clientY <= rect.bottom + PROXIMITY_MARGIN
    );
  }

  function checkProximityDodge(clientX, clientY) {
    const now = Date.now();
    if (now - lastProximityDodge < PROXIMITY_COOLDOWN_MS) return;
    if (!isNearNoButton(clientX, clientY)) return;
    lastProximityDodge = now;
    moveNoButton();
  }

  function handleTouchProximity(e) {
    if (!screenAsk.classList.contains("active")) return;
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      checkProximityDodge(touch.clientX, touch.clientY);
    }
  }

  function initNoButton() {
    btnNo.style.position = "absolute";
    const yesRect = btnYes.getBoundingClientRect();
    const areaRect = buttonArea.getBoundingClientRect();
    btnNo.style.left = `${yesRect.right - areaRect.left + 16}px`;
    btnNo.style.top = `${(areaRect.height - btnNo.offsetHeight) / 2}px`;

    // Desktop: dodge on hover
    btnNo.addEventListener("mouseenter", moveNoButton);

    // Mobile: dodge when finger gets close (before/at tap)
    screenAsk.addEventListener("touchstart", handleTouchProximity, { passive: true });
    screenAsk.addEventListener("touchmove", handleTouchProximity, { passive: true });

    btnNo.addEventListener("touchstart", (e) => {
      e.preventDefault();
      moveNoButton();
    }, { passive: false });

    btnNo.addEventListener("click", (e) => {
      e.preventDefault();
      moveNoButton();
    });
  }

  btnYes.addEventListener("click", () => {
    showScreen(screenAsk, screenWizard);
    setMinDate();
  });

  // --- Wizard ---
  function updateWizardUI() {
    wizardSteps.forEach((step, i) => {
      const isActive = i === currentStep;
      step.hidden = !isActive;
      step.classList.toggle("active", isActive);
    });

    progressDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentStep);
      dot.classList.toggle("done", i < currentStep);
      dot.setAttribute("aria-valuenow", String(currentStep + 1));
    });

    btnBack.hidden = currentStep === 0;
    btnNext.textContent = currentStep === wizardSteps.length - 1 ? "Seal the date" : "Next";
  }

  function getSelectedRadio(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
  }

  function validateStep(step) {
    formError.classList.add("hidden");
    formError.textContent = "";

    if (step === 0 && !getSelectedRadio("dateVibe")) {
      formError.textContent = "Please pick a date vibe to continue.";
      formError.classList.remove("hidden");
      return false;
    }
    if (step === 1 && !getSelectedRadio("location")) {
      formError.textContent = "Please choose a location preference.";
      formError.classList.remove("hidden");
      return false;
    }
    if (step === 2) {
      if (!datePicker.value) {
        formError.textContent = "Please pick a date.";
        formError.classList.remove("hidden");
        return false;
      }
      if (!getSelectedRadio("timeSlot")) {
        formError.textContent = "Please pick a time of day.";
        formError.classList.remove("hidden");
        return false;
      }
    }
    return true;
  }

  function setMinDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    datePicker.min = `${yyyy}-${mm}-${dd}`;
  }

  function collectFormData() {
    const timePicker = document.getElementById("time-picker");
    const nameInput = document.getElementById("name-input");
    const noteInput = document.getElementById("note-input");

    const timeSlot = getSelectedRadio("timeSlot");
    const specificTime = timePicker.value;
    const timeLabel = specificTime
      ? `${timeSlot} (${formatTime(specificTime)})`
      : timeSlot;

    return {
      dateVibe: getSelectedRadio("dateVibe"),
      location: getSelectedRadio("location"),
      date: formatDate(datePicker.value),
      time: timeLabel,
      name: nameInput.value.trim() || "(not provided)",
      note: noteInput.value.trim() || "(none)",
      submittedAt: new Date().toISOString(),
      _subject: "New date invitation response! 💕",
    };
  }

  function formatDate(isoDate) {
    const d = new Date(isoDate + "T12:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(time24) {
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
  }

  function renderSummary(data) {
    const items = [
      ["Date vibe", data.dateVibe],
      ["Location", data.location],
      ["When", `${data.date} — ${data.time}`],
      ["Name", data.name],
    ];
    if (data.note && data.note !== "(none)") {
      items.push(["Note", data.note]);
    }

    summaryEl.innerHTML =
      "<dl>" +
      items
        .map(([dt, dd]) => `<dt>${dt}</dt><dd>${escapeHtml(dd)}</dd>`)
        .join("") +
      "</dl>";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function submitForm() {
    if (!FORMSPREE_URL) {
      formError.textContent =
        "Form is not configured yet. Add your Formspree ID in js/config.js — see README.md.";
      formError.classList.remove("hidden");
      return false;
    }

    btnNext.disabled = true;
    btnNext.textContent = "Sending…";

    try {
      const data = collectFormData();
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Something went wrong. Please try again.");
      }

      renderSummary(data);
      showScreen(screenWizard, screenSuccess);
      launchConfetti();
      return true;
    } catch (err) {
      formError.textContent = err.message || "Failed to send. Please try again.";
      formError.classList.remove("hidden");
      return false;
    } finally {
      btnNext.disabled = false;
      btnNext.textContent =
        currentStep === wizardSteps.length - 1 ? "Seal the date" : "Next";
    }
  }

  btnBack.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      updateWizardUI();
      formError.classList.add("hidden");
    }
  });

  btnNext.addEventListener("click", async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < wizardSteps.length - 1) {
      currentStep++;
      updateWizardUI();
      return;
    }

    await submitForm();
  });

  // Auto-advance on card selection (steps 0–1)
  document.querySelectorAll(".option-card input, .option-row input").forEach((input) => {
    input.addEventListener("change", () => {
      if (currentStep <= 1 && validateStep(currentStep)) {
        setTimeout(() => {
          if (currentStep < 2) {
            currentStep++;
            updateWizardUI();
          }
        }, 350);
      }
    });
  });

  // --- Confetti ---
  function launchConfetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = confettiCanvas.getContext("2d");
    const w = (confettiCanvas.width = window.innerWidth);
    const h = (confettiCanvas.height = window.innerHeight);

    const colors = ["#f7b955", "#ffcf8a", "#ff7a6b", "#ff5c8a", "#e23e7a", "#ffb3c8", "#fff3e6"];
    const particles = Array.from({ length: 120 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 200,
      y: h / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -14 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 10,
      life: 1,
    }));

    let frame = 0;
    const maxFrames = 180;

    function tick() {
      ctx.clearRect(0, 0, w, h);
      let alive = false;

      particles.forEach((p) => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.rotation += p.spin;
        p.life -= 1 / maxFrames;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      frame++;
      if (alive && frame < maxFrames) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }

    requestAnimationFrame(tick);
  }

  // --- Init ---
  initNoButton();
  updateWizardUI();
})();
