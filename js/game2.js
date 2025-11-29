window.addEventListener("load", () => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".scene").forEach((scene) => {
        const content = scene.querySelector(".scene__content");
        if (!content) return;

        gsap.from(content, {
            opacity: 0,
            y: 100,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: scene,
                start: "top 85%"
            }
        });
    });
});

const evidenceModal = document.getElementById("evidenceModal");
const evidenceImgEl = document.getElementById("evidenceImg");
const evidenceCaptionEl = document.getElementById("evidenceCaption");
const evidenceCloseEl = document.getElementById("evidenceClose");

let isFolderModal = false;     
let currentClueIndex = 0;         

document.querySelectorAll("[data-open-evidence]").forEach((button) => {
    button.addEventListener("click", () => {
        const scene = button.closest(".scene");
        if (!scene) return;

        if (scene.classList.contains("scene-evidence")) return;

        const polaroid = scene.querySelector("[data-polaroid]");
        if (!polaroid || !evidenceModal || !evidenceImgEl) return;

        const imgEl = polaroid.querySelector("img");
        const captionEl = polaroid.querySelector(".polaroid__caption");

        if (!imgEl) return;

        evidenceImgEl.src = imgEl.src;
        evidenceCaptionEl.textContent = captionEl ? captionEl.innerText : "";
        isFolderModal = false; 
        evidenceModal.classList.add("open");
    });
});

if (evidenceCloseEl) {
    evidenceCloseEl.addEventListener("click", () => {
        evidenceModal?.classList.remove("open");
    });
}

if (evidenceModal) {
    evidenceModal.addEventListener("click", (e) => {
        if (e.target === evidenceModal) {
            evidenceModal.classList.remove("open");
        }
    });
}

const folderBtn = document.querySelector("[data-open-folder]");
const evidenceScene = document.querySelector(".scene-evidence");
const clueItems = evidenceScene
    ? Array.from(evidenceScene.querySelectorAll(".polaroid-small"))
    : [];

function showClueInModal(index) {
    if (!clueItems.length || !evidenceModal || !evidenceImgEl) return;

    const clue = clueItems[index];
    if (!clue) return;

    const imgEl = clue.querySelector("img");
    const captionEl = clue.querySelector(".polaroid__caption");

    if (!imgEl) return;

    evidenceImgEl.src = imgEl.src;
    evidenceCaptionEl.textContent = captionEl ? captionEl.innerText : "";

    isFolderModal = true;
    currentClueIndex = index;
    evidenceModal.classList.add("open");
}

function setActiveCard(index) {
    clueItems.forEach((card) => card.classList.remove("active"));
    const active = clueItems[index];
    if (!active) return;
    active.classList.add("active");

    clueItems.forEach((card, i) => {
        card.style.zIndex = String(20 - i);
    });
}

function enableDesktopCarousel() {
    clueItems.forEach((card) => {
        card.onclick = () => {
            currentClueIndex = (currentClueIndex + 1) % clueItems.length;
            setActiveCard(currentClueIndex);
        };
    });
}

function disableDesktopCarousel() {
    clueItems.forEach((card) => {
        card.onclick = null;
        card.classList.remove("active");
    });
}

if (folderBtn && evidenceScene) {
    folderBtn.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            currentClueIndex = 0;
            showClueInModal(currentClueIndex);
            return;
        }

        if (evidenceScene.classList.contains("open")) {
            evidenceScene.classList.remove("open");
            disableDesktopCarousel();
            return;
        }

        evidenceScene.classList.add("open");

        if (!clueItems.length) return;
        currentClueIndex = 0;
        setActiveCard(currentClueIndex);
        enableDesktopCarousel();
    });
}

clueItems.forEach((clue, index) => {
    clue.addEventListener("click", (e) => {
        if (window.innerWidth > 768) return;

        e.preventDefault();
        e.stopPropagation();
        showClueInModal(index);
    });
});

if (evidenceImgEl) {
    evidenceImgEl.addEventListener("click", () => {
        if (!isFolderModal || !clueItems.length) return;

        currentClueIndex = (currentClueIndex + 1) % clueItems.length;
        showClueInModal(currentClueIndex);
    });
}

const nextBtn = document.querySelector(".clue-next");
const prevBtn = document.querySelector(".clue-prev");

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        if (!clueItems.length) return;
        isFolderModal = true;
        currentClueIndex = (currentClueIndex + 1) % clueItems.length;
        showClueInModal(currentClueIndex);
    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        if (!clueItems.length) return;
        isFolderModal = true;
        currentClueIndex = (currentClueIndex - 1 + clueItems.length) % clueItems.length;
        showClueInModal(currentClueIndex);
    });
}

const glitchArea = document.getElementById("glitchCat");
const glitchOverlay = document.getElementById("glitchOverlay");
const purr = document.getElementById("purrSound");

let glitchTimer = null;

if (glitchArea && glitchOverlay && purr) {
    glitchArea.addEventListener("click", () => {
        if (glitchTimer) {
            clearTimeout(glitchTimer);
            glitchTimer = null;
        }

        glitchOverlay.style.opacity = "1";
        purr.currentTime = 0;
        purr.play();

        glitchTimer = setTimeout(() => {
            glitchOverlay.style.opacity = "0";
            purr.pause();
            glitchTimer = null;
        }, 5000);
    });
}


const restartBtn = document.getElementById("restart");
if (restartBtn) {
    restartBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "instant" });
        setTimeout(() => {
            location.reload();
        }, 60);
    });
}

const asciiCat = `
     |\\__/,|   (\`\\
   _.| o o |_   ) )
 -(((---(((--------

Чита теперь живёт в твоём DevTools.
`;

const finalTitle = document.querySelector(".scene-final .scene__title");
if (finalTitle) {
    finalTitle.addEventListener("click", () => {
        console.log("%c Чита заглянула в консоль...", "color:#ff7be0; font-size:16px;");
        console.log(asciiCat);
    });
}
