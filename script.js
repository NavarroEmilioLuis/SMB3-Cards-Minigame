var div = document.querySelector("div");
var clicked = [];
var cards = ["shroom", "flower", "star", "10coins", "20coins", "1up"];
var matched = [];
var eraseQ = [];
var handlers = false;
var animationOver = false;
var playbgm = false;
var playfx = true;
var moveindex = 1;

var move = {0: new Audio(), 1: new Audio(), 2: new Audio()}
move[0].src ="Audio/move.wav";
move[1].src ="Audio/move.wav";
move[2].src ="Audio/move.wav";

var cardSprites = new Image();
cardSprites.src = "Sprites/Cards Animation.png";

var background = new Image();
background.addEventListener("load", function() {
  var backgroundCx = document.getElementById("background").getContext("2d");
  backgroundCx.imageSmoothingEnabled = false;
  backgroundCx.drawImage(background, 0, 0, 256, 168, 0, 0, 512, 336);
});
background.src = "Sprites/Background.png";

var selector = new Image();
background.addEventListener("load", function() {
  var selectorCx = document.getElementById("selector").getContext("2d");
  selectorCx.imageSmoothingEnabled = false;
  selectorCx.drawImage(selector, 0, 0, 56, 88);
});
selector.src = "Sprites/Selector.png";

var scriptlevels = document.createElement("script");
scriptlevels.src = "levels.js";
document.head.appendChild(scriptlevels);

function updateSelector(id, touch) {
  if (!touch)
    fx("move");
  selectorOver = id;
  var current = document.getElementById(id);
  var x = current.style.left.match(/\d+/) - 6;
  var y = current.style.top.match(/\d+/) - 6;
  var selector = document.getElementById("selector");
  selector.style.top = y + "px";
  selector.style.left = x + "px";
}

var selectorOver = 0;
var mouseOver = 0;
var mouseMoved = false;
var hover = null;

function elt(x, y, n) {
  var canvas = document.createElement("canvas");
  canvas.width = 44;
  canvas.height = 76;
  canvas.id = n;
  canvas.classList.add("card");
  canvas.style.top = y + "px";
  canvas.style.left = x + "px";
  canvas.addEventListener("mouseenter", function(event) {
    var current = event.target;
    if (!handlers) {
      mouseOver = Number(current.id);
      if (!mouseMoved)
        mouseMoved = true;
      return ;
    }
    if (hover === current)
      return ;
    updateSelector(Number(current.id));
    mouseOver = Number(current.id);
    hover = current;
  });
  div.appendChild(canvas);
};

for (var y = 0; y < 3; y++)
  for (var x = 0; x < 6; x++)
    elt(x * 64 + 58, y * 96 + 60, x + y * 6);

function eraseAll() {
  for (var i = 0; i < eraseQ.length; i++) {
    var cx = document.getElementById(eraseQ[i]).getContext("2d");
    cx.clearRect(0, 0, 44, 76);
  }
  eraseQ = [];
}

function fxmove() {
  var i = moveindex % 3;
  move[i].play();
  moveindex++
}

function fx(action, card) {
  if (!playfx)
    return;
  var sound = "fx";
  if (action === "move")
    return fxmove();
  else if (card === "1up")
    sound += card;
  else if (card === "10coins" || card === "20coins")
    sound += "coin";
  else
    sound += action;
  var fx = document.getElementById(sound);
  fx.play();
}

function toggleBGM() {
  var bgm = document.getElementById("bgm");
  if (!playbgm) {
    playbgm = true;
    return bgm.play();
  }
  bgm.pause();
  playbgm = false;
}

function toggleFx() {
  if (playfx)
    return playfx = false;
  playfx = true;
}

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
  if (mouseMoved && mouseOver !== selectorOver) {
    updateSelector(mouseOver);
    hover = document.getElementById(mouseOver);
    mouseMoved = false;
  }
}

function paintBack(id, card, id2, card2) {
  var lastTime = null;
  var cycle = 5;
  var current = 0;
  var curId = id;
  var curCard = card;
  function animate(time) {
    if (time - lastTime < 80)
      return requestAnimationFrame(animate);
    lastTime = time;
    var offsetX = 22 * cycle;
    var offsetY = 38 * cards.indexOf(curCard);
    var cx = document.getElementById(curId).getContext("2d");
    cx.imageSmoothingEnabled = false;
    cx.drawImage(cardSprites, offsetX, offsetY, 22, 38, 0, 0, 44, 76);
    cycle++;
    if (current > 0 && cycle > 8) {
      eraseQ = [];
      return toggleHandlers();
    }
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

function checkMatch() {
  if (clicked[0].value !== clicked[1].value) {
    eraseQ.push(clicked[0], clicked[1]);
    animationOver = false;
    setTimeout(function() {
      paintBack(eraseQ[0].pos, eraseQ[0].value, eraseQ[1].pos, eraseQ[1].value);
    }, 800);
  }
  else {
    matched.push(clicked[0].pos, clicked[1].pos);
    var matchedCard = clicked[0].value;
    setTimeout(function() {
      fx("match", matchedCard);
    }, 400);
  }
  clicked = [];
  if (matched.length === 18) {
    animationOver = false;
    setTimeout(nextGame, 2000);
  }
}

function paint(id, card) {
  var lastTime = null;
  var cycle = 0;
  function animate(time) {
    if (time - lastTime < 80)
      return requestAnimationFrame(animate);
    lastTime = time;
    var offsetX = 22 * cycle;
    var offsetY = 38 * cards.indexOf(card);
    var cx = document.getElementById(id).getContext("2d");
    cx.imageSmoothingEnabled = false;
    cx.drawImage(cardSprites, offsetX, offsetY, 22, 38, 0, 0, 44, 76);
    cycle++;
    if (cycle > 4) {
      if (animationOver)
        setTimeout(toggleHandlers, 50);
      return ;
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function pickCard() {
  if (clicked.length >= 1)
    if (clicked[0].pos === selectorOver)
      return ;
  if (matched.indexOf(selectorOver) !== -1)
    return ;
  toggleHandlers();
  fx("pick");
  var id = selectorOver;
  var cardPos = document.getElementById(id);
  var card = cardPos.getAttribute("data-cardName");
  if (clicked.length !== 0)
    if (clicked[0].pos === id)
      return ;
  clicked.push({pos: id, value: card});
  paint(id, card);
  if (clicked.length >= 2)
    checkMatch();
}

var keys = [37, 38, 39, 40, 13];
var tracking = [17, 12, 1, 6];
var keyHold = false;
var lastKey = null;
var timerOn = false;
var timerId = null;

function keyDown() {
  var key = keys.indexOf(event.keyCode);
  if (key === -1)
    return ;
  event.preventDefault();
  if (key === 4)
    return pickCard();
  if (key !== lastKey) {
    lastKey = key;
    keyHold = true;
    return updateSelector((selectorOver + tracking[key]) % 18);
  }
  if (keyHold) {
    if (timerOn)
      return ;
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

function keyUp() {
  var key = keys.indexOf(event.keyCode);
  if (key === -1 || key === 4)
    return ;
  keyHold = false;
  timerOn = false;
  clearTimeout(timerId);
}

function mouseClick() {
  var id = event.target.id;
  if (id === "background")
    return ;
  if (mouseOver !== selectorOver)
    updateSelector(mouseOver);
  pickCard();
}

function touchControls() {
  event.preventDefault();
  var id = event.target.id;
  if (id === "background")
    return ;
  if (id === "selector")
    id = selectorOver;
  updateSelector(Number(id), true);
  pickCard();
}

function intro() {
 var lastTime = null;
  var cycle = 0;
  function animate(time) {
    if (time - lastTime < 80)
      return requestAnimationFrame(animate);
    lastTime = time;
    var offsetX = 256 * cycle;
    var cx = document.getElementById("background").getContext("2d");
    cx.imageSmoothingEnabled = false;
    cx.drawImage(background, offsetX, 0, 256, 168, 0, 0, 512, 336);
    cycle++;
    if (cycle > 3) {
      var selector = document.getElementById("selector");
      selector.style.display = "block";
      return ;
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function randomLevel() {
  var index = Math.floor(Math.random() * 8);
  return levels[index];
}

function playGame(level) {
  level.forEach(function(card, i) {
    var cardPos = document.getElementById(i);
    cardPos.setAttribute("data-cardName", card);
  });
  intro();
  toggleHandlers();
}

function nextGame() {
  var selector = document.getElementById("selector");
  selector.style.display = "none";
  eraseQ = eraseQ.concat(matched);
  eraseAll();
  matched = [];
  playGame(randomLevel());
}

function startGame() {
  fx("start");
  removeEventListener("keydown", startGame);
  div.removeEventListener("click", startGame);
  setTimeout(function() {
    var startscreen = document.getElementById("startscreen");
    startscreen.style.display = "none"; 
    toggleBGM();
    addEventListener("keydown", keyDown);
    addEventListener("keyup", keyUp);
    div.addEventListener("click", mouseClick);
    div.addEventListener("touchend", touchControls);
    var buttons = document.querySelectorAll("button");
    buttons[0].style.display = "block";
    buttons[1].style.display = "block";
    playGame(randomLevel());
  }, 1000);
}

div.addEventListener("click", startGame);
addEventListener("keydown", startGame);