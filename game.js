const barista = document.getElementById('barista');
const gameArea = document.getElementById('gameArea');
const scoreBoard = document.getElementById('score');
const banner = document.getElementById('banner');
let score = 0;

const enemySprites = [
    {'path':'enemy_0.png', 'audio':'I needed that .mp3'},
    {'path':'enemy_1.jpeg', 'audio':'OOH_ACH.mp3'},
    {'path':'enemy_2.png', 'audio':'Thank you kindly.mp3'},
    {'path':'enemy_3.jpg', 'audio':'Love me some caffein.mp3'},
    {'path':'enemy_4.jpg', 'audio':'Coffee yum.mp3'},
    {'path':'enemy_5.jpg', 'audio':'You re a kind wee lass.mp3'},
];

const enemies = [];
const coffees = [];
const threshold = 10
let enemyInterval = 2000; // Starting interval for enemy creation

var bagpipesPlaying = false
const bagpipes = new Audio('bagpipes.mp3')

function createEnemy() {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    const spriteInfo = enemySprites[Math.floor(Math.random() * enemySprites.length)];
    const sprite = spriteInfo.path;
    enemy.audioFile = spriteInfo.audio;
    enemy.style.backgroundImage = `url(${sprite})`;

    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
        case 0: // Top
            enemy.style.top = '-40px';
            enemy.style.left = `${Math.random() * 100}vw`;
            break;
        case 1: // Right
            enemy.style.top = `${Math.random() * 100}vh`;
            enemy.style.left = '100vw';
            break;
        case 2: // Bottom
            enemy.style.top = '100vh';
            enemy.style.left = `${Math.random() * 100}vw`;
            break;
        case 3: // Left
            enemy.style.top = `${Math.random() * 100}vh`;
            enemy.style.left = '-40px';
            break;
    }

    gameArea.appendChild(enemy);
    enemies.push(enemy);

    // Schedule the next enemy creation
    setTimeout(createEnemy, enemyInterval);
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        const enemyRect = enemy.getBoundingClientRect();
        const baristaRect = barista.getBoundingClientRect();

        const angle = Math.atan2(
            baristaRect.top + baristaRect.height / 2 - enemyRect.top,
            baristaRect.left + baristaRect.width / 2 - enemyRect.left
        );

        enemy.style.left = `${enemyRect.left + Math.cos(angle) * 2}px`;
        enemy.style.top = `${enemyRect.top + Math.sin(angle) * 2}px`;

        if (checkCollision(enemy, barista)) {
            bagpipes.pause()
            const score = document.getElementById('score').textContent
            alert('Failing means yer playing! Your score was ' + score + '.');
            resetGame();
        }
    });
}

function createCoffee(event) {
    const coffee = document.createElement('div');
    coffee.classList.add('coffee');
    coffee.style.left = `${barista.offsetLeft + barista.offsetWidth / 2 - 10}px`;
    coffee.style.top = `${barista.offsetTop + barista.offsetHeight / 2 - 10}px`;
    coffee.style.backgroundImage = `url(coffee.jpg)`;
    gameArea.appendChild(coffee);
    coffees.push({ element: coffee, angle: Math.atan2(event.clientY - window.innerHeight / 2, event.clientX - window.innerWidth / 2) });
}

function moveCoffees() {
    coffees.forEach((coffeeObj, index) => {
        const coffee = coffeeObj.element;
        coffee.style.left = `${coffee.offsetLeft + Math.cos(coffeeObj.angle) * 5}px`;
        coffee.style.top = `${coffee.offsetTop + Math.sin(coffeeObj.angle) * 5}px`;

        enemies.forEach((enemy, enemyIndex) => {
            if (checkCollision(coffee, enemy)) {
                const audioPath = enemy.audioFile;
                enemy.remove();
                enemies.splice(enemyIndex, 1);
                coffee.remove();
                coffees.splice(index, 1);
                score++;
                scoreBoard.innerText = score;
                console.log("Playing " + audioPath);
                const audio = new Audio(audioPath);
                audio.play();
                
                // Increase the interval slightly with each score
                enemyInterval = Math.max(500, enemyInterval - 50); // Decrease interval, minimum 500ms
            }
        });

        if (coffee.offsetLeft < 0 || coffee.offsetLeft > window.innerWidth || coffee.offsetTop < 0 || coffee.offsetTop > window.innerHeight) {
            coffee.remove();
            coffees.splice(index, 1);
        }
    });
}

function checkCollision(rect1, rect2) {
    const rect1Rect = rect1.getBoundingClientRect();
    const rect2Rect = rect2.getBoundingClientRect();

    return !(
        rect1Rect.top > rect2Rect.bottom ||
        rect1Rect.bottom < rect2Rect.top ||
        rect1Rect.left > rect2Rect.right ||
        rect1Rect.right < rect2Rect.left
    );
}

function gameLoop() {
    if (score > threshold & bagpipesPlaying === false) {
        bagpipes.play()
    }
    moveEnemies();
    moveCoffees();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    enemies.forEach(enemy => enemy.remove());
    coffees.forEach(coffee => coffee.element.remove());
    enemies.length = 0;
    coffees.length = 0;
    score = 0;
    scoreBoard.innerText = score;
    enemyInterval = 2000; // Reset interval to the initial value
    createEnemy(); // Restart enemy creation
}

gameArea.addEventListener('click', createCoffee);
createEnemy(); // Start the first enemy creation
gameLoop();
