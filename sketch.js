let rectangles = [];
let cnv;

let full;

let totalArea;
let coveredArea;

let isRecording = false;
let capturer;

const alpha = 75;

const colors = [
    [89, 75, 74, alpha],   // Dark Taupe
  // [83, 105, 103, alpha],  // Dark Sea Green
  [91, 129, 117, alpha],  // Cadet
  [92, 151, 130, alpha],  // Cadet Blue
  [94, 181, 145, alpha],  // Medium Aquamarine
  // [104, 206, 171, alpha], // Medium Aquamarine
  [113, 221, 183, alpha], // Celeste
  [176, 234, 215, alpha], // Powder Blue
  [206, 236, 226, alpha], // Pale Robin Egg Blue
  [222, 236, 230, alpha]  // Platinum
  // Add more custom colors as needed
];

let color1, color2;
let currentColor, nextColor;
let fadeSpeed = 0.007;


function setup() {
  cnv = createCanvas(screen.width, screen.height);
  generateRectangles();

  frameRate(60);
  
  full=false;
  
  totalArea=width*height;

  // Create a new CCapture instance
  capturer = new CCapture({
    format: 'webm',
    framerate: 60,
  });

  color1 = color(83, 105, 103);
  color2 = color(104, 206, 171);
  currentColor = color1;
  nextColor = color2;
}

function draw() {
  // Start capturing frames
  if (isRecording) {
    capturer.capture(cnv.canvas);
  }


  // background(0);
  
  // Calculate a smoothStep value based on fadeSpeed
  let t = frameCount * fadeSpeed;
  
  // Interpolate between colors using lerpColor
  let bgColor = lerpColor(currentColor, nextColor, sin(t));

  // Set the background to the interpolated color
  background(bgColor);
  
  drawRectangles();
  
  generateRectangles();
  
  if(full) updateRectangles();


  // Stop capturing frames and save the video
  if (isRecording && frameCount === 900) { // Change 300 to the desired number of frames
    capturer.stop();
    capturer.save();
    isRecording = false;
  }
}

function updateRectangles() {
  for (let rectangle of rectangles) {
    // Increase the radius up to 25 and then back to 0
    rectangle.radius = map(sin(rectangle.time*2), -1, 1, 1, 100);

    // Change height smoothly
    rectangle.height = map(sin(rectangle.time), -1, 1, rectangle.startHeight, rectangle.startHeight*2);

    // Change width smoothly
    rectangle.width = map(sin(rectangle.time), -1, 1, rectangle.startWidth, rectangle.startWidth*3);

    // Increase time at a faster rate to speed up the animation
    rectangle.time += rectangle.timeIncrement;
    
    rectangle.jitter = map(sin(rectangle.time), -1, 1, 5, rectangle.startJitter);
    
    rectangle.alpha = map(sin(rectangle.time*3), -1, 1, 0, 255);
    rectangle.alpha2 = map(sin(rectangle.time*2.5), -1, 1, 0, 255);

    // If you want the animation to loop, you can reset time to 0 when it reaches a certain value
    if (rectangle.time >= TWO_PI) {
      rectangle.time = 0.01;
    }
  }
}

function generateRectangles() {
  if (full) return
  for (let i = 0; i < 30; i++) {
    let rectSizeMult = 0.20;
    if (coveredArea === totalArea/1.5) {
      rectSizeMult = 0.10;
    } else if (coveredArea === totalArea/4) {
      rectSizeMult = 0.05;
    }
    
    let rectWidth = random(10, width*rectSizeMult);
    let rectHeight = random(10, height*rectSizeMult);
    let x = random(width - rectWidth);
    let y = random(height - rectHeight);
    
    let jitter = random(11,30);

    let newRect = {
      x: x,
      y: y,
      width: rectWidth,
      startWidth: rectWidth,
      height: rectHeight,
      startHeight: rectHeight,
      radius: 0,
      rgb: random(colors),
      alpha: 0,
      alpha2: 0,
      time: random(TWO_PI),  // Initialize with a random starting time
      timeIncrement: random(0.0001, 0.01), //random(0.001, 0.03)  // Randomize the time increment
      startJitter: jitter,
      jitter: jitter
    };

    // Check for overlap
    let overlapping = false;
    for (let otherRect of rectangles) {
      if (overlap(newRect, otherRect)) {
        overlapping = true;
        break;
      }
    }

    // If not overlapping, add to array
    if (!overlapping) {
      rectangles.push(newRect);
      coveredArea += rectWidth * rectHeight;
    }
    
    if (totalArea === coveredArea) {
      full = true;
    }
    
  }
}

function drawRectangles() {
  for (let rectangle of rectangles) {
    let jitterX2 = rectangle.jitter * 2;
    noStroke();
    fill(...rectangle.rgb);
    rectMode(CENTER);
    // moving rectangle
    rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height, rectangle.radius);
  
    
    // extra rectangles
    stroke(rectangle.rgb[0],rectangle.rgb[1],rectangle.rgb[2],rectangle.alpha2);
    noFill();

    rect(rectangle.x+rectangle.jitter, rectangle.y+rectangle.jitter, rectangle.startWidth, rectangle.startHeight, rectangle.radius);
    
    stroke(rectangle.rgb[0],rectangle.rgb[1],rectangle.rgb[2],rectangle.alpha);
    rect(rectangle.x+jitterX2, rectangle.y+jitterX2, rectangle.startWidth, rectangle.startHeight, rectangle.radius);
    
    noStroke();
    fill(rectangle.rgb[0],rectangle.rgb[1],rectangle.rgb[2], rectangle.radius * 2);
    rect(rectangle.x, rectangle.y, rectangle.startWidth, rectangle.startHeight, rectangle.radius);
    
    noFill();
    stroke(rectangle.rgb[0],rectangle.rgb[1],rectangle.rgb[2],rectangle.alpha2);
    
    rect(rectangle.x-rectangle.jitter, rectangle.y-rectangle.jitter, rectangle.startWidth, rectangle.startHeight, rectangle.radius);
    
    stroke(rectangle.rgb[0],rectangle.rgb[1],rectangle.rgb[2],rectangle.alpha);
    rect(rectangle.x-jitterX2, rectangle.y-jitterX2, rectangle.startWidth, rectangle.startHeight, rectangle.radius);
  }
}

function overlap(rect1, rect2) {
  // Calculate half widths and half heights
  let rect1HalfWidth = rect1.width / 2;
  let rect1HalfHeight = rect1.height / 2;
  let rect2HalfWidth = rect2.width / 2;
  let rect2HalfHeight = rect2.height / 2;

  // Calculate centers
  let rect1CenterX = rect1.x;
  let rect1CenterY = rect1.y;
  let rect2CenterX = rect2.x;
  let rect2CenterY = rect2.y;

  // Check for overlap in both dimensions
  return (
    abs(rect1CenterX - rect2CenterX) < (rect1HalfWidth + rect2HalfWidth) &&
    abs(rect1CenterY - rect2CenterY) < (rect1HalfHeight + rect2HalfHeight)
  );
}



function keyTyped() {
  // Pressing the "q" key to
  // save the image
  if (key === 's') {
    saveCanvas(cnv, 'mintChip'+new Date().toString()+'.png');
  } else if (key === 'r') { // Press 'r' to start/stop recording
    isRecording = !isRecording;

    if (isRecording) {
      capturer.start();
    } else {
      capturer.stop();
      capturer.save();
    }
    
  } else if (key === 'q') {
    full = !full;
  }
}

document.addEventListener("click", toggleFullScreen);

function toggleFullScreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.querySelector("body").requestFullscreen();
  }
}
