const canvas = document.getElementById("catCanvas");
const ctx = canvas.getContext("2d");

let aimX = 0;
let aimY = 0;

function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
resize();
window.addEventListener("resize", () => {
    resize();
    scaleForMobile();
});

canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    aimX = e.clientX - rect.left;
    aimY = e.clientY - rect.top;
});

const wallTex = new Image();
wallTex.src = "img/catstrike/wall.png";
const floorTex = new Image();
floorTex.src = "img/catstrike/floor.png";

const enemyIdle = new Image(); enemyIdle.src = "img/catstrike/mouse_idle.png";
const enemyWalk1 = new Image(); enemyWalk1.src = "img/catstrike/mouse_walk1.png";
const enemyWalk2 = new Image(); enemyWalk2.src = "img/catstrike/mouse_walk2.png";
const enemyAttack = new Image(); enemyAttack.src = "img/catstrike/mouse_attack.png";
const enemyDead = new Image(); enemyDead.src = "img/catstrike/mouse_dead.png";

const arma = new Image();
arma.src = "img/catstrike/arma.png";

const hpEl = document.getElementById("hp");
const killsEl = document.getElementById("kills");

const player = { hp: 100 };
hpEl.textContent = player.hp;

let weaponKick = 0;
let weaponKickSpeed = 0;
let weaponIdleTime = 0;
let hitFlash = 0;

let enemies = [];
let kills = 0;
let spawnTimer = 0;
const MAX_ENEMIES = 5;

let wave = 1;
let enemiesToSpawn = 0;
let enemiesSpawned = 0;
let wavePause = false;
let waveMessageTimer = 0;
let lastClearedWave = 0;
let nextWavePending = false;

let damageBody = 40;
let damageHead = 90;
let damageMult = 1;
let critChance = 0;
let headshotMult = 1;
let doubleShot = false;
let gamePaused = false;
let pendingUpgrade = false;

let boss = null;
let bossActive = false;
let bossMaxHP = 0;
let bossSpawned = false;

let ENEMY_SIZE_MULT = 1;
let BOSS_SIZE_MULT = 1;
let WEAPON_SCALE_MULT = 1;

function scaleForMobile() {
    const w = window.innerWidth;
    if (w < 480) {
        ENEMY_SIZE_MULT = 0.6;
        BOSS_SIZE_MULT = 0.55;
        WEAPON_SCALE_MULT = 0.6;
    } else if (w < 768) {
        ENEMY_SIZE_MULT = 0.75;
        BOSS_SIZE_MULT = 0.7;
        WEAPON_SCALE_MULT = 0.75;
    } else if (w < 1024) {
        ENEMY_SIZE_MULT = 0.85;
        BOSS_SIZE_MULT = 0.8;
        WEAPON_SCALE_MULT = 0.85;
    } else {
        ENEMY_SIZE_MULT = 1;
        BOSS_SIZE_MULT = 1;
        WEAPON_SCALE_MULT = 1;
    }
}
scaleForMobile();

let WEAPON_OFFSET_Y = 0;

function updateWeaponYOffset() {
    const w = window.innerWidth;

    if (w < 380) {
        WEAPON_OFFSET_Y = 85;
    } else if (w < 480) {
        WEAPON_OFFSET_Y = 70;
    } else if (w < 768) {
        WEAPON_OFFSET_Y = 50;
    } else if (w < 1024) {
        WEAPON_OFFSET_Y = 30;
    } else {
        WEAPON_OFFSET_Y = 0;
    }
}

updateWeaponYOffset();
window.addEventListener("resize", updateWeaponYOffset);


function setupWave(num) {
    wave = num;
    enemiesToSpawn = 3 + (wave - 1) * 2;
    enemiesSpawned = 0;
    spawnTimer = 60;
    wavePause = false;
    nextWavePending = false;
    waveMessageTimer = 0;
}

function spawnEnemy() {
    enemies.push({
        state: "falling",
        hp: 100,
        animTimer: 0,
        attackCooldown: 60,
        deathTimer: 0,
        opacity: 1,
        xNorm: Math.random() * 0.6 + 0.2,
        fallY: -200,
        fallSpeed: (6 + Math.random() * 3) * (1 + wave * 0.05),
        groundY: canvas.height * 0.45,
        heightFactor: 0
    });
    enemiesSpawned++;
}

function spawnBoss() {
    if (bossSpawned) return;
    bossSpawned = true;
    bossActive = true;
    boss = {
        state: "falling",
        hp: 2000,
        y: -300,
        fallSpeed: 12,
        heightFactor: 0,
        xNorm: 0.5,
        attackCooldown: 90,
        opacity: 1,
        drawX: 0,
        drawY: 0,
        drawSize: 0
    };
    bossMaxHP = boss.hp;
}

function drawBackground() {
    const w = canvas.width;
    const h = canvas.height;
    const horizon = h * 0.55;
    if (wallTex.complete) ctx.drawImage(wallTex, 0, 0, w, horizon);
    else {
        ctx.fillStyle = "#f6e0c3";
        ctx.fillRect(0, 0, w, horizon);
    }
    if (floorTex.complete) ctx.drawImage(floorTex, 0, horizon, w, h - horizon);
    else {
        ctx.fillStyle = "#f3b5f3";
        ctx.fillRect(0, horizon, w, h - horizon);
    }
}

function getEnemyScreenParams(enemy) {
    const w = canvas.width;
    const h = canvas.height;
    const horizon = h * 0.40;
    const floorY = h * 0.80;
    const t = enemy.heightFactor;
    const minSize = 140;
    const maxSize = 320;
    const size = (minSize + (maxSize - minSize) * t) * ENEMY_SIZE_MULT;
    const centerX = w * enemy.xNorm;
    const centerY = horizon + (floorY - horizon) * t;
    return { size, x: centerX - size / 2, y: centerY - size, centerX, centerY };
}

function getEnemySprite(enemy) {
    if (enemy.state === "dead") return enemyDead;
    if (enemy.state === "attack") return enemyAttack;
    if (enemy.heightFactor < 0.4) return enemyIdle;
    return Math.floor(enemy.animTimer * 0.15) % 2 === 0 ? enemyWalk1 : enemyWalk2;
}

function updateEnemies() {
    if (bossActive) return;
    if (!wavePause) {
        if (spawnTimer <= 0 && enemies.length < MAX_ENEMIES && enemiesSpawned < enemiesToSpawn) {
            spawnEnemy();
            const base = 120;
            const minBase = 45;
            spawnTimer = Math.max(minBase, base - wave * 12) + Math.random() * 60;
        } else spawnTimer--;
    }
    for (let enemy of enemies) {
        if (enemy.state === "falling") {
            enemy.fallY += enemy.fallSpeed;
            if (enemy.fallY >= enemy.groundY) {
                enemy.fallY = enemy.groundY;
                enemy.state = "approach";
                enemy.heightFactor = 0.4;
            }
            continue;
        }
        if (enemy.state === "approach") {
            enemy.animTimer++;
            enemy.heightFactor += 0.006 * (1 + wave * 0.05);
            if (enemy.heightFactor >= 0.75) {
                enemy.heightFactor = 0.75;
                enemy.state = "attack";
                enemy.attackCooldown = 50;
            }
        }
        if (enemy.state === "attack") {
            enemy.animTimer++;
            if (enemy.attackCooldown > 0) enemy.attackCooldown--;
            else {
                player.hp -= 7;
                if (player.hp <= 0) {
                    player.hp = 0;
                    showGameOver();
                    return;
                }
                hpEl.textContent = player.hp;
                hitFlash = 0.4;
                enemy.attackCooldown = 70;
            }
        }
        if (enemy.state === "dead") {
            enemy.deathTimer--;
            enemy.heightFactor += 0.003;
            enemy.opacity -= 0.04;
        }
    }
    enemies = enemies.filter(e => !(e.state === "dead" && (e.deathTimer <= 0 || e.opacity <= 0)));

    if (!wavePause && enemiesSpawned >= enemiesToSpawn && enemies.length === 0) {
        wavePause = true;
        lastClearedWave = wave;
        waveMessageTimer = 120;
        nextWavePending = true;
        pendingUpgrade = wave % 2 === 0;
    }
    if (wavePause && nextWavePending) {
        waveMessageTimer--;
        if (waveMessageTimer <= 0) {
            wavePause = false;
            nextWavePending = false;
            if (pendingUpgrade) showUpgradeScreen();
            else {
                if (wave === 7) spawnBoss();
                else setupWave(wave + 1);
            }
        }
    }
}

function updateBoss() {
    if (!bossActive || !boss) return;
    if (boss.state === "falling") {
        boss.y += boss.fallSpeed;
        if (boss.y >= canvas.height * 0.35) {
            boss.state = "approach";
            boss.heightFactor = 0.4;
        }
        return;
    }
    if (boss.state === "approach") {
        boss.heightFactor += 0.004;
        if (boss.heightFactor >= 0.75) {
            boss.heightFactor = 0.75;
            boss.state = "attack";
        }
    }
    if (boss.state === "attack") {
        if (boss.attackCooldown > 0) boss.attackCooldown--;
        else {
            player.hp -= 17;
            if (player.hp <= 0) {
                player.hp = 0;
                showGameOver();
                return;
            }
            hpEl.textContent = player.hp;
            hitFlash = 0.5;
            boss.attackCooldown = 90;
        }
    }
    if (boss.state === "dead") {
        boss.opacity -= 0.03;
        if (boss.opacity <= 0) {
            bossActive = false;
            boss = null;
            document.getElementById("bossBarContainer").style.display = "none";
            showWin();
        }
    }
}

function updateBossHPBar() {
    const bar = document.getElementById("bossBar");
    const cont = document.getElementById("bossBarContainer");
    if (!bossActive || !boss) {
        cont.style.display = "none";
        return;
    }
    cont.style.display = "block";
    bar.style.width = Math.max(0, boss.hp / bossMaxHP * 100) + "%";
}

function drawEnemies() {
    for (let enemy of enemies) {
        if (enemy.state === "falling") {
            const size = 140 * ENEMY_SIZE_MULT;
            const x = canvas.width * enemy.xNorm - size / 2;
            ctx.drawImage(enemyIdle, x, enemy.fallY, size, size);
            continue;
        }
        const sprite = getEnemySprite(enemy);
        const p = getEnemyScreenParams(enemy);
        ctx.save();
        ctx.globalAlpha = enemy.opacity;
        ctx.drawImage(sprite, p.x, p.y, p.size, p.size);
        ctx.restore();
    }
}

function drawBoss() {
    if (!bossActive || !boss) return;
    const size = (600 * boss.heightFactor + 200) * BOSS_SIZE_MULT;
    const x = canvas.width / 2 - size / 2;
    const y = boss.y - size / 2;
    boss.drawX = x;
    boss.drawY = y;
    boss.drawSize = size;
    ctx.save();
    ctx.globalAlpha = boss.opacity;
    ctx.drawImage(enemyAttack, x, y, size, size);
    ctx.restore();
}

function shootAt(cx, cy) {
    if (bossActive && boss && boss.state !== "dead") {
        const size = boss.drawSize;
        const x = boss.drawX;
        const y = boss.drawY;

        const hitSize = size * BOSS_SIZE_MULT;
        const hitX = x + (size - hitSize) / 2;
        const hitY = y + (size - hitSize) / 2;

        const hitBoss =
            cx >= hitX && cx <= hitX + hitSize &&
            cy >= hitY && cy <= hitY + hitSize;
        if (hitBoss) {
            let dmg = damageBody * damageMult * 1.6;
            if (Math.random() < critChance) {
                dmg *= 2;
                addFloatText("CRIT!", x + size / 2, y - 20, "#9dffb0");
            }
            boss.hp -= dmg;
            addFloatText("-" + Math.round(dmg), x + size / 2, y + size / 2, "#ffd700");
            playSound(sndHitBody);
            if (boss.hp <= 0) {
                boss.state = "dead";
                addFloatText("BOSS DEFEATED!", x + size / 2, y - 60, "#ff006e");
            }
            return;
        }
    }
    let bestEnemy = null;
    let bestFactor = Infinity;
    for (let enemy of enemies) {
        if (enemy.state === "dead" || enemy.state === "falling") continue;
        const p = getEnemyScreenParams(enemy);
        const headHeight = p.size * 0.33;
        const hitHead = cx >= p.x && cx <= p.x + p.size && cy >= p.y && cy <= p.y + headHeight;
        const hitBody = cx >= p.x && cx <= p.x + p.size && cy >= p.y + headHeight && cy <= p.y + p.size;
        if (hitHead || hitBody) {
            if (enemy.heightFactor < bestFactor) {
                bestFactor = enemy.heightFactor;
                bestEnemy = { enemy, hitHead, params: p };
            }
        }
    }
    if (!bestEnemy) return;

    let e = bestEnemy.enemy;
    const p = bestEnemy.params;
    let dmg = (bestEnemy.hitHead ? damageHead : damageBody) * damageMult;
    if (bestEnemy.hitHead) dmg *= headshotMult;
    let isCrit = false;
    if (Math.random() < critChance) {
        dmg *= 2;
        isCrit = true;
    }
    e.hp -= dmg;
    if (bestEnemy.hitHead) {
        addFloatText("HEADSHOT!", p.centerX, p.y - 20, "#ff006e");
        playSound(sndHeadshot);
    } else {
        addFloatText("-" + Math.round(dmg), p.centerX, p.centerY, "#ffd700");
        playSound(sndHitBody);
    }
    if (isCrit) addFloatText("CRIT!", p.centerX, p.y - 40, "#9dffb0");
    e.heightFactor += 0.05;
    if (e.hp <= 0 && e.state !== "dead") {
        e.state = "dead";
        e.opacity = 1;
        e.deathTimer = 50;
        kills++;
        killsEl.textContent = kills;
    }
}

canvas.addEventListener("click", () => {
    if (gamePaused) return;
    weaponKick = 1;
    weaponKickSpeed = 0.25;
    shootAt(aimX, aimY);
    if (doubleShot) {
        setTimeout(() => {
            shootAt(aimX, aimY);
        }, 50);
    }
});

function drawCrosshair() {
    const x = aimX;
    const y = aimY;
    ctx.strokeStyle = "#ff6ad5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + 12, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x, y + 12);
    ctx.stroke();
}

function drawWaveInfo() {
    ctx.save();
    ctx.font = "20px 'Cousine', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Wave: " + wave, 20, 30);
    ctx.restore();
    if (wavePause && waveMessageTimer > 0) {
        ctx.save();
        ctx.font = "36px 'Cousine', monospace";
        ctx.fillStyle = "#ff6ad5";
        ctx.textAlign = "center";
        ctx.fillText("ВОЛНА " + lastClearedWave + " ПРОЙДЕНА", canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
}

let floatTexts = [];

function drawFloatTexts() {
    for (let ft of floatTexts) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = `${30 * ft.scale}px 'Cousine', monospace`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
        ft.y += ft.vy;
        ft.scale += 0.02;
        ft.alpha -= 0.02;
    }
    floatTexts = floatTexts.filter(ft => ft.alpha > 0);
}

function addFloatText(text, x, y, color = "#ff4da6") {
    floatTexts.push({ text, x, y, alpha: 1, scale: 1, vy: -0.6, color });
}

function drawWeapon() {
    if (!arma.complete) return;
    if (weaponKick > 0) {
        weaponKick -= weaponKickSpeed;
        if (weaponKick < 0) weaponKick = 0;
    }
    weaponIdleTime += 0.05;
    const swayX = Math.sin(weaponIdleTime) * 3;
    const swayY = Math.cos(weaponIdleTime * 0.7) * 4;
    const scale = 0.45 * WEAPON_SCALE_MULT;
    const w = arma.width * scale;
    const h = arma.height * scale;
    const kickX = weaponKick * 10;
    const kickY = weaponKick * 25;
    const rot = weaponKick * 0.08;
    let baseX = canvas.width - w - 25 + swayX;
    let baseY = canvas.height - h + WEAPON_OFFSET_Y + swayY;
    ctx.save();
    ctx.translate(baseX + w / 2 + kickX, baseY + h / 2 + kickY);
    ctx.rotate(-rot);
    ctx.drawImage(arma, -w / 2, -h / 2, w, h);
    ctx.restore();
}

function drawHitFlash() {
    if (hitFlash > 0) {
        ctx.fillStyle = `rgba(255,0,0,${hitFlash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        hitFlash -= 0.03;
    }
}

const sndFall = new Audio("../sounds/fall.wav");
const sndHitBody = new Audio("../sounds/mouse_hit.wav");
const sndHeadshot = new Audio("../sounds/headshot.wav");

function playSound(snd) {
    snd.currentTime = 0;
    snd.play();
}

setupWave(1);

const upgradeOverlay = document.getElementById("upgradeOverlay");
const upgradeWaveNumEl = document.getElementById("upgradeWaveNum");
const upgradeButtons = upgradeOverlay.querySelectorAll(".upgrade-btn");

function showUpgradeScreen() {
    gamePaused = true;
    pendingUpgrade = false;
    upgradeWaveNumEl.textContent = lastClearedWave;
    upgradeOverlay.classList.add("show");
}

function hideUpgradeScreen() {
    upgradeOverlay.classList.remove("show");
    gamePaused = false;
    setupWave(wave + 1);
}

upgradeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const type = btn.dataset.upgrade;
        if (type === "damage") {
            damageMult += 0.20;
            addFloatText("+20% урона", canvas.width / 2, canvas.height * 0.3, "#ffea00");
        } else if (type === "crit") {
            critChance += 0.05;
            addFloatText("+5% крит", canvas.width / 2, canvas.height * 0.3, "#9dffb0");
        } else if (type === "double") {
            doubleShot = true;
            addFloatText("ДВОЙНОЙ ВЫСТРЕЛ", canvas.width / 2, canvas.height * 0.3, "#ff6ad5");
        }
        hideUpgradeScreen();
    });
});

function showGameOver() {
    gamePaused = true;
    document.getElementById("gameOverScreen").style.display = "flex";
}

function showWin() {
    gamePaused = true;
    document.getElementById("winScreen").style.display = "flex";
}

function restartGame() {
    location.reload();
}

function isMobile() {
    return window.innerWidth <= 1024;
}

function getClosestEnemy() {
    let best = null;
    let bestFactor = Infinity;
    for (let enemy of enemies) {
        if (enemy.state === "dead" || enemy.state === "falling") continue;
        if (enemy.heightFactor < bestFactor) {
            bestFactor = enemy.heightFactor;
            best = { type: "enemy", enemy };
        }
    }
    if (bossActive && boss && boss.state !== "dead") return { type: "boss", boss };
    return best;
}

function autoShoot() {
    const target = getClosestEnemy();
    if (!target) return;
    if (target.type === "boss") {
        const x = boss.drawX + boss.drawSize / 2;
        const y = boss.drawY + boss.drawSize / 2;
        aimX = x;
        aimY = y;
        shootAt(x, y);
        return;
    }
    const enemy = target.enemy;
    const p = getEnemyScreenParams(enemy);
    aimX = p.centerX;
    aimY = p.centerY;
    shootAt(p.centerX, p.centerY);
}

canvas.addEventListener("touchstart", e => {
    if (!isMobile()) return;
    if (gamePaused) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    const cx = touch.clientX - rect.left;
    const cy = touch.clientY - rect.top;

    weaponKick = 1;
    weaponKickSpeed = 0.25;

    shootAt(cx, cy);

    if (doubleShot) {
        setTimeout(() => {
            shootAt(cx, cy);
        }, 80);
    }

    e.preventDefault();
}, { passive: false });


function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    updateEnemies();
    updateBoss();
    drawBoss();
    updateBossHPBar();
    drawEnemies();
    drawFloatTexts();
    drawWeapon();
    if (!isMobile()) drawCrosshair();
    drawHitFlash();
    drawWaveInfo();
    requestAnimationFrame(loop);
}

loop();
