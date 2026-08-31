

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
let score = 0;
let requiredColorCount = 0;
let requiredColorSpawned = 0;
let shotPlan = [];
let shotIndex = 0;


function createColor(x, color) {
    return {
        x: x,
        y: 200,
        size: 50,
        speed: 2,
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

    if (shotPlan[shotIndex]) {
        newColor = requiredColor;
        requiredColorSpawned++;
    } else {
        const otherColors = rainbowColors.filter(
            color => color !== requiredColor
        );

        newColor =
            otherColors[Math.floor(Math.random() * otherColors.length)];
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

    if (rainbowComplete || gameOver) return;

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
        color.x += color.speed;
    }

    colors = colors.filter(color => color.x <= canvas.width);
}


// DRAWING =============================================================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let color of colors) {
        ctx.fillStyle = color.color;

        ctx.fillRect(
            color.x,
            color.y,
            color.size,
            color.size
        );
    }

    ctx.fillStyle = requiredColor;
    ctx.fillRect(20, 20, 50, 50);

    const centerX = canvas.width / 2;
    const centerY = 100;

    rainbowColors.forEach((color, index) => {
        if (rainbowProgress >= index * 3) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 10;
            ctx.arc(
                centerX,
                centerY,
                80 + index * 10,
                Math.PI,
                0
            );
            ctx.stroke();
        }
    });


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

            if (color.color === requiredColor) {

                rainbowProgress++;
                score++;
                timer = responseTime;

                requiredColorSpawned = false;

                helpText.textContent = `Correct! ${rainbowProgress}`;

                if (rainbowProgress % 3 === 0) {
                    currentColorIndex++;
                    requiredColor = rainbowColors[currentColorIndex];
                }

                if (rainbowProgress >= 21) {
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
            colors = colors.filter(c => c !== color);

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


