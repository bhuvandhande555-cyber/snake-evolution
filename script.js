const SIZE = 25;

const TOTAL_OBSTACLES = 22;


/* =========================
   ELEMENTS
========================= */

const board =
    document.getElementById("board");

const scoreEl =
    document.getElementById("score");

const highScoreEl =
    document.getElementById("highScore");

const lengthEl =
    document.getElementById("length");

const speedEl =
    document.getElementById("speed");

const obstacleEl =
    document.getElementById("obstacles");

const levelEl =
    document.getElementById("level");

const foodCountEl =
    document.getElementById("foodCount");

const collisionCountEl =
    document.getElementById("collisionCount");

const survivalTimeEl =
    document.getElementById("survivalTime");

const gameStatus =
    document.getElementById("gameStatus");

const logEl =
    document.getElementById("log");

const startBtn =
    document.getElementById("startBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const restartBtn =
    document.getElementById("restartBtn");

const overlay =
    document.getElementById("overlay");

const resultTitle =
    document.getElementById("resultTitle");

const resultText =
    document.getElementById("resultText");

const finalScore =
    document.getElementById("finalScore");

const overlayRestart =
    document.getElementById("overlayRestart");


/* =========================
   GAME VARIABLES
========================= */

let cells = [];

let snake = [];

let food = null;

let obstacles = [];


let direction = {
    x: 1,
    y: 0
};


let nextDirection = {
    x: 1,
    y: 0
};


let score = 0;

let foodCount = 0;

let collisionCount = 0;

let survivalSeconds = 0;


/* =========================
   SLOWER SPEED
========================= */

let speed = 130;


let highScore =
    Number(
        localStorage.getItem(
            "snakeHighScore"
        )
    ) || 0;


let gameRunning = false;

let gamePaused = false;

let gameTimer = null;

let survivalTimer = null;


/* =========================
   CREATE BOARD
========================= */

function createBoard() {

    board.innerHTML = "";

    cells = [];


    for (
        let i = 0;
        i < SIZE * SIZE;
        i++
    ) {

        const cell =
            document.createElement("div");

        cell.className =
            "cell";

        board.appendChild(cell);

        cells.push(cell);
    }
}


/* =========================
   INITIALIZE
========================= */

function initializeGame() {

    snake = [

        {
            x: 12,
            y: 12
        },

        {
            x: 11,
            y: 12
        },

        {
            x: 10,
            y: 12
        }

    ];


    direction = {
        x: 1,
        y: 0
    };


    nextDirection = {
        x: 1,
        y: 0
    };


    score = 0;

    foodCount = 0;

    collisionCount = 0;

    survivalSeconds = 0;


    /* 130ms STARTING SPEED */

    speed = 130;


    createObstacles();

    createFood();


    gameRunning = false;

    gamePaused = false;


    updateStats();

    draw();


    gameStatus.textContent =
        "READY";


    addLog(
        "New high-difficulty night arena created."
    );
}


/* =========================
   OBSTACLES
========================= */

function createObstacles() {

    obstacles = [];


    while (
        obstacles.length <
        TOTAL_OBSTACLES
    ) {

        const position = {

            x:
                Math.floor(
                    Math.random() *
                    SIZE
                ),

            y:
                Math.floor(
                    Math.random() *
                    SIZE
                )

        };


        /*
            Keep starting area clear
        */

        if (

            position.x >= 8 &&
            position.x <= 16 &&

            position.y >= 8 &&
            position.y <= 16

        ) {

            continue;
        }


        if (
            isSnakePosition(position)
        ) {

            continue;
        }


        if (

            obstacles.some(
                obstacle =>

                    obstacle.x ===
                    position.x &&

                    obstacle.y ===
                    position.y
            )

        ) {

            continue;
        }


        obstacles.push(position);
    }
}


/* =========================
   FOOD
========================= */

function createFood() {

    let position;


    do {

        position = {

            x:
                Math.floor(
                    Math.random() *
                    SIZE
                ),

            y:
                Math.floor(
                    Math.random() *
                    SIZE
                )

        };

    }

    while (

        isSnakePosition(
            position
        )

        ||

        isObstacle(
            position
        )

    );


    food = position;
}


/* =========================
   START GAME
========================= */

function startGame() {

    if (gameRunning)
        return;


    gameRunning = true;

    gamePaused = false;


    gameStatus.textContent =
        "RUNNING";


    addLog(
        "🐍 Snake entered the night city."
    );


    clearInterval(gameTimer);

    clearInterval(survivalTimer);


    gameTimer =
        setInterval(
            gameLoop,
            speed
        );


    survivalTimer =
        setInterval(

            () => {

                if (
                    gameRunning &&
                    !gamePaused
                ) {

                    survivalSeconds++;


                    survivalTimeEl.textContent =
                        survivalSeconds +
                        "s";
                }

            },

            1000

        );


    updatePauseButton();
}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    if (
        !gameRunning ||
        gamePaused
    )
        return;


    direction =
        nextDirection;


    const head =
        snake[0];


    const newHead = {

        x:
            head.x +
            direction.x,

        y:
            head.y +
            direction.y

    };


    /* WALL COLLISION */

    if (

        newHead.x < 0 ||

        newHead.x >= SIZE ||

        newHead.y < 0 ||

        newHead.y >= SIZE

    ) {

        collisionCount++;


        updateStats();


        endGame(

            "GAME OVER",

            "The snake hit the city boundary."

        );


        return;
    }


    /* OBSTACLE COLLISION */

    if (
        isObstacle(newHead)
    ) {

        collisionCount++;


        updateStats();


        addLog(
            "💥 Snake hit a city obstacle."
        );


        endGame(

            "GAME OVER",

            "The snake collided with an obstacle."

        );


        return;
    }


    /* SELF COLLISION */

    if (
        isSnakePosition(newHead)
    ) {

        collisionCount++;


        updateStats();


        addLog(
            "💥 Snake collided with itself."
        );


        endGame(

            "GAME OVER",

            "The snake collided with its own body."

        );


        return;
    }


    /*
        Add new head
    */

    snake.unshift(
        newHead
    );


    /* FOOD */

    if (

        newHead.x ===
        food.x &&

        newHead.y ===
        food.y

    ) {

        score += 10;

        foodCount++;


        createFood();


        addLog(
            "🍎 Food collected! +10 score."
        );


        updateSpeed();

    }

    else {

        /*
            Remove tail

            This demonstrates
            the queue/deque idea.
        */

        snake.pop();
    }


    /* LEVEL */

    const level =
        Math.floor(
            score / 50
        ) + 1;


    levelEl.textContent =
        level;


    updateStats();

    draw();
}


/* =========================
   SLOW SPEED PROGRESSION
========================= */

function updateSpeed() {

    /*
        Starting:
        130ms

        Speed slowly increases
        every 50 points.

        Minimum:
        75ms
    */

    speed =
        Math.max(

            75,

            130 -
            Math.floor(
                score / 50
            ) * 5

        );


    clearInterval(
        gameTimer
    );


    gameTimer =
        setInterval(
            gameLoop,
            speed
        );


    speedEl.textContent =
        speed + "ms";


    if (

        score > 0 &&

        score % 50 === 0

    ) {

        addLog(
            "🔥 LEVEL UP! Speed increased slightly."
        );
    }
}


/* =========================
   DRAW
========================= */

function draw() {

    cells.forEach(
        cell => {

            cell.innerHTML =
                "";
        }
    );


    /* DRAW OBSTACLES */

    obstacles.forEach(
        obstacle => {

            const cell =
                getCell(
                    obstacle
                );


            if (!cell)
                return;


            const block =
                document.createElement(
                    "div"
                );


            block.className =
                "obstacle";


            cell.appendChild(
                block
            );

        }
    );


    /* DRAW FOOD */

    if (food) {

        const foodCell =
            getCell(food);


        if (foodCell) {

            const foodElement =
                document.createElement(
                    "div"
                );


            foodElement.className =
                "food";


            foodCell.appendChild(
                foodElement
            );
        }
    }


    /* DRAW SNAKE */

    snake.forEach(

        (part, index) => {

            const cell =
                getCell(part);


            if (!cell)
                return;


            const body =
                document.createElement(
                    "div"
                );


            body.className =

                index === 0

                    ? "snake head"

                    : "snake";


            /* HEAD DETAILS */

            if (
                index === 0
            ) {

                const leftEye =
                    document.createElement(
                        "span"
                    );


                leftEye.className =
                    "pupil left";


                const rightEye =
                    document.createElement(
                        "span"
                    );


                rightEye.className =
                    "pupil right";


                const tongue =
                    document.createElement(
                        "span"
                    );


                tongue.className =
                    "tongue";


                body.appendChild(
                    leftEye
                );


                body.appendChild(
                    rightEye
                );


                body.appendChild(
                    tongue
                );
            }


            cell.appendChild(
                body
            );

        }
    );
}


/* =========================
   GET CELL
========================= */

function getCell(position) {

    if (

        position.x < 0 ||

        position.x >= SIZE ||

        position.y < 0 ||

        position.y >= SIZE

    ) {

        return null;
    }


    return cells[
        position.y *
        SIZE +
        position.x
    ];
}


/* =========================
   SNAKE COLLISION
========================= */

function isSnakePosition(
    position
) {

    return snake.some(

        part =>

            part.x ===
            position.x &&

            part.y ===
            position.y

    );
}


/* =========================
   OBSTACLE COLLISION
========================= */

function isObstacle(
    position
) {

    return obstacles.some(

        obstacle =>

            obstacle.x ===
            position.x &&

            obstacle.y ===
            position.y

    );
}


/* =========================
   KEYBOARD CONTROLS
========================= */

document.addEventListener(

    "keydown",

    event => {

        const key =
            event.key.toLowerCase();


        /* UP */

        if (

            key === "arrowup" ||

            key === "w"

        ) {

            if (
                direction.y !== 1
            ) {

                nextDirection = {

                    x: 0,

                    y: -1
                };
            }
        }


        /* DOWN */

        else if (

            key === "arrowdown" ||

            key === "s"

        ) {

            if (
                direction.y !== -1
            ) {

                nextDirection = {

                    x: 0,

                    y: 1
                };
            }
        }


        /* LEFT */

        else if (

            key === "arrowleft" ||

            key === "a"

        ) {

            if (
                direction.x !== 1
            ) {

                nextDirection = {

                    x: -1,

                    y: 0
                };
            }
        }


        /* RIGHT */

        else if (

            key === "arrowright" ||

            key === "d"

        ) {

            if (
                direction.x !== -1
            ) {

                nextDirection = {

                    x: 1,

                    y: 0
                };
            }
        }


        /* SPACE */

        else if (
            key === " "
        ) {

            togglePause();
        }

    }
);


/* =========================
   MOBILE CONTROLS
========================= */

document
    .querySelectorAll(
        ".mobile-controls button"
    )
    .forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    const dir =
                        button.dataset.dir;


                    if (

                        dir === "up" &&

                        direction.y !== 1

                    ) {

                        nextDirection = {

                            x: 0,

                            y: -1
                        };
                    }


                    else if (

                        dir === "down" &&

                        direction.y !== -1

                    ) {

                        nextDirection = {

                            x: 0,

                            y: 1
                        };
                    }


                    else if (

                        dir === "left" &&

                        direction.x !== 1

                    ) {

                        nextDirection = {

                            x: -1,

                            y: 0
                        };
                    }


                    else if (

                        dir === "right" &&

                        direction.x !== -1

                    ) {

                        nextDirection = {

                            x: 1,

                            y: 0
                        };
                    }

                }
            );

        }
    );


/* =========================
   PAUSE
========================= */

function togglePause() {

    if (!gameRunning)
        return;


    gamePaused =
        !gamePaused;


    updatePauseButton();


    if (gamePaused) {

        gameStatus.textContent =
            "PAUSED";


        addLog(
            "⏸ Game paused."
        );

    }

    else {

        gameStatus.textContent =
            "RUNNING";


        addLog(
            "▶ Game resumed."
        );
    }
}


/* =========================
   PAUSE BUTTON
========================= */

function updatePauseButton() {

    pauseBtn.textContent =

        gamePaused

            ? "▶ RESUME"

            : "⏸ PAUSE";
}


/* =========================
   RESTART
========================= */

function restartGame() {

    clearInterval(
        gameTimer
    );

    clearInterval(
        survivalTimer
    );


    overlay.classList.remove(
        "show"
    );


    initializeGame();


    startGame();


    addLog(
        "🔄 Game restarted."
    );
}


/* =========================
   GAME OVER
========================= */

function endGame(
    title,
    message
) {

    gameRunning =
        false;


    clearInterval(
        gameTimer
    );


    clearInterval(
        survivalTimer
    );


    gameStatus.textContent =
        "GAME OVER";


    /* HIGH SCORE */

    if (
        score > highScore
    ) {

        highScore =
            score;


        localStorage.setItem(

            "snakeHighScore",

            highScore

        );


        addLog(
            "🏆 NEW HIGH SCORE!"
        );
    }


    finalScore.textContent =
        score;


    resultTitle.textContent =
        title;


    resultText.textContent =
        message;


    overlay.classList.add(
        "show"
    );


    updateStats();
}


/* =========================
   UPDATE STATS
========================= */

function updateStats() {

    scoreEl.textContent =
        score;


    highScoreEl.textContent =
        highScore;


    lengthEl.textContent =
        snake.length;


    speedEl.textContent =
        speed + "ms";


    obstacleEl.textContent =
        obstacles.length;


    foodCountEl.textContent =
        foodCount;


    collisionCountEl.textContent =
        collisionCount;


    survivalTimeEl.textContent =
        survivalSeconds +
        "s";


    levelEl.textContent =

        Math.floor(
            score / 50
        ) + 1;
}


/* =========================
   ACTIVITY LOG
========================= */

function addLog(message) {

    const item =
        document.createElement(
            "p"
        );


    const time =
        new Date().toLocaleTimeString(

            [],

            {
                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit"
            }

        );


    item.textContent =
        `[${time}] ${message}`;


    logEl.prepend(
        item
    );


    while (
        logEl.children.length >
        12
    ) {

        logEl.removeChild(
            logEl.lastChild
        );
    }
}


/* =========================
   BUTTON EVENTS
========================= */

startBtn.addEventListener(
    "click",
    startGame
);


pauseBtn.addEventListener(
    "click",
    togglePause
);


restartBtn.addEventListener(
    "click",
    restartGame
);


overlayRestart.addEventListener(
    "click",
    restartGame
);


/* =========================
   INITIAL SETUP
========================= */

createBoard();

initializeGame();