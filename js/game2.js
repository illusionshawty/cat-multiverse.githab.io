window.addEventListener("load", () => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".scene").forEach((scene) => {
        const content = scene.querySelector(".scene__content");

        gsap.from(content, {
            opacity: 0,
            y: 100,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: scene,
                start: "top 85%",
            }
        });
    });
});

document.querySelectorAll(".polaroid-small").forEach(p => {
    p.removeAttribute("data-polaroid");
    p.onclick = null;
});


// досье

const folderBtn = document.querySelector("[data-open-folder]");
const evidenceScene = document.querySelector(".scene-evidence");

if (folderBtn && evidenceScene) {

    let currentIndex = 0;
    const cards = Array.from(evidenceScene.querySelectorAll(".polaroid-small"));

    function setActiveCard(index) {
        cards.forEach(c => c.classList.remove("active"));
        cards[index].classList.add("active");

        cards.forEach((c, i) => {
            c.style.zIndex = 20 - i;
        });
    }

    function enableCarousel() {
        cards.forEach(card => {
            card.onclick = () => {
                currentIndex = (currentIndex + 1) % cards.length;
                setActiveCard(currentIndex);
            };
        });
    }

    function disableCarousel() {
        cards.forEach(card => {
            card.onclick = null;
        });
    }

    folderBtn.addEventListener("click", () => {

        if (window.innerWidth <= 768) {
            openClueModal(0);
            return;
        }

        if (evidenceScene.classList.contains("open")) {
            evidenceScene.classList.remove("open");
            disableCarousel();
            return;
        }

        evidenceScene.classList.add("open");

        currentIndex = 0;
        setActiveCard(currentIndex);
        enableCarousel();
    });

}


document.querySelectorAll("[data-open-evidence]").forEach(button => {
    button.addEventListener("click", () => {
        const scene = button.closest(".scene");

        if (scene.classList.contains("scene-evidence")) return;

        const polaroid = scene.querySelector("[data-polaroid]");
        if (!polaroid) return;

        const img = polaroid.querySelector("img").src;
        const caption = polaroid.querySelector(".polaroid__caption").innerText;

        document.getElementById("evidenceImg").src = img;
        document.getElementById("evidenceCaption").innerText = caption;

        document.getElementById("evidenceModal").classList.add("open");
    });
});

document.getElementById("evidenceClose").onclick = () => {
    document.getElementById("evidenceModal").classList.remove("open");
};

document.getElementById("evidenceModal").onclick = (e) => {
    if (e.target === e.currentTarget) {
        e.currentTarget.classList.remove("open");
    }
};

window.addEventListener("load", () => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".scene").forEach((scene) => {
        gsap.from(scene, {
            opacity: 0,
            filter: "blur(10px)",
            y: 60,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: scene,
                start: "top 85%", // когда сцена почти видна
                toggleActions: "play none none reverse"
            }
        });
    });
});



const glitchArea = document.getElementById("glitchCat");
const glitchOverlay = document.getElementById("glitchOverlay");
const purr = document.getElementById("purrSound");

let glitchTimer = null;

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

document.getElementById("restart").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "instant" });

    setTimeout(() => {
        location.reload();
    }, 60);
});

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

// =============================

const clueItems = Array.from(document.querySelectorAll("[data-clue]"));
let currentClueIndex = 0;

function openClueModal(index) {
    const clue = clueItems[index];
    if (!clue) return;

    const img = clue.querySelector("img").src;
    const caption = clue.querySelector(".polaroid__caption")?.innerText || "";

    document.getElementById("evidenceImg").src = img;
    document.getElementById("evidenceCaption").innerText = caption;

    document.getElementById("evidenceModal").classList.add("open");

    currentClueIndex = index;
}

const evidenceImgEl = document.getElementById("evidenceImg");
if (evidenceImgEl) {
    evidenceImgEl.addEventListener("click", () => {
        if (!clueItems.length) return;
        currentClueIndex = (currentClueIndex + 1) % clueItems.length;
        openClueModal(currentClueIndex);
    });
}

clueItems.forEach((clue, index) => {
    clue.addEventListener("click", (e) => {
        if (window.innerWidth > 768) return; 

        e.preventDefault();
        e.stopPropagation();

        openClueModal(index);
    });
});

document.querySelector(".clue-next")?.addEventListener("click", () => {
    currentClueIndex = (currentClueIndex + 1) % clueItems.length;
    openClueModal(currentClueIndex);
});

document.querySelector(".clue-prev")?.addEventListener("click", () => {
    currentClueIndex = (currentClueIndex - 1 + clueItems.length) % clueItems.length;
    openClueModal(currentClueIndex);
});

document.querySelector(".evidence-modal__close")?.addEventListener("click", () => {
    document.getElementById("evidenceModal").classList.remove("open");
});

document.getElementById("evidenceModal")?.addEventListener("click", (e) => {
    if (e.target.id === "evidenceModal") {
        e.currentTarget.classList.remove("open");
    }
});

document.querySelectorAll(".scene-evidence [data-polaroid]").forEach((p) => {
    p.removeAttribute("data-polaroid");
});

