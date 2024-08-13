function printQuilt(graphic, w, h) {
  let scaleX = 1;
  let scaleY = 1;
  let rotateD = 0;
  let layoutX = 0;
  let layoutY = 0;
  let n;
  let m;

  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      scaleX = 1;
      scaleY = 1;
      rotateD = 0;

      // depending on the transform on the current layout tile, change the multiplier
      switch (layout_array[layoutY][layoutX]) {
        case 0:
          n = i;
          m = j;
          break;

        case 1:
          n = -j - 1;
          m = i;
          rotateD = 90;
          break;

        case 2:
          m = -j - 1;
          n = -i - 1;
          rotateD = 180;
          break;

        case 3:
          m = -i - 1;
          n = j;
          rotateD = 270;
          break;

        case 4:
          n = i;
          m = j + 1;
          scaleX = -1;
          break;

        case 5:
          n = i + 1;
          m = j;
          scaleY = -1;
          break;

        case 6:
          n = -j - 1;
          m = i + 1;
          scaleX = -1;
          rotateD = 90;
          break;

        case 7:
          m = -i;
          n = j;
          scaleX = -1;
          rotateD = 270;
          break;
      }

      cursorY = patternSizeY * n;
      cursorX = patternSizeX * m;

      push();
      rotate(rotateD);
      scale(scaleX, scaleY);
      image(graphic, cursorX * scaleX, cursorY * scaleY);
      pop();

      // next layout
      layoutX = (layoutX + 1) % layout_array[layoutY].length;
    }

    //next layout
    layoutY = (layoutY + 1) % layout_array.length;
    layoutX = 0;
  }
}

/*
Return the quarter tile within a pattern block that the mouse is currently hovering over
*/
function currentTileDouble() {
  let tile2X;
  let tile2Y;

  let patternX = mouseX % patternSizeX;
  let patternY = mouseY % patternSizeY;

  let layoutY = Math.floor(mouseY / patternSizeY) % layout_array.length;
  let layoutX =
    Math.floor(mouseX / patternSizeX) % layout_array[layoutY].length;
  let currentLayout = layout_array[layoutY][layoutX];

  let temp;
  switch (currentLayout) {
    case 1:
      temp = patternX;
      patternX = patternY;
      patternY = patternSizeX - temp;
      break;

    case 2:
      patternX = patternSizeX - patternX;
      patternY = patternSizeY - patternY;
      break;

    case 3:
      temp = patternX;
      patternX = patternSizeY - patternY;
      patternY = temp;
      break;

    case 4:
      patternX = patternSizeX - patternX;
      break;

    case 5:
      patternY = patternSizeY - patternY;
      break;

    case 6:
      temp = patternX;
      patternX = patternSizeY - patternY;
      patternY = patternSizeX - temp;
      break;

    case 7:
      temp = patternX;
      patternX = patternY;
      patternY = temp;
      break;
  }

  tile2X = Math.floor((patternX / squareScale) * 2);
  tile2Y = Math.floor((patternY / squareScale) * 2);
  if (tile2X >= patternW * 2) tile2X -= 1;
  if (tile2Y >= patternH * 2) tile2Y -= 1;

  return [tile2X, tile2Y];
}

function drawTriCursor(tileDouble, buffer) {
  buffer.stroke(0, 0, 0, 200);
  buffer.strokeWeight(squareScale / 6);
  buffer.noFill();

  let tileX = Math.floor(tileDouble[0] / 2);
  let tileY = Math.floor(tileDouble[1] / 2);
  let rX = tileDouble[0] % 2;
  let rY = tileDouble[1] % 2;
  let midpointX = (tileX + 0.5) * squareScale;
  let midpointY = (tileY + 0.5) * squareScale;
  let factor1 = squareScale / 30 + 15 / 3;
  let factor2 = squareScale / 60 + 4 / 3;

  buffer.triangle(
    (squareScale * (tileX + rX) * factor1 + midpointX) / (factor1 + 1),
    (squareScale * (tileY + rY) * factor1 + midpointY) / (factor1 + 1),
    (squareScale * (tileX + ((rX + 1) % 2)) * factor2 + midpointX) /
      (factor2 + 1),
    (squareScale * (tileY + rY) * factor1 + midpointY) / (factor1 + 1),
    (squareScale * (tileX + rX) * factor1 + midpointX) / (factor1 + 1),
    (squareScale * (tileY + ((rY + 1) % 2)) * factor2 + midpointY) /
      (factor2 + 1)
  );
  buffer.stroke(255, 255, 255, 200);
  buffer.strokeWeight(squareScale / 16);
  buffer.triangle(
    (squareScale * (tileX + rX) * factor1 + midpointX) / (factor1 + 1),
    (squareScale * (tileY + rY) * factor1 + midpointY) / (factor1 + 1),
    (squareScale * (tileX + ((rX + 1) % 2)) * factor2 + midpointX) /
      (factor2 + 1),
    (squareScale * (tileY + rY) * factor1 + midpointY) / (factor1 + 1),
    (squareScale * (tileX + rX) * factor1 + midpointX) / (factor1 + 1),
    (squareScale * (tileY + ((rY + 1) % 2)) * factor2 + midpointY) /
      (factor2 + 1)
  );
}

/*
Draw a triangle in the pattern block at the current mouse position
*/
function drawTriangle() {
  checkForNewColor();

  let tileDouble = currentTileDouble();
  let tileX = Math.floor(tileDouble[0] / 2);
  let tileY = Math.floor(tileDouble[1] / 2);
  let quadX = tileDouble[0] % 2;
  let quadY = tileDouble[1] % 2;

  let previousTile = pattern_array[tileY][tileX];
  let tileArray = previousTile.split("");

  //if half the tile is already the current color, just fill in the rest
  if (tileArray.includes(currentColor)) {
    tileArray = ["-", currentColor, "-"];
  } else {
    // alter the current tile's array based on which quadrant of the tile you are clicking on
    if (quadX == 0) {
      tileArray[0] = currentColor;

      // if the current tile is a solid color, set the opposite triangle to that color
      if (tileArray[2] === "-") {
        tileArray[2] = tileArray[1];
      }
    } else {
      tileArray[2] = currentColor;

      if (tileArray[0] === "-") {
        tileArray[0] = tileArray[1];
      }
    }

    // correct the slant of the triangles
    if ((quadX + quadY) % 2 == 0) {
      tileArray[1] = "/";
    } else {
      tileArray[1] = "\\";
    }

    // if both triangles are the same color, change to a single color square
    if (tileArray[0] === tileArray[2]) tileArray = ["-", tileArray[0], "-"];
  }

  let newTile = tileArray.join("");

  pattern_array[tileY][tileX] = newTile;
}

function drawInPattern() {
  patternBefore = JSON.stringify(pattern_array);

  drawTriangle();

  mouseTimer = 0.1;
}

function mouseReleased() {
  if (mouseTimer > 0) {
    let currentPattern = JSON.stringify(pattern_array);
    let previousPattern = patternBefore;

    mouseTimer = 0;

    if (previousPattern != currentPattern) {
      logAction(
        () => setPattern(JSON.parse(previousPattern)),
        () => setPattern(JSON.parse(currentPattern))
      );
    }
  }
}


// History system functions ---------------------------------------------------

/* 
When a colorpicker is changed, this function logs that change in the history stack.
It is called when a color-picker in the color scheme registers a "change" event
*/
function logColorChange(event) {
  if (currentColors) {
    let id = new p5.Element(event.target).id();
    let previousString = colorString(currentColors[id]);
    let currentString = colorString(colorScheme[id]);

    logAction(
      function () {
        setColor(colorParse(previousString), id);
        currentColors = deepCopy(colorScheme);
      },
      function () {
        setColor(colorParse(currentString), id);
        currentColors = deepCopy(colorScheme);
      }
    );
  }
  currentColors = deepCopy(colorScheme);
}

function doUndo() {
  if (history.length) {
    action = history.pop();
    action.undo();
    future.push(action);
  }
}

function doRedo() {
  if (future.length) {
    action = future.pop();
    action.redo();
    history.push(action);
  }
}

function logAction(undo_f, redo_f) {
  let action = { undo: undo_f, redo: redo_f };
  future.length = 0;
  history.push(action);
}

function setColor(value, key) {
  colorScheme[key] = value;
  loadColorsDiv();
}

function setLayoutTile(value, x, y) {
  layout_array[x][y] = value;
  loadLayout();
}

function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status == 200) {
    result = xmlhttp.responseText;
  }
  return result;
}
