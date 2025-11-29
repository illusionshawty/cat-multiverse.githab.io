// играть еще
document.getElementById("restart").addEventListener("click", () => {
    location.reload();
});

// zone
document.addEventListener("DOMContentLoaded", () => {

    const room = document.querySelector('.game__room');
    const meowSound = document.getElementById('meow-sound');

    if (!room) {
        console.error("❌ .game__room НЕ НАЙДЕН, скрипт остановлен");
        return;
    }

    let pawTrailActive = false;
    let pawInterval;

    room.addEventListener("click", (event) => {
        const target = event.target;

        if (target.classList.contains('zone')) {
            createPuddle(event);
            playMeow();
            activatePawTrail();
        }
    });

    let score = 0;
    const scoreEl = document.getElementById("score");


    function createPuddle(event) {
        const rect = room.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const puddle = document.createElement("img");
        puddle.src = "img/catleak/ops.png";
        puddle.classList.add("puddle");

        puddle.style.left = `${x}px`;
        puddle.style.top = `${y}px`;

        room.appendChild(puddle);

        score++;
        scoreEl.textContent = score;

        setTimeout(() => puddle.remove(), 5000);
    }

    function playMeow() {
        meowSound.currentTime = 0;
        meowSound.play();
    }

    function activatePawTrail() {
        pawTrailActive = true;

        clearInterval(pawInterval);

        pawInterval = setInterval(() => {
            if (pawTrailActive) createPawPrint();
        }, 150);

        setTimeout(() => {
            pawTrailActive = false;
            clearInterval(pawInterval);
        }, 5000);
    }

    let mouseX = 0, mouseY = 0;

    room.addEventListener("mousemove", (event) => {
        const rect = room.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });

    function createPawPrint() {
        const paw = document.createElement("img");
        paw.src = "img/catleak/paw.png";
        paw.classList.add("paw");

        paw.style.left = `${mouseX}px`;
        paw.style.top = `${mouseY}px`;

        room.appendChild(paw);

        setTimeout(() => paw.remove(), 2000);
    }

    // секретный клик

    room.addEventListener("click", (event) => {

        const bowl = event.target.closest('#bowl');

        const zone = event.target.closest('.zone');

        if (bowl && event.target === bowl) {
            triggerEasterEgg();
            return;
        }

        if (zone && zone.id !== "bowl") {
            createPuddle(event);
            playMeow();
            activatePawTrail();
        }

    });

    function triggerEasterEgg() {
        secretFound = true;

        clearInterval(timerInterval);
        time = 0;
        timeEl.textContent = 0;

        document.body.classList.add("glitch");

        const bigPuddle = document.createElement("img");
        bigPuddle.src = "img/catleak/ops.png";
        bigPuddle.classList.add("puddle", "puddle-big");

        const comp = document.getElementById("zone-computer");
        const rect = comp.getBoundingClientRect();
        const roomRect = room.getBoundingClientRect();

        const x = rect.left - roomRect.left + rect.width / 2;
        const y = rect.top - roomRect.top + rect.height / 2;

        bigPuddle.style.left = `${x}px`;
        bigPuddle.style.top = `${y}px`;

        room.appendChild(bigPuddle);

        setTimeout(() => {
            document.body.classList.remove("glitch");
            bigPuddle.remove();

            alert("упс, кажется Чита всё сломала...💥");
            endGame();

        }, 1500);
    }


    // таймер и конец игры

    let time = 20;
    let secretFound = false;
    let timerInterval;

    const timeEl = document.getElementById("time");
    const winText = document.querySelector(".end-message-win");
    const lossText = document.querySelector(".end-message-loss");

    function startTimer() {

        timeEl.textContent = time;

        timerInterval = setInterval(() => {
            time--;

            if (time <= 0) {
                time = 0;
                timeEl.textContent = time;
                endGame();   
                clearInterval(timerInterval);
                return;
            }

            timeEl.textContent = time;

        }, 1000);
    }

    startTimer();

    function endGame() {
        clearInterval(timerInterval);

        room.style.pointerEvents = "none";

        showEndMessage();
    }


    // win/loss
    function showEndMessage() {

        winText.style.display = "none";
        lossText.style.display = "none";

        if (secretFound) {
            winText.textContent = "ты нашел пасхалку!";
            winText.style.display = "block";
        } else {
            lossText.textContent =
                "пасхалка не найдена, не удалось удивить хозяйку, попробуй ещё раз";
            lossText.style.display = "block";
        }
    }

});