import "./styles.css";

const app = document.getElementById("app");

app.innerHTML = `
<div id="outer" style="">
  <canvas id="canvas" width="600" height="600" style="border: solid black 0px;">
    Your browser does not support canvas elements.
  </canvas>
  <div id="bottombar">
    <button id="modebutton" title="Mode">Draw</button>
    <button id="backgroundbutton" title="Background type">No lines</button>
    <input id="size" title="Size" type="number" min="5" max="50" value="10" step="5" class="size">
    <input id="color" title="Color" type="color"></button>
  </div>
</div id="outer">
<canvas id="pattern" width="50" height="50" style="display: none; left: 50px;"></canvas>
<canvas id="clone" style="display: none;">If you can see this than you might have CSS disabled</canvas>
`;

var ongoingTouches = [];

var usepattern = false; //Use pattern? By default set to false
var mode = 0; //Current mode, modes are 1 - draw, 2 - erase, 3 - circle, 4 - line, 5 - rect
var startTouches = [];
/*var colorid = 0;
var colors = [
  "#000000",
  "#888888",
  "#ff0000",
  "#ff8800",
  "#ffff00",
  "#008800",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#8800ff",
  "#ff00ff",
  "#964b00"
];*/

var backgroundpattern = "";

function makepattern() {
  var el = document.getElementById("pattern");
  var ctx = el.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 50, 50);
  ctx.fillStyle = "white";
  ctx.fillRect(1, 1, 48, 48);
  backgroundpattern = ctx.createPattern(el, "repeat");
}

function clearCanvas() {
  var el = document.getElementById("canvas");
  var ctx = el.getContext("2d");
  if (usepattern) {
    ctx.fillStyle = backgroundpattern;
    ctx.fillRect(0, 0, el.width, el.height);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, el.width, el.height);
    ctx.stroke();
  }
}

function colorForTouch(touch) {
  let color;
  color = document.getElementById("color").value;
  return color;
}

function copyTouch({ identifier, pageX, pageY }) {
  return { identifier, pageX, pageY };
}

function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;

    if (id === idToFind) {
      return i;
    }
  }
  return -1; // not found
}

function handleStart(evt) {
  evt.preventDefault();
  var el = document.getElementById("canvas");
  if (el.width !== window.innerWidth || el.height !== window.innerHeight - 30) {
    el.width = window.innerWidth.toString();
    el.style.width = window.innerWidth;
    el.height = (window.innerHeight - 30).toString();
    el.style.height = window.innerHeight - 30;
    var clone = document.getElementById("clone");
    clone.width = window.innerWidth.toString();
    clone.style.width = window.innerWidth;
    clone.height = (window.innerHeight - 30).toString();
    clone.style.height = window.innerHeight - 30;
  }
  //var ctx = el.getContext("2d"); //Unused
  var touches = evt.changedTouches;

  if (mode === 2 || mode === 3 || mode === 4) {
    document.getElementById("clone").getContext("2d").drawImage(el, 0, 0);
  }

  for (var i = 0; i < touches.length; i++) {
    if (ongoingTouches.length <= 1) {
      ongoingTouches.push(copyTouch(touches[i]));
    }
    startTouches[i] = touches[i];
  }
}

function handleMove(evt) {
  evt.preventDefault();
  var el = document.getElementById("canvas");
  var ctx = el.getContext("2d");
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var color = colorForTouch(touches[i]);
    var idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ctx.beginPath();
      var widthvalue = document.getElementById("size").value;
      if (touches[i].force === 0) {
        ctx.lineWidth = widthvalue;
      } else {
        ctx.lineWidth = touches[i].force * widthvalue;
      }
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      if (mode === 0) {
        ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
        ctx.lineTo(touches[i].pageX, touches[i].pageY);
        ctx.stroke();
      } else if (mode === 1) {
        ctx.lineWidth = widthvalue * 2;
        if (usepattern) {
          ctx.strokeStyle = backgroundpattern;
        } else {
          ctx.strokeStyle = "#ffffff"; //Eraser is used
        }
        ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
        ctx.lineTo(touches[i].pageX, touches[i].pageY);
        ctx.stroke();
      } else if (mode === 2) {
        if (i === 0) {
          ctx.drawImage(document.getElementById("clone"), 0, 0);
          ctx.moveTo(startTouches[i].pageX, startTouches[i].pageY);
          ctx.lineTo(touches[i].pageX, touches[i].pageY);
          ctx.stroke();
        }
      } else if (mode === 3) {
        if (i === 0) {
          ctx.drawImage(document.getElementById("clone"), 0, 0);
          var radius = Math.sqrt(
            Math.pow(startTouches[i].pageX - touches[i].pageX, 2) +
              Math.pow(startTouches[i].pageY - touches[i].pageY, 2)
          );
          ctx.arc(
            startTouches[i].pageX,
            startTouches[i].pageY,
            radius,
            0,
            Math.PI * 2,
            true
          );
          ctx.stroke();
        }
      } else if (mode === 4) {
        if (i === 0) {
          ctx.drawImage(document.getElementById("clone"), 0, 0);
          ctx.moveTo(startTouches[i].pageX, startTouches[i].pageY);
          ctx.strokeRect(
            startTouches[i].pageX,
            startTouches[i].pageY,
            touches[i].pageX - startTouches[i].pageX,
            touches[i].pageY - startTouches[i].pageY
          );
          ctx.stroke();
        }
      }

      ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
    }
  }
}

function handleEnd(evt) {
  evt.preventDefault();
  var el = document.getElementById("canvas");
  var ctx = el.getContext("2d");
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var color = colorForTouch(touches[i]);
    var idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ctx.lineWidth = 4;
      ctx.fillStyle = color;
      ctx.beginPath();
      if (mode === 2) {
        var radius = Math.sqrt(
          Math.pow(startTouches[i].pageX - touches[i].pageX, 2) +
            Math.pow(startTouches[i].pageY - touches[i].pageY, 2)
        );
        ctx.arc(
          startTouches[i].pageX,
          startTouches[i].pageY,
          radius,
          0,
          Math.PI * 2,
          true
        );
        ctx.stroke();
      } else if (mode === 3) {
        ctx.drawImage(document.getElementById("clone"), 0, 0);
        ctx.moveTo(startTouches[i].pageX, startTouches[i].pageY);
        ctx.lineTo(touches[i].pageX, touches[i].pageY);
        ctx.stroke();
      } else if (mode === 4) {
        ctx.drawImage(document.getElementById("clone"), 0, 0);
        ctx.moveTo(startTouches[i].pageX, startTouches[i].pageY);
        ctx.strokeRect(
          startTouches[i].pageX,
          startTouches[i].pageY,
          touches[i].pageX - startTouches[i].pageX,
          touches[i].pageY - startTouches[i].pageY
        );
        ctx.stroke();
      }
      ongoingTouches.splice(idx, 1); // remove it; we're done
    }
  }
}

function handleCancel(evt) {
  evt.preventDefault();
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1); // remove it; we're done
  }
}

function startup() {
  var el = document.getElementById("canvas");
  if (el !== null && typeof el !== "undefined") {
    document.removeEventListener("mousemove", startup);
    document.removeEventListener("startTouches", startup, false);
    makepattern();
    if (
      el.width !== window.innerWidth ||
      el.height !== window.innerHeight - 30
    ) {
      el.width = window.innerWidth.toString();
      el.style.width = window.innerWidth;
      el.height = (window.innerHeight - 30).toString();
      el.style.height = window.innerHeight - 30;
      var clone = document.getElementById("clone");
      clone.width = window.innerWidth.toString();
      clone.style.width = window.innerWidth;
      clone.height = (window.innerHeight - 30).toString();
      clone.style.height = window.innerHeight - 30;
    }
    var ctx = el.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, el.width, el.height);
    ctx.stroke();

    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleCancel, false);
    el.addEventListener("touchmove", handleMove, false);
    //window.addEventListener("keydown", onkey, false); //Currently unused
    document.getElementById("modebutton").addEventListener("click", (evt) => {
      var self = this.getElementById("modebutton");
      if (mode === 0) {
        self.innerHTML = "Erase";
        mode = 1;
      } else if (mode === 1) {
        self.innerHTML = "Line";
        mode = 2;
      } else if (mode === 2) {
        self.innerHTML = "Circle";
        mode = 3;
      } else if (mode === 3) {
        self.innerHTML = "Rect";
        mode = 4;
      } else if (mode === 4) {
        self.innerHTML = "Draw";
        mode = 0;
      }
    });
    document
      .getElementById("backgroundbutton")
      .addEventListener("click", (evt) => {
        var self = this.getElementById("backgroundbutton");
        if (usepattern) {
          usepattern = false;
          self.innerHTML = "No lines";
        } else {
          usepattern = true;
          self.innerHTML = "Lines";
        }
        clearCanvas();
      });
  }
}

document.addEventListener("load", () => startup);

document.addEventListener("startTouches", startup, false);
document.addEventListener("mousemove", startup);
