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
function loadBottomDiv() {
  loadCurrentColorPicker();

  fileNameInput = select("#i-file-name");
  let downloadButton = select("#b-save");
  downloadButton.mousePressed(savePattern);
  
  let loadDiv = select(".load-container")
  uploadInput = createFileInput(loadPattern);
  uploadInput.id("i-load");
  uploadInput.parent(loadDiv);
  let uploadButton = createButton("Load Pattern")
  uploadButton.id("b-load")
  uploadButton.parent(loadDiv);
  uploadButton.attribute("title", "upload pattern file");
  uploadButton.attribute("onclick", "document.getElementById('i-load').click();")

  undoButton = select("#b-undo");
  redoButton = select("#b-redo");
  undoButton.mousePressed(doUndo);
  redoButton.mousePressed(doRedo);
}

function loadPlusMinusDiv() {
  let wButtonMinus = select(".width-buttons>.b-minus");
  let wButtonPlus = select(".width-buttons>.b-plus");
  let hButtonMinus = select(".height-buttons>.b-minus");
  let hButtonPlus = select(".height-buttons>.b-plus");
  wButtonMinus.mousePressed(() => changeWidth(-1));
  wButtonPlus.mousePressed(() => changeWidth(1));
  hButtonMinus.mousePressed(() => changeHeight(-1));
  hButtonPlus.mousePressed(() => changeHeight(1));
}

function loadToolbarDiv() {
  let rotateButton = select("#b-rotate");
  let expandButton = select("#b-expand");
  let contractButton = select("#b-contract");
  let fillButton = select("#b-fill");
  let reflectWButton = select("#b-flip-horizontal");
  let reflectHButton = select("#b-flip-vertical");
  let subdivideButton = select("#b-subdivide");
  rotateButton.mousePressed(patternRotate);
  expandButton.mousePressed(patternExpand);
  contractButton.mousePressed(patternContract);
  reflectWButton.mousePressed(patternFlipW);
  reflectHButton.mousePressed(patternFlipH);
  fillButton.mousePressed(patternFill);
  subdivideButton.mousePressed(patternSubdivide);
}

function loadDOM() {
  loadToolbarDiv();

  loadPlusMinusDiv();

  loadBottomDiv();
}


// Pattern Handling Functions ------------------------------------------

function setPattern(pattern_a, colors_o, layout_a) {
  if (colors_o) {
    loadColorsDiv(colors_o);
    currentColors = deepCopy(colorScheme); // for history system

    let colors = Object.keys(colorScheme);
    currentColor = currentColor || colors[1] || colors[0];
  }

  pattern_array = pattern_a;

  patternH = pattern_array.length;
  patternW = pattern_array[0].length;
  patternSizeX = squareScale * patternW;
  patternSizeY = squareScale * patternH;

  root.style.setProperty("--block-width", patternW);
  resetCanvas();

  patternSizeX = patternW * squareScale;
  patternSizeY = patternH * squareScale;

  if (pattern_g) pattern_g.remove();
  pattern_g = createGraphics(patternSizeX, patternSizeY);

  if (layout_a) {
    layout_array = layout_a;
    
    loadLayout();
  }
}

function loadPattern(file) {
  let pattern_a = file.data.pattern.split("\n").map((x) => x.split(" "));
  let layout_a;
  if (file.data.layout) layout_a = file.data.layout;
  let colors_o = file.data.colorScheme;

  let previousPattern = deepCopy([pattern_array, colorScheme, layout_array]);
  let currentPattern = deepCopy([pattern_a, colors_o, layout_a]);

  setPattern(pattern_a, colors_o, layout_a);

  if (fileNameInput) {
    //reset the upload button
    let fileName = uploadInput
      .value()
      .slice(uploadInput.value().lastIndexOf("\\") + 1,
             uploadInput.value().indexOf(".json"));
    fileNameInput.value(fileName);
    uploadInput.value("");
  }

  // log in history
  if (previousPattern[0]) {
    logAction(
      () => setPattern(...previousPattern),
      () => setPattern(...currentPattern)
    );
  }
}

function savePattern() {
  let contents = {};

  contents.colorScheme = colorScheme;
  contents.pattern = pattern_array.map((x) => x.join(" ")).join("\n");
  contents.layout = layout_array;

  let name = fileNameInput.value();
  if (name.trim().length == 0) name = "quilt_pattern";

  save(contents, name + ".json")
}

function resetCanvas() {
  resizeCanvas(patternSizeX * W, patternSizeY * H);
}

function loadColorsDiv(colors_o) {
  pickerPosition = 0;

  if (colorsDiv) {
    colorsDiv.remove();
    colorsDiv = createElement("ul");
    colorsDiv.class("colors-container");
    colorsDiv.parent(select(".display-one"));
  }
  colorsDiv = select(".colors-container");

  if (colors_o) {
    colorScheme = colors_o;
    /*
    Object.keys(colorScheme).map(function(i) {
      let newColor = color(...colorScheme[i].levels)
      colorScheme[i] = newColor
    })
    */
  }

  let colors = Object.keys(colorScheme);
  for (var i in colors) {
    colorScheme[colors[i]] = color(colorScheme[colors[i]].levels);
    if (colors[i] === "_") continue;
    newPicker(colorScheme[colors[i]], colors[i], pickerPosition);
    pickerPosition++;
  }
}
function newPicker(color, id, order) {
  let pickerDiv = createDiv();
  pickerDiv.parent(colorsDiv);
  pickerDiv.class("color-picker-container");
  pickerDiv.style("order", order);

  let picker = createColorPicker(color);
  picker.class("color-picker");
  picker.id(id);
  picker.parent(pickerDiv);
  picker.input(updateColor);
  picker.elt.addEventListener("change", logColorChange, false);
  picker.doubleClicked(setCurrentColor);
  picker.attribute("title", "color");

  let deleteButton = createButton("×");
  deleteButton.parent(pickerDiv);
  deleteButton.mousePressed(() => deleteColor(id));
  deleteButton.attribute("title", "delete color");
}

function loadCurrentColorPicker() {
  if (currentColorPicker) currentColorPicker.remove();
  currentColorPicker = createColorPicker(colorScheme[currentColor]);
  currentColorPicker.parent(select(".current-color-container"));
  currentColorPicker.class(currentColor);
  currentColorPicker.id("current-color-picker");
  currentColorPicker.attribute("title", "current active color");
  currentColorPicker.elt.addEventListener("change", currentColorChange, false);
}

function deleteColor(id) {
  let previousColorString = colorString(colorScheme[id]);

  delete colorScheme[id];
  let thisPicker = select("#" + id).parent();
  let order = new p5.Element(thisPicker).style("order");
  thisPicker.remove();

  let previousPattern = deepCopy(pattern_array);
  for (var i in pattern_array) {
    for (var j in pattern_array) {
      pattern_array[i][j] = pattern_array[i][j].replace(id, "_");
    }
  }
  let currentPattern = deepCopy(pattern_array);

  logAction(
    function () {
      newPicker(colorParse(previousColorString), id, order);
      colorScheme[id] = colorParse(previousColorString);

      setPattern(previousPattern);
      currentColors = deepCopy(colorScheme);
    },
    function () {
      delete colorScheme[id];
      select("#" + id)
        .parent()
        .remove();

      setPattern(currentPattern);
      currentColors = deepCopy(colorScheme);
    }
  );
  currentColors = deepCopy(colorScheme);
}

function newColor(color) {
  let colors = Object.keys(colorScheme);
  for (var i in colors) {
    if (colorScheme[colors[i]].toString() === color.toString()) {
      return colors[i];
    }
  }

  let id = newColorId();
  newPicker(color, id, pickerPosition);
  let order = pickerPosition;
  pickerPosition++;

  colorScheme[id] = color;

  // history system
  logAction(
    function () {
      delete colorScheme[id];
      select("#" + id)
        .parent()
        .remove();
      currentColors = deepCopy(colorScheme);
    },
    function () {
      newPicker(color, id, order);
      colorScheme[id] = color;
      currentColors = deepCopy(colorScheme);
    }
  );
  currentColors = deepCopy(colorScheme);

  currentColorPicker.elt.removeEventListener("change", currentColorChange);
  let tempCallback = function () {
    currentColorPicker.elt.removeEventListener("change", tempCallback);
    currentColorPicker.elt.addEventListener("change", currentColorChange);
  };
  currentColorPicker.elt.addEventListener("change", tempCallback, false);

  currentColor = id;
  currentColorPicker.class(id);
  return id;
}

function newColorId() {
  let colors = Object.keys(colorScheme);

  for (var i in alphabet) {
    if (!colors.includes(alphabet[i]) && alphabet[i] != currentColor)
      return alphabet[i];
  }
  return "-";
}

function updateColor() {
  colorScheme[this.id()] = this.color();

  if (currentColorPicker.class() == this.id()) {
    loadCurrentColorPicker();
  }
}

function currentColorChange() {
  currentColor = "!";
  currentColorPicker.class(currentColor);
}

function setCurrentColor() {
  currentColor = this.id();

  loadCurrentColorPicker();
}

function checkForNewColor() {
  if (
    !colorScheme[currentColor] ||
    currentColorPicker.color().toString() !==
      colorScheme[currentColor].toString()
  ) {
    currentColor = newColor(currentColorPicker.color());
  }
}


// Layout System Functions -----------------------------------------

function loadLayout() {
  if (layoutDiv) {
    layoutDiv.remove();
    layoutDiv = createSpan();
    layoutDiv.class("layout-container");
    layoutDiv.parent(select(".display-two"));
  } else {
    layoutDiv = select(".layout-container");
  }

  let transforms = Object.keys(LayoutTransforms);

  for (var i = 0; i < layout_array.length; i++) {
    let row = createDiv();
    row.parent(layoutDiv);
    row.class("layout-row");

    for (var j = 0; j < layout_array[0].length; j++) {
      let button = createButton(
        loadFile("Icons/" + transforms[layout_array[i][j]] + ".svg")
      );
      button.parent(row);
      button.class("layout-button");

      if (i == 0 && j == 0) {
        button.id("template");
        button.attribute("title", "template");
      } else {
        let n = i;
        let m = j;
        button.mousePressed(() => next(n, m));
      }

      switch (layout_array[i][j]) {
        case 0:
          if (i != 0 || j != 0) button.attribute("title", "none");
          break;
        case 1:
          button.attribute("title", "rotate 90°");
          break;
        case 2:
          button.attribute("title", "rotate 180°");
          break;
        case 3:
          button.attribute("title", "rotate 270°");
          break;
        case 4:
          button.attribute("title", "flip horizontal");
          break;
        case 5:
          button.attribute("title", "flip vertical");
          break;
        case 6:
          button.attribute("title", "flip diagonal northwest");
          break;
        case 7:
          button.attribute("title", "flip diagonal northeast");
          break;
      }

      let svg = new p5.Element(button.child()[0]);
      let displayScale = parseInt(
        new p5.Element(root).style("--display-scale").split("px")[0]
      );
      if (layout_array[i][j] == 0) {
        svg.style("width", displayScale * 0.8 + "px");
        svg.style("height", displayScale * 0.8 + "px");
      } else if (layout_array[i][j] <= 3) {
        svg.style("width", displayScale * 1.6 + "px");
        svg.style("height", displayScale * 1.6 + "px");
      } else if (layout_array[i][j] <= 5) {
        svg.style("width", displayScale * 1.2 + "px");
        svg.style("height", displayScale * 1.2 + "px");
      } else {
        svg.style("width", displayScale * 1.1 + "px");
        svg.style("height", displayScale * 1.1 + "px");
      }
    }
    if (i == 0) {
      let wButtonDiv = createDiv();
      wButtonDiv.parent(row);
      wButtonDiv.class("layout-wh-container width");
      createPlusMinusButton(true, wButtonDiv, -1);
      createPlusMinusButton(true, wButtonDiv, 1);
    }
  }

  let hButtonDiv = createDiv();
  hButtonDiv.parent(layoutDiv);
  hButtonDiv.class("layout-wh-container height");
  createPlusMinusButton(false, hButtonDiv, -1);
  createPlusMinusButton(false, hButtonDiv, 1);
}
