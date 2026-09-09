const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


const skyTop = "#4DB8F2";
const skyBottom = "#DDF6FF";
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
let rainbowPulse = 0;
let silverSparkle = [];
let winAnimation = 0;
let winParticles = [];
let gameOverAnimation = 0;

const bubbleColors = {
    red: "255,0,0",
    orange: "255,127,0",
    yellow: "255,220,0",
    green: "0,190,60",
    blue: "0,110,255",
    indigo: "45,25,140",
    violet: "180,45,220",
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

const streamSettings = {
    mobileY: 400,
    desktopY: 450,
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

const gameSettings = {
    swipesPerColor: 3,
    colorsPerRound: 7,
    roundsToWin: 7,
    responseTime: 5,
    swipeOffsetMultiplier: 5
};

const difficulty = {
    startSpeed: 2,
    speedIncrease: 0.01,
    maxSpeed: 4
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

let currentRound = 1;
let completedColors = [];
let swipesForCurrentColor = 0;

let feedbacks = [];
let wrongFlash = 0;
let timeFlash = 0;

function showFeedback(text, x, y) {
    feedbacks.push({
        text: text,
        x: x,
        y: y,
        life: 0.8,
        maxLife: 0.8
    });
}

function updateFeedbacks(deltaTime) {
    for (let feedback of feedbacks) {
        feedback.y -= 40 * deltaTime;
        feedback.life -= deltaTime;
    }

    feedbacks = feedbacks.filter(
        feedback => feedback.life > 0
    );
}

function drawFeedbacks() {
    ctx.save();

    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";

    for (let feedback of feedbacks) {
        const alpha = feedback.life / feedback.maxLife;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = "white";

        ctx.fillText(
            feedback.text,
            feedback.x,
            feedback.y
        );
    }

    ctx.restore();

    ctx.globalAlpha = 1;
}

chooseNextColor();

function drawSky() {
    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    gradient.addColorStop(0, skyTop);
    gradient.addColorStop(0.7, skyTop);
    gradient.addColorStop(1, skyBottom);

    ctx.fillStyle = gradient;
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}

function drawCloud(x, y, scale = 1) {
    ctx.save();

    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Soft underside
    ctx.fillStyle = "rgba(190, 220, 235, 0.4)";

    ctx.beginPath();

    ctx.ellipse(5, 18, 65, 22, 0, 0, Math.PI * 2);

    ctx.fill();

    // White cloud
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";

    ctx.beginPath();

    ctx.arc(-40, 8, 22, 0, Math.PI * 2);
    ctx.arc(-15, -8, 32, 0, Math.PI * 2);
    ctx.arc(15, -15, 40, 0, Math.PI * 2);
    ctx.arc(45, 5, 25, 0, Math.PI * 2);

    ctx.ellipse(5, 15, 65, 22, 0, 0, Math.PI * 2);

    ctx.fill();

    ctx.restore();
}


function chooseNextColor() {
    const availableColors = rainbowColors.filter(
        color => !completedColors.includes(color)
    );

    const randomIndex = Math.floor(Math.random() * availableColors.length);

    requiredColor = availableColors[randomIndex];
}

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

    const totalSwipes =
      gameSettings.roundsToWin *
      gameSettings.colorsPerRound *
      gameSettings.swipesPerColor;

    const startingGrowth = 0.15;

    const growth = Math.min(
      startingGrowth + (rainbowProgress / totalSwipes) * (1 - startingGrowth),
      1,
    );

    const fullArc = rainbowSettings.endAngle - rainbowSettings.startAngle;
    const visibleEndAngle = rainbowSettings.startAngle + fullArc * growth;

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
            visibleEndAngle
        );

        ctx.stroke();


        // Main colour
        ctx.strokeStyle = color;
        ctx.lineWidth = rainbowSettings.bandWidth + rainbowPulse * 8 + Math.sin(winAnimation) * 3;
        ctx.globalAlpha = rainbowSettings.alpha + rainbowPulse * 0.5 + Math.max(0, Math.sin(winAnimation)) * 0.2;

        ctx.beginPath();

        ctx.arc(
            rainbowSettings.x,
            rainbowSettings.y,
            bandRadius,
            rainbowSettings.startAngle,
            visibleEndAngle
        );

        ctx.stroke();
    });

    ctx.restore();
}


function createColor(x, color) {
    return {
        x: x,
        y: streamSettings.y,
        size: 56,
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





let x = 0;

function resizeCanvas() {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      streamSettings.y = streamSettings.mobileY;
    } else {
      streamSettings.y = streamSettings.desktopY;
    }

    canvas.width = isMobile ? 358 : 1024;
    canvas.height = window.innerHeight;

    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";

    if (isMobile) {
        rainbowSettings.x = canvas.width / 2;
        rainbowSettings.y = canvas.height * 0.44;
        rainbowSettings.radius = canvas.width * 0.74;
    } else {
        rainbowSettings.x = canvas.width / 2;
        rainbowSettings.y = canvas.height * 1.05;
        rainbowSettings.radius = canvas.width * 0.9;
    }
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
    updateFeedbacks(deltaTime);

    for (let sparkle of silverSparkle) {
      sparkle.x += sparkle.vx * deltaTime;
      sparkle.y += sparkle.vy * deltaTime;
      sparkle.life -= deltaTime;
    }

    silverSparkle = silverSparkle.filter((sparkle) => sparkle.life > 0);

    wrongFlash = Math.max(0, wrongFlash - deltaTime * 5);
    timeFlash = Math.max(0, timeFlash - deltaTime * 5);
    rainbowPulse = Math.max(0, rainbowPulse - deltaTime * 4);

    if (rainbowComplete) {
      winAnimation += deltaTime * 5;

      for (let particle of winParticles) {
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;
        particle.life -= deltaTime;
      }

      winParticles = winParticles.filter((particle) => particle.life > 0);
    }

    if (silverCooldownTimer > 0) {
      silverCooldownTimer -= deltaTime;
    }

    if (heartCooldownTimer > 0) {
      heartCooldownTimer -= deltaTime;
    }


    if (rainbowComplete) return;

    if (gameOver) {
        gameOverAnimation += deltaTime * 4;
        return;
    }

    accelerationTimer -= deltaTime;

    if (accelerationTimer <= 0) {
      currentSpeed = Math.min(
        currentSpeed + difficulty.speedIncrease,
        difficulty.maxSpeed,
      );

      accelerationTimer = accelerationInterval;
    }



    timer -= deltaTime;

    if (timer <= 0) {
      lives--;
      timeFlash = 1;

      showFeedback("Time, tick-tock!", canvas.width / 2, canvas.height * 0.35);

      timer = responseTime;
      startColorWindow();

      if (lives <= 0) {
        gameOver = true;
        gameOverAnimation = 1;
      }
    }

    spawnTimer -= deltaTime;

    if (spawnTimer <= 0) {
      spawnColor();
      spawnTimer = 0.5;
      
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

  drawSky();

  const isMobile = canvas.width < 768;

  if (isMobile) {
    drawCloud(canvas.width * 0.25, 120, 0.6);
    drawCloud(canvas.width * 0.75, 180, 0.7);
  } else {
    drawCloud(canvas.width * 0.18, 140, 0.8);
    drawCloud(canvas.width * 0.5, 190, 1);
    drawCloud(canvas.width * 0.82, 120, 0.7);
  }

  drawRainbow();

  for (let color of colors) {
    if (color.color === "heart") {
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText("♥", color.x + color.size / 2, color.y + color.size / 2);

      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    } else if (color.color === "silver") {
      const size = 40;
      const offset = (color.size - size) / 2;

      const x = color.x + offset;
      const y = color.y + offset;

      ctx.fillStyle = "rgba(220, 235, 245, 0.5)";
      ctx.shadowColor = "rgba(220, 235, 245, 0.3)";
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.roundRect(x, y, size, size, 8);
      ctx.fill();

      ctx.shadowBlur = 0;
    } else {
      drawBubble(
        color.x + color.size / 2,
        color.y + color.size / 2,
        color.size / 2,
        bubbleColors[color.color],
      );
    }
  }

  drawFeedbacks();

  if (rainbowComplete) {
    for (let particle of winParticles) {
      ctx.fillStyle = `rgba(255,255,255,${particle.life})`;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let sparkle of silverSparkle) {
    ctx.fillStyle = `rgba(255,255,255,${sparkle.life * 2})`;

    ctx.beginPath();
    ctx.arc(sparkle.x, sparkle.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  const requiredWidth = canvas.width * 0.75;
  const requiredHeight = 60;
  const requiredX = (canvas.width - requiredWidth) / 2;
  const requiredY = canvas.height - requiredHeight - 20;

  const gradient = ctx.createRadialGradient(
    requiredX + requiredWidth * 0.3,
    requiredY + requiredHeight * 0.3,
    5,
    requiredX + requiredWidth / 2,
    requiredY + requiredHeight / 2,
    requiredWidth * 0.6,
  );

  gradient.addColorStop(0, "rgba(255,255,255,0.5)");

  gradient.addColorStop(0.2, `rgba(${bubbleColors[requiredColor]},0.5)`);

  gradient.addColorStop(0.6, `rgba(${bubbleColors[requiredColor]},0.5)`);

  gradient.addColorStop(1, `rgba(${bubbleColors[requiredColor]},0.5)`);

  ctx.shadowColor = `rgba(${bubbleColors[requiredColor]}, 0.25)`;
  ctx.shadowBlur = 15;

  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.roundRect(
    requiredX,
    requiredY,
    requiredWidth,
    requiredHeight,
    requiredHeight / 3,
  );

  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";

  ctx.fillText(`♥ ${lives}`, 20, 40);

  ctx.fillText(`⏱ ${Math.ceil(timer)}`, 100, 40);

  ctx.textAlign = "right";
  ctx.fillText(`Score: ${score}`, canvas.width - 20, 40);

  ctx.textAlign = "left";

  if (wrongFlash > 0) {
    ctx.fillStyle = `rgba(255, 0, 0, ${wrongFlash * 0.15})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (timeFlash > 0) {
    ctx.fillStyle = `rgba(255, 180, 0, ${timeFlash * 0.12})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (gameOver) {
    const pulse = 0.12 + Math.abs(Math.sin(gameOverAnimation)) * 0.08;

    ctx.fillStyle = `rgba(0, 0, 0, ${pulse})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (gameOver) {
    const scale = 1 + Math.abs(Math.sin(gameOverAnimation)) * 0.05;

    ctx.save();

    ctx.translate(canvas.width / 2, canvas.height * 0.35);
    ctx.scale(scale, scale);

    ctx.fillStyle = "white";
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("GAME OVER", 0, 0);

    ctx.font = "bold 20px Arial";
    ctx.fillText("PLAY AGAIN", 0, 55);

    ctx.restore();
  }
}


// GAME LOOP =============================================================
function gameLoop(time) {
    update(time);
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);


function restartGame() {
    lives = 3;
    score = 0;
    timer = responseTime;

    rainbowProgress = 0;
    rainbowComplete = false;
    gameOver = false;

    currentRound = 1;
    completedColors = [];
    swipesForCurrentColor = 0;

    colors = [];
    spawnTimer = 0;

    currentSpeed = difficulty.startSpeed;
    accelerationTimer = 0;

    chooseNextColor();
    startColorWindow();
}

canvas.addEventListener("touchstart", function (event) {
  touchStartY = event.touches[0].clientY;
  touchStartX = event.touches[0].clientX;
});

canvas.addEventListener("touchend", function (event) {
  if (gameOver) {
    restartGame();
    return;
  }
  if (rainbowComplete || gameOver) return;

  const touchEndY = event.changedTouches[0].clientY;
  const distance = touchStartY - touchEndY;

  if (distance > 50) {
    const color = getColorAtPosition(
      touchStartX + currentSpeed * gameSettings.swipeOffsetMultiplier,
      touchStartY,
    );

    if (color) {
      if (color.color === "silver") {
        swipesForCurrentColor += silverSettings.reward;
        score += silverSettings.reward;
        timer = responseTime;

        showFeedback("+3", color.x + color.size / 2, color.y);

        for (let i = 0; i < 12; i++) {
          silverSparkle.push({
            x: color.x + color.size / 2,
            y: color.y + color.size / 2,
            vx: (Math.random() - 0.5) * 160,
            vy: (Math.random() - 0.5) * 160,
            life: 0.5,
          });
        }

        if (swipesForCurrentColor >= gameSettings.swipesPerColor) {
          completedColors.push(requiredColor);
          swipesForCurrentColor = 0;

          if (completedColors.length >= gameSettings.colorsPerRound) {
            rainbowProgress++;
            currentRound++;

            if (currentRound > gameSettings.roundsToWin) {
              rainbowComplete = true;
              winAnimation = 1;
              showFeedback("YOU WIN!", canvas.width / 2, canvas.height * 0.35);

              for (let i = 0; i < 25; i++) {
                winParticles.push({
                  x: canvas.width / 2,
                  y: canvas.height * 0.45,
                  vx: (Math.random() - 0.5) * 200,
                  vy: (Math.random() - 0.5) * 200,
                  life: 1,
                });
              }
            } else {
              completedColors = [];
              chooseNextColor();
              showFeedback(
                `Awesome!Round ${currentRound}!`,
                canvas.width / 2,
                canvas.height * 0.35,
              );
            }
          } else {
            chooseNextColor();
          }
        }
      } else if (color.color === "heart") {
        lives += heartSettings.rewardLife;
        score += heartSettings.rewardScore;

        timer = responseTime;

        showFeedback("+1 LIFE", color.x + color.size / 2, color.y);
      } else if (color.color === requiredColor) {
        swipesForCurrentColor++;
        rainbowProgress++;
        score++;
        timer = responseTime;
        rainbowPulse = 1;

        showFeedback("+1", color.x + color.size / 2, color.y);

        if (swipesForCurrentColor >= gameSettings.swipesPerColor) {
          completedColors.push(requiredColor);
          swipesForCurrentColor = 0;

          if (completedColors.length >= gameSettings.colorsPerRound) {
            currentRound++;

            if (currentRound > gameSettings.roundsToWin) {
              rainbowComplete = true;
              helpText.textContent = "YOU WIN!";
            } else {
              completedColors = [];
              chooseNextColor();
              helpText.textContent = `ROUND ${currentRound}`;
            }
          } else {
            chooseNextColor();
          }
        }
      } else {
        lives--;
        timer = responseTime;
        wrongFlash = 1;

        showFeedback("Oops!", color.x + color.size / 2, color.y);

        if (lives <= 0) {
          gameOver = true;
          gameOverAnimation = 1;
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


