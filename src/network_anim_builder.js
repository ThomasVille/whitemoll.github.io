var NetworkAnimBuilder = function (p) {
    let lastMouseDraggedX = 0;
    let lastMouseDraggedY = 0;
    let lastParticleDraggedId = 0;

    var particles = [];

    var minClientSize = document.body.clientWidth < document.body.clientHeight ? document.body.clientWidth : document.body.clientHeight;
    
    var animation = {
        add100Particles: function() {
            for(let i = 0; i < 100; i++) {
                addParticle(particles);
            }
        },
        saveImage: function() {
            p.saveCanvas('masterpiece', 'png');
        },
        lineColor: {r: 255, g: 255, b: 255},
        backgroundColor: {r: 11, g: 70, b: 80},
        backgroundSpeed: 0.06,
        maxDistance: Math.floor(minClientSize/4),
        maxLinks: 100,
        timeFactor: 1,
        nbParticles: 1
    };
    
 
    
    p.setOnNewConfigurationCallback(function(config) {
        for(let key in config) {
            if(animation.hasOwnProperty(key)) {
                animation[key] = config[key];
            }
        }

        particles = [];
        for(let i = 0; i < animation.nbParticles; i++) {
            addParticle(particles);
        }
    });

    p.setup = function() {
        
        
        // Set the tweaking gui
        /*gui.addColor(animation, 'lineColor');
        gui.addColor(animation, 'backgroundColor');
        gui.add(animation, 'backgroundSpeed', 0, 0.1);
        gui.add(animation, 'maxDistance', 1, minClientSize);
        gui.add(animation, 'maxLinks', 1, 500);
        gui.add(animation, 'timeFactor', 0, 4);
        gui.add(animation, 'nbParticles');
        gui.add(animation, 'add100Particles');
        gui.add(animation, 'isAdaptativeQualityEnabled');
        gui.add(animation, 'reset');
        gui.add(animation, 'saveImage');*/
        

    }

    p.draw = function() {
        

        // Update the number of particles (just for the tweak panel)
        animation.nbParticles = particles.length;
        // Animate background color
        animation.backgroundColor = increaseHue(animation.backgroundColor, animation.backgroundSpeed/p.frameRate());
        p.background('rgb('+Math.floor(animation.backgroundColor.r)+','+Math.floor(animation.backgroundColor.g)+','+Math.floor(animation.backgroundColor.b)+')');

        for(let i = 0; i < particles.length; i++) {
            if(isParticleOutsideWorld(particles[i])) {
                respawnParticle(particles[i]);
            } else {
                particles[i].x += animation.timeFactor*particles[i].direction.x/p.frameRate();
                particles[i].y += animation.timeFactor*particles[i].direction.y/p.frameRate();
            }
            p.stroke('rgb('+Math.floor(animation.lineColor.r)+','+Math.floor(animation.lineColor.g)+','+Math.floor(animation.lineColor.b)+')');
            
            let dist = Math.sqrt(Math.pow(particles[i].x - p.mouseX, 2) + Math.pow(particles[i].y - p.mouseY, 2));
            if(dist < animation.maxDistance) {
                p.strokeWeight(2 - dist/(animation.maxDistance/2));
                p.line(p.mouseX, p.mouseY, particles[i].x, particles[i].y);
            }
            // Waiting for a better optimization algorithm (failed with quadtree)
            let candidates = particles;
            for(let j = i+1, nbLinks=0; j < candidates.length && nbLinks < animation.maxLinks; j++, nbLinks++) {
                let dist = distance(particles[i].x, particles[i].y, candidates[j].x, candidates[j].y);
                if(dist < animation.maxDistance) {
                    p.strokeWeight(1 - dist/(animation.maxDistance/1));
                    p.line(particles[i].x, particles[i].y, candidates[j].x, candidates[j].y);
                }
            }
        }
    }
    // Add particles when clicked
    p.mouseDragged = function(t) {
        if(t.target == p.getCanvas().canvas && distance(p.mouseX, p.mouseY, lastMouseDraggedX, lastMouseDraggedY) > animation.maxDistance/4) {
            if(lastParticleDraggedId >= particles.length) lastParticleDraggedId = 0;
            let part = particles[lastParticleDraggedId++];
            part.x = lastMouseDraggedX = p.mouseX;
            part.y = lastMouseDraggedY = p.mouseY;
            return false;
        }
    }
    // dynamically adjust the canvas to the window
    p.windowResized = function() {
        p.updateDimensions();
        minClientSize = p.getWidth() < p.getHeight() ? p.getWidth() : p.getHeight();
        
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }
    /******* Particles ********/
    // Add one particle to the list of particles
    function addParticle(particles, x, y) {
        x = x || Math.random()*p.getWidth();
        y = y || Math.random()*p.getHeight();

        let direction = p.createVector(Math.random()-0.5, Math.random()-0.5);
        direction.setMag(Math.random()*20+10);

        particles.push({
            x,
            y,
            direction: direction
        });
    }
    // Move a particle at a random position, trying to put it away of every other particle
    function respawnParticle(particle) {
        let randX = 0;
        let randY = 0;
        let allowedTries = 10;
        do {
            randX = Math.random()*p.getWidth();
            randY = Math.random()*p.getHeight();
            allowedTries--;
        } while(allowedTries !== 0 && isConnectedToParticles(particles, animation.maxDistance, randX, randY));
        particle.x = randX;
        particle.y = randY;
    }
    // Returns true if the position is close enough to make a connection with another particle
    function isConnectedToParticles(particles, maxDistance, x, y) {
        let invisible = true;
        for(let j = 0; j < particles.length; j++) {
            if(distance(particles[j].x, particles[j].y, x, y) < maxDistance) {
                invisible = false;
                break;
            }
        }
        return !invisible;
    }
    function isParticleOutsideWorld(particle) {
        return particle.x > p.getWidth() + animation.maxDistance
            || particle.x < -animation.maxDistance
            || particle.y > p.getHeight() + animation.maxDistance
            || particle.y < -animation.maxDistance;
    }

    /******* Utilities ********/
    // Returns the distance between two points
    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
    // Change the hue of the color by delta
    function increaseHue(color, delta) {
        let hsv = RGBtoHSV(color);
        hsv.h+=delta;
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
        var max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;

        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
            case g: h = (b - r) + d * 2; h /= 6 * d; break;
            case b: h = (r - g) + d * 4; h /= 6 * d; break;
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
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /******* Other events ********/
    p.decreaseQuality = function() {
        if (particles.length > 50) {
            // First decrease the number of particles
            particles.pop();
            // Return true to signal that we have processed the decreaseQuality event
            return true;
        }
        return false;
    }
    p.increaseQuality = function() {
        if(particles.length < 100) {
            addParticle(particles);
            // Return true to signal that we have processed the increaseQuality event
            return true;
        }
        return false;
    }
};