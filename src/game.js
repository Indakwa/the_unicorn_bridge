

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



let colors = [
    {
        x: 0,
        y: 200,
        size: 50,
        speed: 2,
        color: "red"
    },
    {
        x: 150,
        y: 200,
        size: 50,
        speed: 2,
        color: "blue"
    },
    {
        x: 300,
        y: 200,
        size: 50,
        speed: 2,
        color: "green"
    }
];


let x = 0;



function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
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

      if (lives <= 0) {
        gameOver = true;
        helpText.textContent = "GAME OVER!";
      }
    }

    for (let color of colors) {
        color.x += color.speed;

        if (color.x > canvas.width) {
            color.x = -color.size;
        }
    }
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

    const rainbowColors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

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
                        timer = responseTime;
                        helpText.textContent = `Correct! ${rainbowProgress}`;

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


