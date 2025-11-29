// --- ЗВУК ---
const popSound = new Audio("sounds/bubble.mp3");

// --- ЭЛЕМЕНТЫ ---
const room = document.querySelector('.game__room-search');
const magnifier = document.createElement('div');
magnifier.classList.add('magnifier');
document.body.appendChild(magnifier);

// --- СЧЁТЧИКИ ---
let foundObjects = 0;
let foundPuddles = 0;

const scoreObject = document.getElementById('object');
const scorePuddle = document.getElementById('puddle');

// --- АДАПТИВ ---
let radius;

function updateMagnifierSize() {
    const w = window.innerWidth;

    if (w >= 1200) {
        radius = 50;   
    } else if (w >= 900) {
        radius = 40;  
    } else if (w >= 600) {
        radius = 28;  
    } else if (w >= 430) {
        radius = 20;   
    } else {
        radius = 15;
    }

    magnifier.style.width = `${radius * 2}px`;
    magnifier.style.height = `${radius * 2}px`;
}


updateMagnifierSize();
window.addEventListener("resize", updateMagnifierSize);

// --- НАСТРОЙКИ ---
const TOTAL_OBJECTS = 4;
const TOTAL_PUDDLES = 3;

let gameEnded = false;

// --- ТАЙМЕР ---
let time = 60;
let timerInterval;
const timeEl = document.getElementById("time");

// --- ЛУПА ---
magnifier.style.display = 'none';

room.addEventListener('mousemove', (e) => {
    if (gameEnded) return;

    magnifier.style.display = 'block';
    magnifier.style.left = `${e.clientX - radius}px`;
    magnifier.style.top = `${e.clientY - radius}px`;

    const mx = e.clientX;
    const my = e.clientY;

    document.querySelectorAll('.object img, .puddle img').forEach((img) => {

        if (img.dataset.found === "true") {
            img.style.opacity = 0;
            img.style.pointerEvents = "none";
            return;
        }

        const rect = img.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dist = Math.hypot(mx - cx, my - cy);

        if (dist < radius) {
            img.style.opacity = 1;
            img.style.pointerEvents = "auto";
        } else {
            img.style.opacity = 0;
            img.style.pointerEvents = "none";
        }
    });
});

room.addEventListener('mouseleave', () => {
    if (gameEnded) return;

    magnifier.style.display = 'none';

    document.querySelectorAll('.object img, .puddle img').forEach((img) => {
        if (img.dataset.found === "true") return;
        img.style.opacity = 0;
        img.style.pointerEvents = "none";
    });
});

// --- КЛИК ПО ПРЕДМЕТАМ И ЛУЖАМ ---
room.addEventListener('click', (e) => {
    if (gameEnded) return;
    if (e.target.tagName !== "IMG") return;

    handleFound(e.target);
});

function handleFound(img) {
    if (img.dataset.found === "true") return;

    img.dataset.found = "true";

    popSound.currentTime = 0;
    popSound.play();

    img.classList.add('found-anim');

    if (img.closest('.puddle')) {
        foundPuddles++;
        scorePuddle.textContent = foundPuddles;
    } else {
        foundObjects++;
        scoreObject.textContent = foundObjects;
    }

    setTimeout(() => {
        img.style.opacity = 0;
    }, 350);

    checkWin();
}

// --- ТАЙМЕР ---
function startTimer() {
    timeEl.textContent = time;
    timerInterval = setInterval(() => {
        if (gameEnded) return;

        time--;
        timeEl.textContent = time;

        if (time <= 0) {
            time = 0;
            endGame("Время закончилось! Ты не нашёл все предметы и лужи.");
        }

    }, 1000);
}

startTimer();

// --- ПРОВЕРКА ПОБЕДЫ ---
function checkWin() {
    if (foundObjects === TOTAL_OBJECTS && foundPuddles === TOTAL_PUDDLES) {
        endGame("Ты нашёл все лужи и предметы!");
    }
}

// --- КОНЕЦ ИГРЫ ---
function endGame(text) {
    if (gameEnded) return;
    gameEnded = true;

    clearInterval(timerInterval);

    room.style.pointerEvents = "none";
    magnifier.style.display = "none";

    const message = document.createElement("div");
    message.classList.add("end-message");
    message.textContent = text;

    document.body.appendChild(message);
}

// играть еще
document.getElementById("restart").addEventListener("click", () => {
    location.reload();
});
