/* ═══════════════════════════════════════════════════
   PAGE NAVIGATION
═══════════════════════════════════════════════════ */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add("active");
  }
}

/* ═══════════════════════════════════════════════════
   PAGE 1 — LOGIN
═══════════════════════════════════════════════════ */
const VALID_USERNAME = "marwa";
const VALID_PASSWORD = "ozzie123";

function initLogin() {
  spawnPetals();

  const loginBtn = document.getElementById("login-btn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("login-error");
  const loginCard = document.querySelector(".login-card");

  function attemptLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      loginError.textContent = "";
      loginBtn.textContent = "✨ Welcome, Queen! ✨";
      loginBtn.style.background = "linear-gradient(135deg, #2d6a4f, #40916c)";
      setTimeout(() => {
        showPage("page-birthday");
        initBirthdayPage();
      }, 900);
    } else {
      loginError.textContent = "Incorrect credentials. Try again 🌹";
      loginCard.classList.remove("shake");
      void loginCard.offsetWidth; // reflow to restart animation
      loginCard.classList.add("shake");
      passwordInput.value = "";
      setTimeout(() => loginCard.classList.remove("shake"), 600);
    }
  }

  loginBtn.addEventListener("click", attemptLogin);

  [usernameInput, passwordInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") attemptLogin();
    });
  });
}

/* Floating rose petals on login page */
function spawnPetals() {
  const container = document.getElementById("petals-bg");
  if (!container) return;

  const symbols = ["🌹", "🌸", "✿", "❀", "🌺", "❤️", "💕", "✦", "⭒"];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 10;
    const delay = Math.random() * 12;
    const sway = (Math.random() - 0.5) * 120;
    const size = 0.9 + Math.random() * 0.8;

    petal.style.left = `${left}vw`;
    petal.style.fontSize = `${size}rem`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;
    petal.style.setProperty("--sway", `${sway}px`);

    container.appendChild(petal);
  }
}

/* ═══════════════════════════════════════════════════
   PAGE 2 — BIRTHDAY CAKE (MediaPipe + Blow Detection)
═══════════════════════════════════════════════════ */
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const WEBCAM_WIDTH  = isMobile ? 240 : 300;
const WEBCAM_HEIGHT = isMobile ? 180 : 225;
const BLOW_THRESHOLD = 70;
const LIGHT_DISTANCE = 20;

let handPosition = { x: 0.5, y: 0.5 };
let isHandDetected = false;
let isCakeLit = false;
let isCandlesBlownOut = false;
let birthdayPageReady = false;

// MediaPipe Hands instance
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: isMobile ? 0 : 1,
  minDetectionConfidence: isMobile ? 0.6 : 0.7,
  minTrackingConfidence: isMobile ? 0.4 : 0.5,
});

hands.onResults((results) => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(results.image, -canvas.width, 0, canvas.width, canvas.height);
  ctx.restore();

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    isHandDetected = true;

    const indexTip = landmarks[8];
    handPosition.x = 1 - indexTip.x;
    handPosition.y = indexTip.y;

    updateMatchPosition();
    checkCandleLighting();
  } else {
    isHandDetected = false;
  }
});

function updateMatchPosition() {
  if (!isHandDetected) return;
  const match = document.querySelector(".match");
  const cakeArea = document.querySelector(".cake-area");
  if (!match || !cakeArea) return;

  const cakeRect = cakeArea.getBoundingClientRect();
  const padding = 20;
  const matchX = padding + handPosition.x * (cakeRect.width - padding * 2 - 40);
  const matchY = padding + handPosition.y * (cakeRect.height - padding * 2 - 60);

  match.style.left = `${matchX}px`;
  match.style.top  = `${matchY}px`;
}

function checkCandleLighting() {
  if (isCakeLit || isCandlesBlownOut) return;

  const match   = document.querySelector(".match");
  const cakeImg = document.querySelector(".cake");
  if (!match || !cakeImg) return;

  const matchRect = match.getBoundingClientRect();
  const cakeRect  = cakeImg.getBoundingClientRect();

  const matchTipX = matchRect.left + matchRect.width / 2;
  const matchTipY = matchRect.top;
  const candleX   = cakeRect.left + cakeRect.width / 2;
  const candleY   = cakeRect.top + 10;

  const distance = Math.sqrt(
    Math.pow(matchTipX - candleX, 2) + Math.pow(matchTipY - candleY, 2)
  );

  if (distance < LIGHT_DISTANCE) lightCake();
}

function lightCake() {
  if (isCakeLit) return;
  isCakeLit = true;

  const cakeImg = document.querySelector(".cake");
  const match   = document.querySelector(".match");
  if (cakeImg) cakeImg.src = "assets/cake_lit.gif";
  if (match)   match.style.display = "none";
}

function blowOutCandles() {
  if (!isCakeLit || isCandlesBlownOut) return;
  isCandlesBlownOut = true;

  const cakeImg = document.querySelector(".cake");
  if (cakeImg) cakeImg.src = "assets/cake_unlit.gif";

  createConfetti();

  // Navigate to message page after confetti burst
  setTimeout(() => {
    showPage("page-message");
    initMessagePage();
  }, 2200);
}

/* Blow detection */
let audioContext = null;
let analyser     = null;
let microphone   = null;
let isBlowDetectionActive = false;

async function initBlowDetection() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser     = audioContext.createAnalyser();
    microphone   = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    microphone.connect(analyser);
    isBlowDetectionActive = true;
    detectBlow();
  } catch (err) {
    console.error("Microphone error:", err);
  }
}

function detectBlow() {
  if (!isBlowDetectionActive) return;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

  if (volume > BLOW_THRESHOLD && isCakeLit && !isCandlesBlownOut) {
    blowOutCandles();
  }

  requestAnimationFrame(detectBlow);
}

/* Camera */
async function initCamera() {
  const video  = document.getElementById("webcam");
  const canvas = document.getElementById("canvas");
  canvas.width  = WEBCAM_WIDTH;
  canvas.height = WEBCAM_HEIGHT;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: WEBCAM_WIDTH,
        height: WEBCAM_HEIGHT,
        facingMode: "user",
      },
    });

    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      startHandTracking(video);
    };
  } catch (err) {
    console.error("Webcam error:", err);
    alert("Could not access webcam. Please allow camera permissions.");
  }
}

function startHandTracking(video) {
  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width:  WEBCAM_WIDTH,
    height: WEBCAM_HEIGHT,
  });
  camera.start();
}

function initBirthdayPage() {
  if (birthdayPageReady) return;
  birthdayPageReady = true;

  initCamera();

  if (isMobile) {
    document.body.addEventListener(
      "click",
      () => { if (!audioContext) initBlowDetection(); },
      { once: true }
    );
  } else {
    initBlowDetection();
  }
}

/* ═══════════════════════════════════════════════════
   CONFETTI (shared)
═══════════════════════════════════════════════════ */
const CONFETTI_SYMBOLS = [
  "🌹", "💕", "✦", "✧", "⭒", "˚", "⋆", "⊹", "₊",
  "✶", "❤️", "🌸", "💖", "⭐", "✨",
];

function createConfetti() {
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  const count = 90;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement("span");
      el.className = "confetti";
      el.textContent = CONFETTI_SYMBOLS[Math.floor(Math.random() * CONFETTI_SYMBOLS.length)];

      el.style.left = Math.random() * 100 + "vw";
      el.style.fontSize = 0.8 + Math.random() * 1.4 + "rem";

      const duration = 4 + Math.random() * 4;
      el.style.animationDuration = duration + "s";
      el.style.animationDelay    = Math.random() * 0.5 + "s";

      const sway = (Math.random() - 0.5) * 120;
      el.style.setProperty("--sway", sway + "px");

      container.appendChild(el);
      setTimeout(() => el.remove(), (duration + 1) * 1000);
    }, i * 40);
  }

  setTimeout(() => container.remove(), 15000);
}

/* ═══════════════════════════════════════════════════
   PAGE 3 — HAPPY BIRTHDAY MESSAGE
═══════════════════════════════════════════════════ */
function initMessagePage() {
  spawnStars();
  createConfetti();

  const goBtn = document.getElementById("go-to-gift-btn");
  if (goBtn) {
    goBtn.addEventListener("click", () => {
      showPage("page-gift");
      initGiftPage();
    });
  }
}

function spawnStars() {
  const container = document.getElementById("message-stars");
  if (!container) return;
  container.innerHTML = "";

  const symbols = ["✦", "✧", "⭒", "⋆", "✶", "˚", "💕", "🌹", "❤️"];
  const count = 25;

  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    star.className = "star-particle";
    star.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const left     = Math.random() * 100;
    const bottom   = Math.random() * 30;
    const duration = 6 + Math.random() * 8;
    const delay    = Math.random() * 6;
    const size     = 0.7 + Math.random() * 1;

    star.style.left             = `${left}vw`;
    star.style.bottom           = `${bottom}vh`;
    star.style.fontSize         = `${size}rem`;
    star.style.animationDuration = `${duration}s`;
    star.style.animationDelay   = `${delay}s`;

    container.appendChild(star);
  }
}

/* ═══════════════════════════════════════════════════
   PAGE 4 — GIFT
═══════════════════════════════════════════════════ */
let giftOpened    = false;
let envelopeOpened = false;

function initGiftPage() {
  spawnSparkles();

  const giftBox = document.getElementById("gift-box");
  if (!giftBox) return;

  giftBox.addEventListener("click", openGift);
  giftBox.addEventListener("touchend", (e) => {
    e.preventDefault();
    openGift();
  });
}

function openGift() {
  if (giftOpened) return;
  giftOpened = true;

  const giftBox  = document.getElementById("gift-box");
  const giftHint = document.getElementById("gift-hint");

  // Hide hint
  if (giftHint) giftHint.style.display = "none";

  // Play open animation
  giftBox.classList.remove("opening");
  void giftBox.offsetWidth;
  giftBox.classList.add("opening");

  // Burst roses after short delay
  setTimeout(() => burstRoses(), 200);

  // Confetti rain
  setTimeout(() => createConfetti(), 600);

  // Show envelope after gift disappears
  setTimeout(() => showEnvelope(), 1000);
}

function burstRoses() {
  const container = document.getElementById("roses-burst");
  if (!container) return;
  container.classList.remove("hidden");
  container.innerHTML = "";

  const roseEmojis = ["🌹", "🌹", "🌹", "🌸", "💐", "🌹", "🌺", "🌹", "💕", "🌹"];
  const count = 35;

  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const rose = document.createElement("span");
    rose.className = "rose-particle";
    rose.textContent = roseEmojis[Math.floor(Math.random() * roseEmojis.length)];

    const angle    = (Math.random() * 360) * (Math.PI / 180);
    const distance = 150 + Math.random() * 280;
    const tx       = Math.cos(angle) * distance;
    const ty       = Math.sin(angle) * distance;
    const rot      = (Math.random() - 0.5) * 720 + "deg";
    const duration = 0.8 + Math.random() * 0.8;
    const delay    = Math.random() * 0.3;
    const size     = 1.5 + Math.random() * 1.5;

    rose.style.left              = `${cx}px`;
    rose.style.top               = `${cy}px`;
    rose.style.fontSize          = `${size}rem`;
    rose.style.animationDuration = `${duration}s`;
    rose.style.animationDelay    = `${delay}s`;
    rose.style.setProperty("--tx",  `${tx}px`);
    rose.style.setProperty("--ty",  `${ty}px`);
    rose.style.setProperty("--rot", rot);

    container.appendChild(rose);
    setTimeout(() => rose.remove(), (duration + delay + 0.2) * 1000);
  }
}

/* ── Envelope ─────────────────────────────────── */
function showEnvelope() {
  const wrapper = document.getElementById("envelope-wrapper");
  if (!wrapper) return;

  wrapper.classList.remove("hidden");

  // Make page scrollable so envelope is visible on small screens
  const giftPage = document.getElementById("page-gift");
  if (giftPage) giftPage.classList.add("scrollable");

  setTimeout(() => {
    wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 200);

  // Attach click/touch handlers to envelope
  const envelope = document.getElementById("envelope");
  if (envelope) {
    envelope.addEventListener("click", openEnvelope);
    envelope.addEventListener("touchend", (e) => {
      e.preventDefault();
      openEnvelope();
    });
  }
}

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  const envelope     = document.getElementById("envelope");
  const envelopeHint = document.getElementById("envelope-hint");

  // Hide hint
  if (envelopeHint) envelopeHint.style.display = "none";

  // Open flap animation
  if (envelope) envelope.classList.add("open");

  // After flap opens, fade out envelope and show note
  setTimeout(() => {
    const wrapper = document.getElementById("envelope-wrapper");
    if (wrapper) {
      wrapper.style.transition = "opacity 0.5s ease";
      wrapper.style.opacity    = "0";
    }
  }, 900);

  setTimeout(() => {
    const wrapper = document.getElementById("envelope-wrapper");
    if (wrapper) wrapper.classList.add("hidden");
    showBirthdayNote();
  }, 1450);
}

function showBirthdayNote() {
  const note = document.getElementById("birthday-note");
  if (!note) return;

  note.classList.remove("hidden");

  // Init interactive features
  initGiftInteractions();
  initCarousel();

  // Smooth scroll to note
  setTimeout(() => {
    note.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);
}

/* ═══════════════════════════════════════════════════
   INTERACTIVE GIFTS
═══════════════════════════════════════════════════ */
const GIFT_MESSAGES = {
  bear: [
    "Tap for a hug! 🧸",
    "Hug #1! 🤗",
    "Hug #2! 🥰",
    "You really needed this 🥺",
    "Hug #4! The bear is getting tired 😅",
    "OK the bear needs a break 😂",
  ],
  bouquet: [
    "Tap to sniff! 🌸",
    "Sniff #1 🌸 Smells amazing!",
    "Sniff #2 🌹 So fresh!",
    "You're basically a bee now 🐝",
    "Sniff #4! The flowers are blushing 🌺",
    "Flower abuse detected 🚨",
    "The bouquet is calling the police 🚔",
    "You have a problem. A beautiful, floral problem. 🌹",
  ],
  chocolate: [
    "Tap to eat! 🍫",
    "Bite #1! Zero calories! 🎉",
    "Bite #2! Still zero calories 😇",
    "Virtual diabetes incoming 😂",
    "Bite #4! You've eaten a whole box 📦",
    "The chocolate is gone 😱",
    "You're eating the wrapper now 😭",
  ],
};

const giftCounts = { bear: 0, bouquet: 0, chocolate: 0 };

function initGiftInteractions() {
  document.querySelectorAll(".virtual-gift-item[data-gift]").forEach((item) => {
    const giftType = item.dataset.gift;

    item.addEventListener("click", () => tapGift(item, giftType));
    item.addEventListener("touchend", (e) => {
      e.preventDefault();
      tapGift(item, giftType);
    });
  });
}

function tapGift(item, type) {
  giftCounts[type]++;
  const count = giftCounts[type];

  // Bounce animation
  item.classList.remove("gift-bounce");
  void item.offsetWidth; // reflow
  item.classList.add("gift-bounce");

  // Update reaction text
  const reaction = item.querySelector(".gift-reaction");
  if (reaction) {
    const messages = GIFT_MESSAGES[type];
    const msgIndex = Math.min(count, messages.length - 1);
    reaction.textContent = messages[msgIndex];
    reaction.classList.remove("reaction-pop");
    void reaction.offsetWidth; // reflow
    reaction.classList.add("reaction-pop");
  }
}

/* ═══════════════════════════════════════════════════
   PHOTO CAROUSEL
═══════════════════════════════════════════════════ */
function initCarousel() {
  const track         = document.getElementById("carousel-track");
  const dotsContainer = document.getElementById("carousel-dots");
  const prevBtn       = document.getElementById("carousel-prev");
  const nextBtn       = document.getElementById("carousel-next");

  if (!track || !dotsContainer || !prevBtn || !nextBtn) return;

  const slides = track.querySelectorAll(".carousel-slide");
  const total  = slides.length;
  let current  = 0;

  // Build dot indicators
  dotsContainer.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    current = ((index % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll(".carousel-dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  // Touch swipe support
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging  = false;

  track.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    isDragging  = true;
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    if (!isDragging) return;
    isDragging = false;

    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = touchStartY - e.changedTouches[0].clientY;

    // Only swipe if horizontal movement dominates
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      goTo(dx > 0 ? current + 1 : current - 1);
    }
  }, { passive: true });
}

function spawnSparkles() {
  const container = document.getElementById("gift-sparkles");
  if (!container) return;
  container.innerHTML = "";

  const count = 30;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("div");
    dot.className = "sparkle-dot";

    const left     = Math.random() * 100;
    const top      = Math.random() * 100;
    const duration = 1.5 + Math.random() * 2.5;
    const delay    = Math.random() * 3;
    const size     = 2 + Math.random() * 4;

    // Alternate gold and rose colors
    const colors = ["#ffd700", "#ffb347", "#ff6b8a", "#ff8fa3", "#ffffff"];
    const color  = colors[Math.floor(Math.random() * colors.length)];

    dot.style.left             = `${left}vw`;
    dot.style.top              = `${top}vh`;
    dot.style.width            = `${size}px`;
    dot.style.height           = `${size}px`;
    dot.style.background       = color;
    dot.style.animationDuration = `${duration}s`;
    dot.style.animationDelay   = `${delay}s`;

    container.appendChild(dot);
  }
}

/* ═══════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════ */
window.addEventListener("DOMContentLoaded", () => {
  // Dev shortcut: ?page=message or ?page=gift to jump to a page
  const params = new URLSearchParams(window.location.search);
  const startPage = params.get("page");

  if (startPage === "message") {
    showPage("page-message");
    initMessagePage();
  } else if (startPage === "gift") {
    showPage("page-gift");
    initGiftPage();
  } else {
    showPage("page-login");
    initLogin();
  }
});
