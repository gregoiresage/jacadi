import document from "document";
import { vibration } from "haptics";
import { display } from "display";

import * as prefs from "../common/shared_preferences";
prefs.preferences.record = prefs.preferences.record || 0;

display.autoOff = false;
display.on      = true;

let lights       = document.getElementsByClassName("light");

let score        = document.getElementById("score");
let scoreLbl     = score.getElementById("label");

let highscore    = document.getElementById("highscore");
let highscoreLbl = highscore.getElementById("label");

let sequence      = [];
let sequenceIndex = 0;
let animating     = false;

let highscorebreaking = false;
let errorCount    = 7;

function animate(index) {
  lights[index].animate("enable");
}

function playError() {
  if(errorCount === 0) {
    setTimeout(() => start(), 500);
  }
  else {
    errorCount--;
    animate(sequence[sequenceIndex]);
    setTimeout(() => playError(), 200);
  }
}

function playSequence() {
  if(sequenceIndex === sequence.length) {
    sequenceIndex = 0;
    animating = false;
  }
  else {
    animating = true;
    vibration.start("bump");
    animate(sequence[sequenceIndex]);
    sequenceIndex++;
    setTimeout(() => playSequence(), 300);
  }
}

function nextLevel() {
  // new random value
  sequence.push(Math.floor(Math.random() * 4));
  
  scoreLbl.text = sequence.length - 1;
  
  if(prefs.preferences.record == sequence.length - 1) {
    // Trigger labels animation
    highscorebreaking = true;
    score.animate("enable");
    highscore.animate("enable");
  }
  else if(highscorebreaking) {
    prefs.preferences.record = sequence.length - 1;
  }
  
  sequenceIndex = 0;
  playSequence();
}

function start() {
  // reset labels position and opacity
  score.y = 0;
  highscore.style.opacity = 1;
  highscorebreaking = false;
  
  highscoreLbl.text = prefs.preferences.record;
  
  sequence = [];
  nextLevel();
}

document.getElementsByClassName("btn").forEach(function(item, i) {
  item.onclick = function(e) {
    if(!animating) {
      animate(i);
      if(sequence[sequenceIndex] !== i) {
        //error
        animating = true;
        vibration.start("nudge");
        errorCount = 7;
        setTimeout(() => playError(), 200);
      }
      else if(sequenceIndex === sequence.length - 1) {
        //level completed
        animating = true;
        vibration.start("confirmation");
        setTimeout(() => nextLevel(), 500);
      }
      else {
        //everything's ok so far
        vibration.start("bump");
        sequenceIndex ++;
      }
    }
  }
});

start();