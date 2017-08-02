'use strict';

/**
Copyright (C) 2017 Thomas Ville

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
var sketch = function sketch(p) {
    var myCanvas = undefined;

    var lastMouseDraggedX = 0;
    var lastMouseDraggedY = 0;
    var lastParticleDraggedId = 0;

    var lastPixelDensity = 1.0;
    var fpsHistory = [0, 0, 0];
    var currentFpsHistoryId = 0;

    var MOBILE_NB_PARTICLES = 1;
    var DESKTOP_NB_PARTICLES = 100;
    var particles = [];

    var isRunning = true;
    var isGuiVisible = false;

    var minClientSize = document.body.clientWidth < document.body.clientHeight ? document.body.clientWidth : document.body.clientHeight;

    var width = document.body.clientWidth;
    var height = document.body.clientHeight;

    var origWidth = width;
    var origHeight = height;

    var domGuiContainer = document.getElementById('gui-container');
    var domNameContainer = document.getElementById('name-container');
    var domToggleAnimationBtn = document.getElementById('toggle-animation-btn');
    var domTweakAnimationBtn = document.getElementById('tweak-animation-btn');

    var gui = new dat.GUI({ autoPlace: false });
    domGuiContainer.appendChild(gui.domElement);
    domGuiContainer.style.visibility = 'hidden';

    var desktopPreset = {
        lineColor: { r: 255, g: 255, b: 255 },
        backgroundColor: { r: 11, g: 70, b: 80 },
        backgroundSpeed: 0.06,
        maxDistance: Math.floor(minClientSize / 4),
        maxLinks: 100,
        timeFactor: 1,
        pixelDensity: 1.0,
        nbParticles: 1,
        smoothFrameRate: 0,
        isAdaptativeQualityEnabled: true,
        reset: function reset() {
            particles = [];
            for (var i = 0; i < DESKTOP_NB_PARTICLES; i++) {
                addParticle(particles);
            }
            Object.assign(animation, this);
        },
        add10Particles: function add10Particles() {
            for (var i = 0; i < 10; i++) {
                addParticle(particles);
            }
        },
        saveImage: function saveImage() {
            p.saveCanvas('masterpiece', 'png');
        }
    };
    var mobilePreset = {
        lineColor: { r: 255, g: 255, b: 255 },
        backgroundColor: { r: 11, g: 70, b: 80 },
        backgroundSpeed: 0.06,
        maxDistance: Math.floor(minClientSize / 4),
        maxLinks: 100,
        timeFactor: 1,
        pixelDensity: 1.0,
        nbParticles: 0,
        smoothFrameRate: 0,
        isAdaptativeQualityEnabled: true,
        reset: function reset() {
            particles = [];
            for (var i = 0; i < MOBILE_NB_PARTICLES; i++) {
                addParticle(particles);
            }
            Object.assign(animation, this);
        },
        add10Particles: function add10Particles() {
            for (var i = 0; i < 10; i++) {
                addParticle(particles);
            }
        },
        saveImage: function saveImage() {
            p.saveCanvas('masterpiece', 'png');
        }
    };
    var animation = {};
    // Check mobile browser
    if (isMobileBrowser()) {
        mobilePreset.reset();
    } else {
        desktopPreset.reset();
    }

    // Buttons listeners
    domNameContainer.classList.add('visible');
    domToggleAnimationBtn.onclick = onToggleAnimationClick;
    domTweakAnimationBtn.onclick = onTweakClick;

    p.setup = function () {
        // Create the canvas
        myCanvas = p.createCanvas(width, height);
        myCanvas.parent('home');
        p.frameRate(30);

        // Set the tweaking gui
        gui.addColor(animation, 'lineColor');
        gui.addColor(animation, 'backgroundColor');
        gui.add(animation, 'backgroundSpeed', 0, 0.1);
        gui.add(animation, 'maxDistance', 1, minClientSize);
        gui.add(animation, 'maxLinks', 1, 500);
        gui.add(animation, 'timeFactor', 0, 4);
        gui.add(animation, 'pixelDensity', 0, 2);
        gui.add(animation, 'nbParticles');
        gui.add(animation, 'smoothFrameRate');
        gui.add(animation, 'add10Particles');
        gui.add(animation, 'isAdaptativeQualityEnabled');
        gui.add(animation, 'reset');
        gui.add(animation, 'saveImage');
    };

    p.draw = function () {
        if (!isRunning || p.frameRate() < 1 || !p.frameRate()) return;
        if (lastPixelDensity != animation.pixelDensity) {
            lastPixelDensity = animation.pixelDensity;
            p.pixelDensity(animation.pixelDensity);
        }
        // Update the smoothed out frameRate
        fpsHistory[currentFpsHistoryId] = p.frameRate();
        currentFpsHistoryId = (currentFpsHistoryId + 1) % fpsHistory.length;
        animation.smoothFrameRate = fpsHistory.reduce(function (a, b) {
            return a + b;
        }) / fpsHistory.length;

        // Update the number of particles (just for the tweak panel)
        animation.nbParticles = particles.length;
        // Animate background color
        animation.backgroundColor = increaseHue(animation.backgroundColor, animation.backgroundSpeed / p.frameRate());
        p.background('rgb(' + Math.floor(animation.backgroundColor.r) + ',' + Math.floor(animation.backgroundColor.g) + ',' + Math.floor(animation.backgroundColor.b) + ')');

        for (var i = 0; i < particles.length; i++) {
            if (isParticleOutsideWorld(particles[i])) {
                respawnParticle(particles[i]);
            } else {
                particles[i].x += animation.timeFactor * particles[i].direction.x / p.frameRate();
                particles[i].y += animation.timeFactor * particles[i].direction.y / p.frameRate();
            }
            p.stroke('rgb(' + Math.floor(animation.lineColor.r) + ',' + Math.floor(animation.lineColor.g) + ',' + Math.floor(animation.lineColor.b) + ')');

            var dist = Math.sqrt(Math.pow(particles[i].x - p.mouseX, 2) + Math.pow(particles[i].y - p.mouseY, 2));
            if (dist < animation.maxDistance) {
                p.strokeWeight(2 - dist / (animation.maxDistance / 2));
                p.line(p.mouseX, p.mouseY, particles[i].x, particles[i].y);
            }
            // Waiting for a better optimization algorithm (failed with quadtree)
            var candidates = particles;
            for (var j = i + 1, nbLinks = 0; j < candidates.length && nbLinks < animation.maxLinks; j++, nbLinks++) {
                var _dist = distance(particles[i].x, particles[i].y, candidates[j].x, candidates[j].y);
                if (_dist < animation.maxDistance) {
                    p.strokeWeight(1 - _dist / (animation.maxDistance / 1));
                    p.line(particles[i].x, particles[i].y, candidates[j].x, candidates[j].y);
                }
            }
        }
        // Update the gui
        for (var _i in gui.__controllers) {
            gui.__controllers[_i].updateDisplay();
        }
        // Adaptative quality
        if (animation.isAdaptativeQualityEnabled) {
            if (animation.smoothFrameRate < 25) {
                decreaseQuality();
            } else if (animation.smoothFrameRate > 30) {
                increaseQuality();
            }
        }
    };
    // Add particles when clicked
    p.mouseDragged = function (t) {
        if (t.target == myCanvas.canvas && distance(p.mouseX, p.mouseY, lastMouseDraggedX, lastMouseDraggedY) > animation.maxDistance / 4) {
            if (lastParticleDraggedId >= particles.length) lastParticleDraggedId = 0;
            var part = particles[lastParticleDraggedId++];
            part.x = lastMouseDraggedX = p.mouseX;
            part.y = lastMouseDraggedY = p.mouseY;
            return false;
        }
    };
    // dynamically adjust the canvas to the window
    p.windowResized = function () {
        width = p.windowWidth;
        height = p.windowHeight;
        minClientSize = width < height ? width : height;

        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
    /******* Particles ********/
    // Add one particle to the list of particles
    function addParticle(particles, x, y) {
        x = x || Math.random() * width;
        y = y || Math.random() * height;

        var direction = p.createVector(Math.random() - 0.5, Math.random() - 0.5);
        direction.setMag(Math.random() * 20 + 10);

        particles.push({
            x: x,
            y: y,
            direction: direction
        });
    }
    // Move a particle at a random position, trying to put it away of every other particle
    function respawnParticle(particle) {
        var randX = 0;
        var randY = 0;
        var allowedTries = 10;
        do {
            randX = Math.random() * width;
            randY = Math.random() * height;
            allowedTries--;
        } while (allowedTries !== 0 && isConnectedToParticles(particles, animation.maxDistance, randX, randY));
        particle.x = randX;
        particle.y = randY;
    }
    // Returns true if the position is close enough to make a connection with another particle
    function isConnectedToParticles(particles, maxDistance, x, y) {
        var invisible = true;
        for (var j = 0; j < particles.length; j++) {
            if (distance(particles[j].x, particles[j].y, x, y) < maxDistance) {
                invisible = false;
                break;
            }
        }
        return !invisible;
    }
    function isParticleOutsideWorld(particle) {
        return particle.x > width + animation.maxDistance || particle.x < -animation.maxDistance || particle.y > height + animation.maxDistance || particle.y < -animation.maxDistance;
    }

    /******* Utilities ********/
    // Returns the distance between two points
    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
    // Change the hue of the color by delta
    function increaseHue(color, delta) {
        var hsv = RGBtoHSV(color);
        hsv.h += delta;
        return HSVtoRGB(hsv);
    }
    // https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
    /* accepts parameters
    * r  Object = {r:x, g:y, b:z}
    * OR 
    * r, g, b
    */
    function RGBtoHSV(r, g, b) {
        if (arguments.length === 1) {
            g = r.g, b = r.b, r = r.r;
        }
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            d = max - min,
            h,
            s = max === 0 ? 0 : d / max,
            v = max / 255;

        switch (max) {
            case min:
                h = 0;break;
            case r:
                h = g - b + d * (g < b ? 6 : 0);h /= 6 * d;break;
            case g:
                h = b - r + d * 2;h /= 6 * d;break;
            case b:
                h = r - g + d * 4;h /= 6 * d;break;
        }

        return {
            h: h,
            s: s,
            v: v
        };
    }
    /* accepts parameters
    * h  Object = {h:x, s:y, v:z}
    * OR 
    * h, s, v
    */
    function HSVtoRGB(h, s, v) {
        var r, g, b, i, f, p, q, t;
        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;break;
            case 1:
                r = q, g = v, b = p;break;
            case 2:
                r = p, g = v, b = t;break;
            case 3:
                r = p, g = q, b = v;break;
            case 4:
                r = t, g = p, b = v;break;
            case 5:
                r = v, g = p, b = q;break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /******* Other events ********/
    function onTweakClick() {
        isGuiVisible = !isGuiVisible;
        if (isGuiVisible) {
            domNameContainer.classList.remove('visible');
            domGuiContainer.style.visibility = 'visible';
        } else {
            domNameContainer.classList.add('visible');
            domGuiContainer.style.visibility = 'hidden';
        }
    }
    function onToggleAnimationClick() {
        isRunning = !isRunning;
        if (isRunning) {
            this.innerHTML = 'Animation On';
        } else {
            this.innerHTML = 'Animation Off';
        }
    }

    function decreaseQuality() {
        if (particles.length > 50) {
            // First decrease the number of particles
            particles.pop();
        } else if (animation.pixelDensity > 0.5) {
            // Then decrease pixelDensity
            animation.pixelDensity -= 0.01;
        }
    }
    function increaseQuality() {
        if (animation.pixelDensity < 1) {
            animation.pixelDensity += 0.01;
        } else if (particles.length < DESKTOP_NB_PARTICLES) {
            addParticle(particles);
        }
    }
};

new p5(sketch, document.getElementById('home'));