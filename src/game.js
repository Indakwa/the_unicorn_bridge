

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let helpText = document.querySelector(".helper-text");
let swipeCount = 0;
let touchStartY = 0;
let touchStartX = 0;
let requiredColor = "red";
let rainbowProgress = 0;
let rainbowComplete = false;
let lives = 3;
let gameOver = false;
let responseTime = 5;
let timer = responseTime;
let lastTime = null;
let currentColorIndex = 0;
const rainbowColors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

const bubbleColors = {
    red: "255,0,0",
    orange: "255,127,0",
    yellow: "255,220,0",
    green: "0,190,60",
    blue: "0,110,255",
    indigo: "75,40,180",
    violet: "160,40,220",
    silver: "220,235,245"
};

const rainbowSettings = {
    x: canvas.width / 2,
    y: canvas.height * 0.65,
    radius: canvas.width * 1.15,
    startAngle: Math.PI * 1.15,
    endAngle: Math.PI * 1.85,
    bandWidth: 9,
    bandGap: 0,
    softness: 2,
    alpha: 0.6
};

const rainbowDrawColors = [
    "#FF3B30",
    "#FF7A00",
    "#FFD83D",
    "#6EDC6E",
    "#42A5F5",
    "#6461D8",
    "#A855C7"
];

let score = 0;
const difficulty = {
    startSpeed: 2,
    speedIncrease: 0.05,
    swipesPerColor: 7
};

const silverSettings = {
    chance: 0.05,
    reward: 3,
    cooldown: 3
};
let silverCooldownTimer = 0;

const heartSettings = {
    chance: 0.03,
    rewardLife: 1,
    rewardScore: 2,
    cooldown: 3
};
let heartCooldownTimer = 0;

let currentSpeed = difficulty.startSpeed;
let accelerationTimer = 0;
let accelerationInterval = 1;
let requiredColorCount = 0;
let requiredColorSpawned = 0;
let shotPlan = [];
let shotIndex = 0;
let progressInColor = 0;

function drawBubble(x, y, r, color) {

    ctx.save();

    // =========================
    // YOUR F SETTINGS
    // =========================

    const glow = 15;
    const glowAlpha = 0.05;
    const highlightSize = 0.30;
    const highlightAlpha = 0.6;
    const rimAlpha = 0.2;
    const bubbleAlpha = color === "220,235,245" ? 0.8 : 0.5;


    // =========================
    // GLOW
    // =========================

    ctx.shadowColor = `rgba(${color}, ${glowAlpha})`;
    ctx.shadowBlur = glow;


    // =========================
    // BUBBLE GRADIENT
    // =========================

    const gradient = ctx.createRadialGradient(
        x - r * 0.35,
        y - r * 0.38,
        r * 0.03,

        x,
        y,
        r
    );

    gradient.addColorStop(
        0,
        `rgba(255,255,255,${bubbleAlpha})`
    );

    gradient.addColorStop(
        0.2,
        `rgba(${color},${bubbleAlpha})`
    );

    gradient.addColorStop(
        0.6,
        `rgba(${color},${bubbleAlpha})`
    );

    gradient.addColorStop(
        1,
        `rgba(${color},${bubbleAlpha})`
    );


    // =========================
    // BUBBLE
    // =========================

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;


    // =========================
    // BIG HIGHLIGHT
    // =========================

    ctx.fillStyle =
        `rgba(255,255,255,${highlightAlpha})`;

    ctx.beginPath();

    ctx.ellipse(
        x - r * 0.34,
        y - r * 0.38,
        r * highlightSize,
        r * highlightSize * 0.55,
        -0.5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // =========================
    // SMALL HIGHLIGHT
    // =========================

    ctx.fillStyle =
        `rgba(255,255,255,${highlightAlpha * 0.35})`;

    ctx.beginPath();

    ctx.ellipse(
        x - r * 0.48,
        y - r * 0.18,
        r * 0.06,
        r * 0.13,
        -0.4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // =========================
    // SUBTLE RIM
    // =========================

    ctx.strokeStyle =
        `rgba(255,255,255,${rimAlpha})`;

    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(x, y, r - 1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function drawRainbow() {

    ctx.save();

    ctx.globalAlpha = rainbowSettings.alpha;

    rainbowDrawColors.forEach((color, index) => {

        const bandRadius =
            rainbowSettings.radius -
            index * (rainbowSettings.bandWidth + rainbowSettings.bandGap);

        // Soft edge underneath
        ctx.strokeStyle = color;
        ctx.lineWidth =
            rainbowSettings.bandWidth +
            rainbowSettings.softness * 2;

        ctx.globalAlpha = rainbowSettings.alpha * 0.25;

        ctx.beginPath();

        ctx.arc(
            rainbowSettings.x,
            rainbowSettings.y,
            bandRadius,
            rainbowSettings.startAngle,
            rainbowSettings.endAngle
        );

        ctx.stroke();


        // Main colour
        ctx.strokeStyle = color;
        ctx.lineWidth = rainbowSettings.bandWidth;
        ctx.globalAlpha = rainbowSettings.alpha;

        ctx.beginPath();

        ctx.arc(
            rainbowSettings.x,
            rainbowSettings.y,
            bandRadius,
            rainbowSettings.startAngle,
            rainbowSettings.endAngle
        );

        ctx.stroke();
    });

    ctx.restore();
}


function createColor(x, color) {
    return {
        x: x,
        y: 200,
        size: 50,
        speed: currentSpeed,
        color: color
    };
}

function startColorWindow() {
    requiredColorCount = Math.floor(Math.random() * 2) + 1;
    requiredColorSpawned = 0;
    shotIndex = 0;

    shotPlan = Array(10).fill(false);

    while (shotPlan.filter(Boolean).length < requiredColorCount) {
        const randomSlot = Math.floor(Math.random() * 10);
        shotPlan[randomSlot] = true;
    }
}



function spawnColor() {
  let newColor;

  if (silverCooldownTimer <= 0 && Math.random() < silverSettings.chance) {
    newColor = "silver";
    silverCooldownTimer = silverSettings.cooldown;
  } else if (heartCooldownTimer <= 0 && Math.random() < heartSettings.chance) {
    newColor = "heart";
    heartCooldownTimer = heartSettings.cooldown;
  } else if (shotPlan[shotIndex]) {
    newColor = requiredColor;
    requiredColorSpawned++;
  } else {
    const otherColors = rainbowColors.filter(
      (color) => color !== requiredColor,
    );

    newColor = otherColors[Math.floor(Math.random() * otherColors.length)];
  }

  colors.push(createColor(-50, newColor));

  shotIndex++;

  if (shotIndex >= shotPlan.length) {
    shotIndex = 0;
  }
}

let colors = [];
let spawnTimer = 0;
let spawnInterval = 0.5;




let x = 0;



function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    rainbowSettings.x = canvas.width / 2;
    rainbowSettings.y = canvas.height * 0.65;
    rainbowSettings.radius = canvas.width * 1.15;
}

resizeCanvas();
startColorWindow();
window.addEventListener("resize", resizeCanvas);

// UPDATE =============================================================
function update(time) {
    if (lastTime === null) {
        lastTime = time;
        return;
    }

    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    if (silverCooldownTimer > 0) {
      silverCooldownTimer -= deltaTime;
    }

    if (heartCooldownTimer > 0) {
      heartCooldownTimer -= deltaTime;
    }


    if (rainbowComplete || gameOver) return;

    accelerationTimer -= deltaTime;

    if (accelerationTimer <= 0) {
        currentSpeed += difficulty.speedIncrease;
        accelerationTimer = accelerationInterval;
    }



    timer -= deltaTime;

    if (timer <= 0) {
      lives--;

      helpText.textContent = `TIME UP! Lives: ${lives}`;

      timer = responseTime;
      startColorWindow();

      if (lives <= 0) {
        gameOver = true;
        helpText.textContent = "GAME OVER!";
      }
    }

    spawnTimer -= deltaTime;

    if (spawnTimer <= 0) {
        spawnColor();
        spawnTimer = spawnInterval;
    }
    

    for (let color of colors) {
        color.speed = currentSpeed;
        color.x += color.speed;
    }

    colors = colors.filter(color => color.x <= canvas.width);
}


// DRAWING =============================================================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRainbow();

    for (let color of colors) {
    if (color.color === "heart") {
        ctx.fillStyle = "pink";

        ctx.beginPath();
        ctx.arc(
        color.x + color.size / 2,
        color.y + color.size / 2,
        color.size / 2,
        0,
        Math.PI * 2,
        );
        ctx.fill();
    } else {
            drawBubble(
              color.x + color.size / 2,
              color.y + color.size / 2,
              color.size / 2,
              bubbleColors[color.color],
            );
    }

    }

    ctx.fillStyle = requiredColor;
    ctx.fillRect(20, 20, 50, 50);


    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText(`Time: ${Math.ceil(timer)}`, 20, 120);
    ctx.fillText(`Lives: ${lives}`, 20, 160);
    ctx.fillText(`Score: ${score}`, 20, 200);

}


// GAME LOOP =============================================================
function gameLoop(time) {
    update(time);
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

canvas.addEventListener("touchstart", function (event) {
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
});

canvas.addEventListener("touchend", function (event) {
  if (rainbowComplete || gameOver) return;

  const touchEndY = event.changedTouches[0].clientY;
  const distance = touchStartY - touchEndY;

  if (distance > 50) {
    const color = getColorAtPosition(touchStartX, touchStartY);

    if (color) {
      if (color.color === "silver") {
        let silverProgress = silverSettings.reward;

        while (silverProgress > 0) {
          progressInColor++;
          rainbowProgress++;
          silverProgress--;

          if (progressInColor >= difficulty.swipesPerColor) {
            progressInColor = 0;
            currentColorIndex++;

            if (currentColorIndex < rainbowColors.length) {
              requiredColor = rainbowColors[currentColorIndex];
            }
          }
        }

        score += silverSettings.reward;
        timer = responseTime;

        helpText.textContent = `SILVER! +${silverSettings.reward}`;
      } else if (color.color === "heart") {
        let heartProgress = heartSettings.rewardScore;

        while (heartProgress > 0) {
          progressInColor++;
          rainbowProgress++;
          heartProgress--;

          if (progressInColor >= difficulty.swipesPerColor) {
            progressInColor = 0;
            currentColorIndex++;

            if (currentColorIndex < rainbowColors.length) {
              requiredColor = rainbowColors[currentColorIndex];
            }
          }
        }

        lives += heartSettings.rewardLife;
        score += heartSettings.rewardScore;

        timer = responseTime;

        helpText.textContent = `HEART! +${heartSettings.rewardLife} LIFE`;
      } else if (color.color === requiredColor) {
        rainbowProgress++;
        progressInColor++;
        score++;
        timer = responseTime;

        requiredColorSpawned = false;

        helpText.textContent = `Correct! ${rainbowProgress}`;

        if (progressInColor >= difficulty.swipesPerColor) {
          progressInColor -= difficulty.swipesPerColor;
          currentColorIndex++;

          if (currentColorIndex < rainbowColors.length) {
            requiredColor = rainbowColors[currentColorIndex];
          }
        }

        if (
          rainbowProgress >=
          rainbowColors.length * difficulty.swipesPerColor
        ) {
          rainbowComplete = true;
          helpText.textContent = "YOU WIN!";
        }
      } else {
        lives--;
        timer = responseTime;

        helpText.textContent = `Wrong! Lives: ${lives}`;

        if (lives <= 0) {
          gameOver = true;
          helpText.textContent = "GAME OVER!";
        }
      }

      // Kill the swiped colour
      colors = colors.filter((c) => c !== color);
    } else {
      helpText.textContent = `You missed!`;
    }
  }
});

function getColorAtPosition(x, y) {
    for (let color of colors) {
        if (
            x >= color.x &&
            x <= color.x + color.size &&
            y >= color.y &&
            y <= color.y + color.size
        ) {
            return color;
        }
    }

    return null;
}


