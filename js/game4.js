const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

async function loadKeySound() {
    const response = await fetch("sounds/gabriele100_keyboard_space-bar_15.mp3");
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
}

let keyBuffer = null;

loadKeySound().then(buf => {
    keyBuffer = buf;
});

function playKeySound() {
    if (!keyBuffer) return;

    const source = audioCtx.createBufferSource();
    source.buffer = keyBuffer;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.35;

    source.connect(gainNode).connect(audioCtx.destination);
    source.start(0);
}

const article = document.getElementById('virusArticle');
const glitchWord = document.querySelector('.glitch-button');
const vhsAlert = document.getElementById('vhsAlert');
const startBtn = document.getElementById('startInvestigation');

let vhsTriggered = false;

if (glitchWord) {
    glitchWord.addEventListener('click', () => {
        if (vhsTriggered) return;
        vhsTriggered = true;
        triggerVhsGlitch();
    });
}

function triggerVhsGlitch() {
    if (!article) return;

    article.classList.add('vhs-glitch');

    document.body.classList.add('vhs-global-glitch');


    window.scrollBy({
        top: -30,
        left: 0,
        behavior: 'smooth'
    });

    setTimeout(() => {
        if (vhsAlert) {
            vhsAlert.classList.add('vhs-alert--visible');

            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        }
    }, 2200);
}

const puzzleContainer = document.getElementById('puzzleContainer');
const puzzleLog = document.getElementById('puzzleLog');
const puzzleCode = document.getElementById('puzzleCode');
const puzzleAnswer = document.getElementById('puzzleAnswer');
const puzzleCheckBtn = document.getElementById('puzzleCheckBtn');
const puzzleHint = document.getElementById('puzzleHint');
const puzzleStatus = document.getElementById('puzzleStatus');

const terminal = document.querySelector('.puzzle-terminal');

let currentPuzzleIndex = 0;

const puzzles = [
    {
        id: 1,
        title: 'СЕКТОР HTML',
        damagedCode:
            `<div class="cat
<p>Чита пропала...</p>
</div>`,
        hint: 'Закрой class и убедись, что все теги правильные.',
        systemIntro: [
            '[SYSTEM] Сканирование: сектор HTML повреждён.',
            '[SYSTEM] Требуется восстановление контейнера .cat.'
        ],
        virusCommentsSuccess: [
            '[VIRUS] Думаешь, закрыв пару тегов, ты вернёшь её?'
        ],
        virusCommentsFail: [
            '[VIRUS] Оставь разрывы… через них я проникну глубже.'
        ]
    },
    {
        id: 2,
        title: 'СЕКТОР JSON',
        damagedCode:
            `{
    "subject": "CHITA",
    "status": "infected",
    "corruption-level": 99%%,
    "signal": "true",
}`,
        hint: 'Поправь JSON: убери лишние %, убери последнюю запятую, исправь значения.',
        systemIntro: [
            '[SYSTEM] Обнаружен битый файл состояния субъекта.',
            '[SYSTEM] JSON нарушен: требуется ручная правка.'
        ],
        virusCommentsSuccess: [
            '[VIRUS] Умница… Но статус всё равно снова станет INFECTED.'
        ],
        virusCommentsFail: [
            '[VIRUS] Этот JSON вкусный. Дай мне ещё ошибок.'
        ]
    },

    {
        id: 3,
        title: 'СЕКТОР CORRUPTION-CLEANSE',
        damagedCode:
            `function cleanse(subject) {
    if (subject !== "CHITA") {
        return "ERR#@R";
    }
    return "CLEAN";
}`,
        hint: 'Перепиши функцию без вирусного мусора.',
        systemIntro: [
            '[SYSTEM] Обнаружено вмешательство вируса в ввод пользователя.',
            '[SYSTEM] Ожидается чистая функция cleanse(subject).'
        ],
        virusCommentsSuccess: [
            '[VIRUS] Ха! Я всё равно испорчу её имя в следующий раз.'
        ],
        virusCommentsFail: [
            '[VIRUS] Какая жалость… код снова течёт.'
        ]
    },
    {
        id: 4,
        title: 'ФИНАЛЬНЫЙ СЕКТОР: ВОЗВРАТ СУБЪЕКТА',
        damagedCode:
            `function restoreSubject() {
    return null;
}`,
        hint: 'Верни строку с именем кошки вместо null. Это её последняя точка входа.',
        systemIntro: [
            '[SYSTEM] Обнаружена финальная точка восстановления.',
            '[SYSTEM] Если изменить null на корректного субъекта — можно вернуть Читу.'
        ],
        virusCommentsSuccess: [
            '[VIRUS] Ты думаешь, одна строка кода способна вытащить её из меня?..',
            '[VIRUS] ...Посмотрим.'
        ],
        virusCommentsFail: [
            '[VIRUS] null — идеальный результат. Оставь пустоту.'
        ]
    }
];


let logQueue = [];
let isLogging = false;

function logLine(text, type = 'system') {
    logQueue.push({ text, type });
    runLogQueue();
}

function runLogQueue() {
    if (isLogging || logQueue.length === 0) return;

    isLogging = true;
    const { text, type } = logQueue.shift();

    let letterSpeed = 15;
    if (type === 'error') letterSpeed = 10;
    if (type === 'virus') letterSpeed = 18;
    if (type === 'ok') letterSpeed = 14;

    const line = document.createElement('div');
    line.classList.add('puzzle-log-line');

    if (type === 'virus') line.classList.add('puzzle-log-line--virus');
    else if (type === 'ok') line.classList.add('puzzle-log-line--ok');
    else if (type === 'error') line.classList.add('puzzle-log-line--error');
    else line.classList.add('puzzle-log-line--system');

    puzzleLog.appendChild(line);

    puzzleLog.scrollTo({
        top: puzzleLog.scrollHeight,
        behavior: "smooth"
    });

    let i = 0;

    const interval = setInterval(() => {

        line.textContent = text.slice(0, i);

        if (!window.keySoundCounter) window.keySoundCounter = 0;
        if (window.keySoundCounter % 8 === 0 && text[i] !== " " && text[i] !== undefined) {
            playKeySound();
        }
        window.keySoundCounter++;

        puzzleLog.scrollTo({
            top: puzzleLog.scrollHeight,
            behavior: "smooth"
        });

        if (i >= text.length) {
            clearInterval(interval);

            setTimeout(() => {
                isLogging = false;
                runLogQueue();
            }, 600);

            return;
        }

        i++;
    }, letterSpeed);
}



function normalizeAnswer(str) {
    return str.replace(/\s+/g, ' ').trim().toLowerCase();
}

function validateAnswer(raw) {
    const puzzle = puzzles[currentPuzzleIndex];
    const norm = normalizeAnswer(raw);
    switch (puzzle.id) {
        case 1: {
            const hasDivCat = /<div[^>]*class\s*=\s*["']cat["'][^>]*>/.test(norm);
            const hasPChita = /<p[^>]*>.*чита.*<\/p>/.test(norm);
            const hasCloseDiv = /<\/div>/.test(norm);
            return hasDivCat && hasPChita && hasCloseDiv;
        }
        case 2: {
            const clean = norm.replace(/\s+/g, " ");
            const hasSubject = /"subject"\s*:\s*"chita"/.test(clean);
            const hasStatus = /"status"\s*:\s*"stable"/.test(clean);
            const hasCorruption = /"corruption-level"\s*:\s*0 ?%/.test(clean);
            const hasSignal = /"signal"\s*:\s*true/.test(clean);
            const noInfected = !/infected/.test(clean);
            const noDoublePercent = !/%%/.test(clean);
            const noLastComma = !/\},?\s*$/.test(norm) ? true : true;
            return (
                hasSubject &&
                hasStatus &&
                hasCorruption &&
                hasSignal &&
                noInfected &&
                noDoublePercent
            );
        }
        case 3: {
            const hasFunction = /function\s+cleanse\s*\(/.test(norm);
            const checksChita = /subject\s*!==\s*["']chita["']/.test(norm);
            const returnsError = /return\s+["']error["']/.test(norm);
            const returnsClean = /return\s+["']clean["']/.test(norm);

            return hasFunction && checksChita && returnsError && returnsClean;
        }
        case 4: {
            const hasFunction = /function\s+restoresubject\s*\(/.test(norm);
            const hasReturn = /return/.test(norm);
            const hasName = /чита|chita/.test(norm);
            const noNull = !/return\s+null/.test(norm);
            return hasFunction && hasReturn && hasName && noNull;
        }
        default: return false;
    }
}

function showPuzzle(index) {
    if (!puzzleContainer) return;
    const puzzle = puzzles[index];

    puzzleLog.innerHTML = '';
    puzzleStatus.textContent = '';
    puzzleAnswer.value = '';

    puzzleCode.textContent = puzzle.damagedCode;
    puzzleHint.textContent = puzzle.hint;

    logLine(`[SYSTEM] ${puzzle.title}`, 'system');
    puzzle.systemIntro.forEach(line => logLine(line, 'system'));
    logLine('[VIRUS] Ты лезешь туда, где код уже принадлежит мне.', 'virus');
}

const codeBlock = document.getElementById("puzzleCode");

if (codeBlock) {
    codeBlock.addEventListener("click", () => {
        const text = codeBlock.textContent;

        navigator.clipboard.writeText(text).then(() => {
            codeBlock.classList.add("copied");

            setTimeout(() => {
                codeBlock.classList.remove("copied");
            }, 1400);
        });
    });
}


function completePuzzle() {
    const puzzle = puzzles[currentPuzzleIndex];

    if (terminal) {
        terminal.classList.add('puzzle-terminal--success');
        setTimeout(() => {
            terminal.classList.remove('puzzle-terminal--success');
            terminal.classList.add('puzzle-terminal--success-soft');
            setTimeout(() => {
                terminal.classList.remove('puzzle-terminal--success-soft');
            }, 600);
        }, 400);
    }

    logLine('[SYSTEM] Сектор стабилизирован.', 'ok');
    puzzle.virusCommentsSuccess.forEach(line => logLine(line, 'virus'));

    puzzleStatus.textContent = 'Сектор стабилизирован. Переход к следующему фрагменту...';

    const isLast = currentPuzzleIndex === puzzles.length - 1;
    const delay = isLast ? 5000 : 3500;

    setTimeout(() => {
        currentPuzzleIndex++;
        if (!isLast) {
            showPuzzle(currentPuzzleIndex);
        } else {
            showFinalScene();
        }
    }, delay);
}


function failPuzzle() {
    const puzzle = puzzles[currentPuzzleIndex];

    if (terminal) {
        terminal.classList.add('puzzle-terminal--error');
        setTimeout(() => terminal.classList.remove('puzzle-terminal--error'), 260);
    }

    logLine('[SYSTEM] Ошибка в восстановлении сектора.', 'error');
    puzzle.virusCommentsFail.forEach(line => logLine(line, 'virus'));

    puzzleStatus.textContent = 'Код нестабилен. Попробуй ещё раз.';
}

function showFinalScene() {
    logLine('[SYSTEM] Все сектора восстановлены.', 'ok');
    logLine('[SYSTEM] Запуск протокола RETURN-SUBJECT...', 'system');
    logLine('[VIRUS] ...', 'virus');
    logLine('[VIRUS] Ты действительно её вернул...', 'virus');

    setTimeout(() => {
        const ending = document.getElementById('gameEnding');
        if (ending) {
            ending.style.display = "flex";
        }
    }, 3000);
}


const endingBackBtn = document.getElementById('endingBackBtn');

if (endingBackBtn) {
    endingBackBtn.addEventListener('click', () => {
        window.location.href = "../index.html";
    });
}


if (puzzleCheckBtn) {
    puzzleCheckBtn.addEventListener('click', () => {
        const value = puzzleAnswer.value || '';
        if (!value.trim()) {
            puzzleStatus.textContent = 'Поле пустое. Введи исправленный код.';
            return;
        }

        if (validateAnswer(value)) completePuzzle();
        else failPuzzle();
    });
}


document.addEventListener('click', (e) => {
    if (e.target.closest('#startInvestigation')) {
        startInvestigation();
    }
});


function startInvestigation() {

    document.body.classList.add('terminal-active');

    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    vhsAlert.classList.remove('vhs-alert--visible');

    article.classList.remove('vhs-glitch');
    article.style.display = "none";

    document.body.classList.remove('vhs-global-glitch');

    puzzleContainer.classList.add('puzzle-container--visible');
    currentPuzzleIndex = 0;
    showPuzzle(currentPuzzleIndex);
}

function wrapH2Letters() {
    const h2s = document.querySelectorAll('.article__section h2');

    h2s.forEach(h2 => {

        const text = h2.textContent;
        h2.innerHTML = ""; 

        text.split("").forEach(char => {
            if (char === " ") {
                h2.append(" ");
            } else {
                const span = document.createElement("span");
                span.textContent = char;
                h2.append(span);
            }
        });
    });
}

wrapH2Letters();




