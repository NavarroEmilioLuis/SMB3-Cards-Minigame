var div = document.querySelector("div");
var clicked = [];
var cards = ["shroom", "flower", "star", "10coins", "20coins", "1up"];
var matched = [];
var eraseQ = [];
var selectorOver = 0;
var hover = null;
var handlers = false;
var animationOver = false;

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
    if (!animationOver)
      return ;
    if (hover === current)
      return ;
    selectorOver = Number(current.id);
    var x = current.style.left.match(/\d+/) - 6;
    var y = current.style.top.match(/\d+/) - 6;
    var selector = document.getElementById("selector");
    selector.style.top = y + "px";
    selector.style.left = x + "px";
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

function toggleHandlers() {
  if (handlers) {
    removeEventListener("keydown", keyboardControls);
    div.removeEventListener("click", pickCard);
    return handlers = false;
  }
  addEventListener("keydown", keyboardControls);
  div.addEventListener("click", pickCard);
  handlers = true;
  animationOver = true;
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
  requestAnimationFrame(animate);
}

function checkMatch() {
  if (clicked[0].value !== clicked[1].value) {
    eraseQ.push(clicked[0], clicked[1]);
    animationOver = false;
    setTimeout(function() {
      paintBack(eraseQ[0].pos, eraseQ[0].value, eraseQ[1].pos, eraseQ[1].value);
    }, 1000);
  }
  else
    matched.push(clicked[0].pos, clicked[1].pos);
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
  var id = event.target.id;
  if (id === "background")
    return ;
  if (clicked.length >= 1)
    if (clicked[0].pos === selectorOver)
      return ;
  if (matched.indexOf(selectorOver) !== -1)
    return ;
  toggleHandlers();
  id = selectorOver;
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

div.addEventListener("click", pickCard);

var keys = [37, 38, 39, 40, 13];
var tracking = [17, 12, 1, 6]; 

function keyboardControls() {
  var key = keys.indexOf(event.keyCode);
  if (key === -1)
    return;
  event.preventDefault();
  if (key === 4)
    return pickCard();
  selectorOver = (selectorOver + tracking[key]) % 18;
  var current = document.getElementById(String(selectorOver));
  var x = current.style.left.match(/\d+/) - 6;
  var y = current.style.top.match(/\d+/) - 6;
  var selector = document.getElementById("selector");
  selector.style.top = y + "px";
  selector.style.left = x + "px";
}

addEventListener("keydown", keyboardControls);

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
      return ;
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function randomLevel() {
  var output = Math.floor(Math.random() * 9);
  return levels[output];
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
  eraseQ = eraseQ.concat(matched);
  eraseAll();
  matched = [];
  playGame(randomLevel());
}

window.addEventListener("load", function() {
  playGame(randomLevel());
});
