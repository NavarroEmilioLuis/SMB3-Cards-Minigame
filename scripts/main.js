const cards = ["shroom", "flower", "star", "10coins", "20coins", "1up"];
const div = document.querySelector("div");

// Game state variables
let clicked = [];
let matched = [];
let eraseQ = [];
let handlers = false;
let animationOver = false;
let playBgm = false;
let playFx = true;
let moveIndex = 1;

// Three instances of the same audio to allow overlap
const move = {0: new Audio(), 1: new Audio(), 2: new Audio()};
move[0].src ="audio/move.wav";
move[1].src ="audio/move.wav";
move[2].src ="audio/move.wav";

// Load sprite map and assets, paint background and selector on load
const cardSprites = new Image();
cardSprites.src = "sprites/cards_animation.png";

const backgroundSprites = new Image();
backgroundSprites.addEventListener("load", function() {
  const backgroundCx = document.getElementById("background").getContext("2d");
  backgroundCx.imageSmoothingEnabled = false;
  backgroundCx.drawImage(backgroundSprites, 0, 0, 256, 168, 0, 0, 512, 336);
});
backgroundSprites.src = "sprites/background.png";

const selectorSprite = new Image();
selectorSprite.addEventListener("load", function() {
  const selectorCx = document.getElementById("selector").getContext("2d");
  selectorCx.imageSmoothingEnabled = false;
  selectorCx.drawImage(selectorSprite, 0, 0, 56, 88);
});
selectorSprite.src = "sprites/selector.png";

// Moves the canvas selector over the specified canvas card id
// id: int, touch: boolean
function updateSelector(id, touch) {

  // Trigger move sound if it was made with mouse or keyboard
  if (!touch)
    fx("move");

  // Get position of specified card
  selectorOver = id;
  const current = document.getElementById(id);
  const x = current.style.left.match(/\d+/) - 6;
  const y = current.style.top.match(/\d+/) - 6;

  // Change selector position
  const selector = document.getElementById("selector");
  selector.style.top = y + "px";
  selector.style.left = x + "px";
}

// Mouse and touch support variables
let selectorOver = 0;
let mouseOver = 0;
let mouseMoved = false;
let hover = null;

// Creates canvas element with the specified coordinates (x, y)
// and id number (n) for each card
// x: int, y: int, n: int
function elt(x, y, n) {

  // Create canvas element and assign attributes
  const canvas = document.createElement("canvas");
  canvas.width = 44;
  canvas.height = 76;
  canvas.id = n;
  canvas.classList.add("card");
  canvas.style.top = y + "px";
  canvas.style.left = x + "px";

  
  // Checks if canvas should be selected
  canvas.addEventListener("mouseenter", function(event) {
    const current = event.target;

    // Check inputs are not blocked
    if (!handlers) {
      mouseOver = Number(current.id);
      if (!mouseMoved)
        mouseMoved = true;
      return;
    }

    // Make sure canvas is not already selected
    if (hover === current)
      return;

    // Update selector and current selected canvas
    updateSelector(Number(current.id));
    mouseOver = Number(current.id);
    hover = current;
  });

  div.appendChild(canvas);
};

// Create canvas elements. The constants represent the max size
// of a card sprite (width 58, height 60) and the space offset
// for each element (64 and 96)
for (let y = 0; y < 3; y++)
  for (let x = 0; x < 6; x++)
    elt(x * 64 + 58, y * 96 + 60, x + y * 6);

// Erases all canvas specified in the queue
function eraseAll() {
  for (let i = 0; i < eraseQ.length; i++) {
    const cx = document.getElementById(eraseQ[i]).getContext("2d");
    cx.clearRect(0, 0, 44, 76);
  }
  eraseQ = [];
}

// Plays next move audio instance
function fxMove() {
  const i = moveIndex % 3;
  move[i].play();
  moveIndex++;
}

// Plays the indicated sound effect
// action: string, card: string
function fx(action, card) {

  // Check FX sounds are toggled on
  if (!playFx)
    return;

  // Get effect HTML element id
  let sound = "fx";

  if (action === "move")
    return fxMove();
  else if (card === "1up")
    sound += card;
  else if (card === "10coins" || card === "20coins")
    sound += "coin";
  else
    sound += action;

  const fx = document.getElementById(sound);
  fx.play();
}

// Updates global variable to toggle BGM
function toggleBGM() {
  const bgm = document.getElementById("bgm");
  if (!playBgm) {
    playBgm = true;
    return bgm.play();
  }
  bgm.pause();
  playBgm = false;
}

// Updates global variable to toggle FX
function toggleFx() {
  if (playFx)
    return playFx = false;
  playFx = true;
}

// Updates global variables to toggle event handlers
function toggleHandlers() {

  if (handlers) {
    removeEventListener("keydown", keyDown);
    removeEventListener("keyup", keyUp);
    div.removeEventListener("click", mouseClick);
    div.removeEventListener("touchend", touchControls)
    return handlers = false;
  }

  addEventListener("keydown", keyDown);
  addEventListener("keyup", keyUp);
  div.addEventListener("click", mouseClick);
  div.addEventListener("touchend", touchControls)
  handlers = true;
  animationOver = true;

  // Update selector if mouse is over a different canvas
  if (mouseMoved && mouseOver !== selectorOver) {
    updateSelector(mouseOver);
    hover = document.getElementById(mouseOver);
    mouseMoved = false;
  }
}

// Paints specified cards back side
// id: int, card: string
function paintBack(id, card, id2, card2) {
  let lastTime = null;
  let cycle = 5;
  let current = 0;
  let curId = id;
  let curCard = card;

  function animate(time) {

    // Make sure 80ms have passed to paint next frame
    if (time - lastTime < 80)
      return requestAnimationFrame(animate);

    // Update animation variables and select correct card rect from sprite map
    lastTime = time;
    const offsetX = 22 * cycle;
    const offsetY = 38 * cards.indexOf(curCard);
    const cx = document.getElementById(curId).getContext("2d");
    cx.imageSmoothingEnabled = false;
    cx.drawImage(cardSprites, offsetX, offsetY, 22, 38, 0, 0, 44, 76);
    cycle++;

    // Animation over, toggle handlers on
    if (current > 0 && cycle > 8) {
      eraseQ = [];
      return toggleHandlers();
    }

    // Select second card
    if (cycle > 8) {
      cycle = 5;
      current++;
      curId = id2;
      curCard = card2;
    }

    requestAnimationFrame(animate);
  }

  fx("nomatch");
  requestAnimationFrame(animate);
}

// Checks if the two selected cards match
function checkMatch() {
  if (clicked[0].value !== clicked[1].value) {
    // No match, update state and animate cards
    eraseQ.push(clicked[0], clicked[1]);
    animationOver = false;
    setTimeout(function() {
      paintBack(eraseQ[0].pos, eraseQ[0].value, eraseQ[1].pos, eraseQ[1].value);
    }, 800);
  }
  else {
    // Match, update state and play sound effect
    matched.push(clicked[0].pos, clicked[1].pos);
    const matchedCard = clicked[0].value;
    setTimeout(function() {
      fx("match", matchedCard);
    }, 400);
  }

  // Reset clicked and check if game is over
  clicked = [];
  if (matched.length === 18) {
    animationOver = false;
    setTimeout(nextGame, 2000);
  }
}

// Paints a card in the canvas with specified id
function paint(id, card) {
  let lastTime = null;
  let cycle = 0;

  function animate(time) {

    // Make sure 80ms have passed to paint next frame
    if (time - lastTime < 80)
      return requestAnimationFrame(animate);

    // Update animation variables and select correct card rect from sprite map
    lastTime = time;
    const offsetX = 22 * cycle;
    const offsetY = 38 * cards.indexOf(card);
    const cx = document.getElementById(id).getContext("2d");
    cx.imageSmoothingEnabled = false;
    cx.drawImage(cardSprites, offsetX, offsetY, 22, 38, 0, 0, 44, 76);
    cycle++;

    // Card paint animation complete (animation may not be over)
    if (cycle > 4) {
      if (animationOver)
        setTimeout(toggleHandlers, 50);
      return;
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

// Picks selected card
function pickCard() {

  // Make sure card is not selected and not matched
  if (clicked.length !== 0)
    if (clicked[0].pos === selectorOver)
      return;

  if (matched.indexOf(selectorOver) !== -1)
    return;

  // Get picked card information
  const id = selectorOver;
  const cardPos = document.getElementById(id);
  const card = cardPos.getAttribute("data-cardName");
  clicked.push({pos: id, value: card});

  // Disable input and trigger animation
  toggleHandlers();
  fx("pick");
  paint(id, card);

  // Check match if it's the second card picked
  if (clicked.length === 2)
    checkMatch();
}

// Keyboard support variables
const keys = [37, 38, 39, 40, 13];
const tracking = [17, 12, 1, 6];
let keyHold = false;
let lastKey = null;
let timerOn = false;
let timerId = null;

// Key down event handler
function keyDown(event) {
  const key = keys.indexOf(event.keyCode);

  // Return if key is not an arrow or enter
  if (key === -1)
    return;

  // Prevent page scrolling
  event.preventDefault();

  // Enter key
  if (key === 4)
    return pickCard();

  // Prevent hold behaviour after previous key stroke
  if (key !== lastKey) {
    lastKey = key;
    keyHold = true;
    return updateSelector((selectorOver + tracking[key]) % 18);
  }

  // Cap movement from key hold
  if (keyHold) {
    if (timerOn)
      return;
    timerOn = true;
    return timerId = setTimeout(function() {
      timerOn = false;
      updateSelector((selectorOver + tracking[key]) % 18);
    }, 130);
  }

  lastKey = key;
  keyHold = true;
  updateSelector((selectorOver + tracking[key]) % 18);
}

// Key up event handler
function keyUp(event) {
  const key = keys.indexOf(event.keyCode);
  if (key === -1 || key === 4)
    return;

  // Clean key hold and timer
  keyHold = false;
  timerOn = false;
  clearTimeout(timerId);
}

// Mouse click event handler
function mouseClick(event) {
  const id = event.target.id;

  // Check if click was made on the background
  if (id === "background")
    return;

  // Update selector if it wasn't over the clicked card 
  // (mixed controls behaviour bug)
  if (mouseOver !== selectorOver)
    updateSelector(mouseOver);

  pickCard();
}

// Touch event handler
function touchControls(event) {
  event.preventDefault();
  let id = event.target.id;

  // Check if touch was made on the background
  if (id === "background")
    return;

  // Update id if touch was made on the selector
  if (id === "selector")
    id = selectorOver;

  updateSelector(Number(id), true);
  pickCard();
}

// Animates game intro
function intro() {
  let lastTime = null;
  let cycle = 0;

  function animate(time) {

    // Make sure 80ms have passed to paint next frame
    if (time - lastTime < 80)
      return requestAnimationFrame(animate);

    // Update animation variables and select correct background rect from sprite map
    lastTime = time;
    const offsetX = 256 * cycle;
    const cx = document.getElementById("background").getContext("2d");
    cx.imageSmoothingEnabled = false;
    cx.drawImage(backgroundSprites, offsetX, 0, 256, 168, 0, 0, 512, 336);
    cycle++;
  
    // Animation over, display selector
    if (cycle > 3) {
      const selector = document.getElementById("selector");
      selector.style.display = "block";
      return;
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

// Returns a random level for the game
function randomLevel() {
  const index = Math.floor(Math.random() * 8);
  return levels[index];
}

// Starts the game
// level: array
function playGame(level) {

  // Assign level cards
  level.forEach(function(card, i) {
    const cardPos = document.getElementById(i);
    cardPos.setAttribute("data-cardName", card);
  });

  // Trigger intro animation
  intro();
  toggleHandlers();
}

// Starts a new game
function nextGame() {
  // Hide selector
  const selector = document.getElementById("selector");
  selector.style.display = "none";

  // Restart cards and start new match
  eraseQ = eraseQ.concat(matched);
  eraseAll();
  matched = [];
  playGame(randomLevel());
}

// Initializes the game
function startGame() {
  fx("start");
  removeEventListener("keydown", startGame);
  div.removeEventListener("click", startGame);

  // Display the board and add listeners
  setTimeout(function() {
    const startscreen = document.getElementById("startscreen");
    startscreen.style.display = "none"; 
    toggleBGM();

    addEventListener("keydown", keyDown);
    addEventListener("keyup", keyUp);
    div.addEventListener("click", mouseClick);
    div.addEventListener("touchend", touchControls);

    const buttons = document.querySelectorAll("button");
    buttons[0].style.display = "block";
    buttons[1].style.display = "block";
    playGame(randomLevel());
  }, 1000);
}

div.addEventListener("click", startGame);
addEventListener("keydown", startGame);