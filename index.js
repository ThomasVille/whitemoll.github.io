var myCanvas = undefined;
// Variables
// Number of particles
var nbParticles = 100;
var nbParticlesMin = 0;
var nbParticlesMax = 1000;
var particles = [];

var lineR = 0;
var lineRMax = 255;
var lineG = 0;
var lineGMax = 255;
var lineB = 0;
var lineBMax = 255;

var backgroundR = 255;
var backgroundRMax = 255;
var backgroundG = 255;
var backgroundGMax = 255;
var backgroundB = 255;
var backgroundBMax = 255;

var dayColorPalette = [0, 0, 0, 255, 255, 255];
var nightColorPalette = [255, 255, 255, 0, 0, 0];

var play = true;

adaptColorPaletteToHourOfDay();


var minClientSize = document.body.clientWidth < document.body.clientHeight ? document.body.clientWidth : document.body.clientHeight;
var maxDistance = Math.floor(minClientSize/4);
var maxDistanceMin = 1;
var maxDistanceMax = minClientSize;

let width = document.body.clientWidth;
let height = document.body.clientHeight;

const origWidth = width;
const origHeight = height;

var gui;
var isGuiVisible = false;
var consecutiveFPSDrops = 0, consecutiveFPSAbove = 0;

document.getElementById('name').classList.add('visible');

function setup() {
    // Rescales to 1080p when the screen is qHD (for smartphones)
    // Sorry for people who have UHD screens ^^
    if(width * height > 3500000)
        pixelDensity(0.75);

    // Create the canvas
    myCanvas = createCanvas(width, height);
    myCanvas.parent('home');
    frameRate(60);

    // Set the tweaking gui
    gui = createGui('Particle playground');
    gui.addGlobals('lineColor', 'maxDistance', 'play', 'lineR', 'lineG', 'lineB', 'backgroundR', 'backgroundG', 'backgroundB');
    gui.hide();
    
    // Add some particles
    for(let i = 0; i < nbParticles; i++) {
        addParticle(particles);
    }
}

function draw() {
    if(!play) return;
    if(frameRate() > 15) {
        background('rgb('+backgroundR+','+backgroundG+','+backgroundB+')');

        for(let i = 0; i < particles.length; i++) {
            if(particles[i].position.x > width + maxDistance || particles[i].position.x < -maxDistance || particles[i].position.y > height + maxDistance || particles[i].position.y < -maxDistance) {
                respawnParticle(particles[i]);
            } else {
                particles[i].position.x += particles[i].direction.x/frameRate();
                particles[i].position.y += particles[i].direction.y/frameRate();
            }
            stroke('rgb('+lineR+','+lineG+','+lineB+')');
            
            let distance = Math.sqrt(Math.pow(particles[i].position.x - mouseX, 2) + Math.pow(particles[i].position.y - mouseY, 2));
            if(distance < maxDistance) {
                strokeWeight(2 - distance/(maxDistance/2));
                line(mouseX, mouseY, particles[i].position.x, particles[i].position.y);
            }
            for(let j = i+1; j < particles.length; j++) {
                let distance = particles[i].position.dist(particles[j].position);
                if(distance < maxDistance) {
                    strokeWeight(1 - distance/(maxDistance/1));
                    line(particles[i].position.x, particles[i].position.y, particles[j].position.x, particles[j].position.y);
                }
            }
        }
    } else {
        consecutiveFPSDrops++;
        if(consecutiveFPSDrops > 20) {
            // Second stage of optimization : stop the animation
            document.getElementById('toggle-animation-btn').click();
            consecutiveFPSDrops = 0;
        } else if(consecutiveFPSDrops > 10) {
            // First stage of optimization : scale down the rendering definition
            pixelDensity(0.75);
        }
    }
}
function mouseDragged(t) {
    if(t.target == myCanvas.canvas) {
        addParticle(particles, mouseX, mouseY);
        return false;
    }
}
// dynamically adjust the canvas to the window
function windowResized() {
    width = windowWidth;
    height = windowHeight;
    minClientSize = width < height ? width : height;
    
    resizeCanvas(windowWidth, windowHeight);
}

/******* Particles ********/
function addParticle(particles, x, y) {
    x = x || Math.random()*width;
    y = y || Math.random()*height;

    let direction = createVector(Math.random()-0.5, Math.random()-0.5);
    direction.setMag(Math.random()*20+10);

    particles.push({
        position: createVector(x,y),
        direction: direction
    });
}
function respawnParticle(particle) {
    let randX = 0;
    let randY = 0;
    let allowedTries = 10;
    do {
        randX = Math.random()*width;
        randY = Math.random()*height;
        allowedTries--;
    } while(allowedTries !== 0 && isConnectedToParticles(particles, maxDistance, randX, randY));
    particle.position.x = randX;
    particle.position.y = randY;
}
function isConnectedToParticles(particles, maxDistance, x, y) {
    let invisible = true;
    let position = createVector(x, y);
    for(let j = 0; j < particles.length; j++) {
        if(particles[j].position.dist(position) < maxDistance) {
            invisible = false;
            break;
        }
    }
    return !invisible;
}

/******* Utilities ********/
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
function setColors(colorPalette) {
    lineR = colorPalette[0];
    lineG = colorPalette[1];
    lineB = colorPalette[2];

    backgroundR = colorPalette[3];
    backgroundG = colorPalette[4];
    backgroundB = colorPalette[5];
}
function adaptColorPaletteToHourOfDay() {
    var curHr = new Date().getHours();

    if (18 <= curHr|| curHr < 8) {
        setColors(nightColorPalette);
    } else {
        setColors(dayColorPalette);
    }
}

function onTweakClick() {
    isGuiVisible = !isGuiVisible;
    if(isGuiVisible) {
        gui.show();
        document.getElementById('name').classList.remove('visible');
    } else {
        gui.hide();
        document.getElementById('name').classList.add('visible');
    }
}
function onToggleAnimationClick(el) {
    play = !play;
    if(play) {
        el.innerHTML = 'Animation On';
    } else {
        el.innerHTML = 'Animation Off';            
    }
}