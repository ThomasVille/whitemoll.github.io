'use strict';

var NetworkAnimBuilder = function NetworkAnimBuilder(p) {
    var TEXT_PARTICLE_COUNT = 500;
    var lastMouseDraggedX = 0;
    var lastMouseDraggedY = 0;
    var lastParticleDraggedId = 0;

    var particles = [];

    var font;
    var pointPath = [];
    var textPath;
    var svg;
    var isChangingText = false;

    function World() {
        this.coroutines = [];
    };
    World.prototype.addCoroutine = function (coroutine) {
        this.coroutines.push(coroutine());
    };
    World.prototype.executeCoroutines = function () {
        var coroutinesIdxToDelete = [];
        // Execute the next of each coroutine
        for (var i = this.coroutines.length - 1; i >= 0; i--) {
            var res = this.coroutines[i].next();
            if (res.done) {
                coroutinesIdxToDelete.push(i);
            }
        }
        // Delete finished coroutines
        while (coroutinesIdxToDelete.length > 0) {
            console.log('deleted coroutine', coroutinesIdxToDelete[coroutinesIdxToDelete.length - 1]);
            this.coroutines.splice(coroutinesIdxToDelete.pop(), 1);
        }
    };

    var world = new World();

    var minClientSize = document.body.clientWidth < document.body.clientHeight ? document.body.clientWidth : document.body.clientHeight;
    // TODO faire mini animation de crédit pour afficher le nom de la lib
    p.animationConfiguration = {
        add100Particles: function add100Particles() {
            for (var i = 0; i < 100; i++) {
                addParticle(particles);
            }
        },
        saveImage: function saveImage() {
            p.saveCanvas('masterpiece', 'png');
        },
        lineColor: { r: 255, g: 255, b: 255 },
        maxLineWidth: 2,
        hasBackground: true,
        backgroundColor: { r: 64, g: 53, b: 90 },
        backgroundSpeed: 0.06,
        isMouseDragAllowed: true,
        maxDistance: Math.floor(minClientSize / 4),
        maxLinks: 100,
        timeFactor: 1,
        nbParticles: 100,
        text: 'Thomas Ville',
        isShowingText: true
    };

    // Set the tweaking gui
    if (p.gui) {
        p.gui.add(p.animationConfiguration, 'text');
        p.gui.add(p.animationConfiguration, 'isShowingText');
        p.gui.addColor(p.animationConfiguration, 'lineColor');
        p.gui.add(p.animationConfiguration, 'maxLineWidth', 0, 5);
        p.gui.add(p.animationConfiguration, 'hasBackground');
        p.gui.addColor(p.animationConfiguration, 'backgroundColor');
        p.gui.add(p.animationConfiguration, 'backgroundSpeed', 0, 1);
        p.gui.add(p.animationConfiguration, 'isMouseDragAllowed');
        p.gui.add(p.animationConfiguration, 'maxDistance', 1, minClientSize);
        p.gui.add(p.animationConfiguration, 'maxLinks', 1, 500);
        p.gui.add(p.animationConfiguration, 'timeFactor', 0, 4);
        p.gui.add(p.animationConfiguration, 'nbParticles');
        p.gui.add(p.animationConfiguration, 'add100Particles');
        p.gui.add(p.animationConfiguration, 'saveImage');
    }

    p.setOnNewConfigurationCallback(function (newConfig) {
        // Set the target of each particle to be on the path of the textPath
        if (font && p.animationConfiguration.isShowingText && !isChangingText) {
            isChangingText = true;
            world.addCoroutine(regeneratorRuntime.mark(function _callee() {
                var fontSize, fontStep, bb, pathYOffset, pathXOffset, domPath, totalLength, step, len, i, _p, averageInterval, _i, path;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                p.animationConfiguration.maxLinks = 50;

                                // Determine the best font size to fit the text on the screen
                                fontSize = 10;
                                fontStep = 10;

                            case 3:
                                fontSize += fontStep;
                                _context.next = 6;
                                return;

                            case 6:
                                if (font.getAdvanceWidth(p.animationConfiguration.text, fontSize) < p.getWidth() / 2) {
                                    _context.next = 3;
                                    break;
                                }

                            case 7:
                                fontSize -= fontStep;

                                console.log('particles.length', particles.length);
                                // Generate the text
                                textPath = font.getPath(p.animationConfiguration.text, 0, 0, fontSize);
                                // Retrieve the bounding box to center the text
                                bb = textPath.getBoundingBox();
                                pathYOffset = p.getHeight() / 2 - bb.y1 / 2;
                                pathXOffset = (p.getWidth() - bb.x2) / 2;
                                // Retrieve a path DOM element

                                domPath = textPath.toDOMElement(4);
                                totalLength = domPath.getTotalLength();
                                step = totalLength / Math.floor(TEXT_PARTICLE_COUNT * .7);

                                pointPath = [];
                                len = 0, i = 0;

                            case 18:
                                if (!(len < totalLength)) {
                                    _context.next = 27;
                                    break;
                                }

                                _p = domPath.getPointAtLength(len);

                                pointPath.push({ x: _p.x + pathXOffset, y: _p.y + pathYOffset });

                                if (!(i % 10 === 0)) {
                                    _context.next = 24;
                                    break;
                                }

                                _context.next = 24;
                                return;

                            case 24:
                                len += step, i++;
                                _context.next = 18;
                                break;

                            case 27:

                                // Compute average distance between two consecutive points on the path
                                averageInterval = 0;

                                pointPath.reduce(function (a, b) {
                                    averageInterval += vectorDistance(a, b);return b;
                                });
                                averageInterval = averageInterval / pointPath.length;

                                // Adapt the maxDistance parameter to the path
                                p.animationConfiguration.maxDistance = averageInterval * 1.5;
                                _i = 0;

                            case 32:
                                if (!(_i < Math.floor(TEXT_PARTICLE_COUNT * .7))) {
                                    _context.next = 42;
                                    break;
                                }

                                if (particles.length < TEXT_PARTICLE_COUNT) {
                                    addParticle(particles);
                                }
                                path = pointPath[_i];

                                particles[_i].setSpringMotion(path);

                                if (!(_i % 10 === 0)) {
                                    _context.next = 39;
                                    break;
                                }

                                _context.next = 39;
                                return;

                            case 39:
                                _i++;
                                _context.next = 32;
                                break;

                            case 42:
                                isChangingText = false;

                            case 43:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
        if (!p.animationConfiguration.isShowingText) {
            // Free up spring particles
            for (var i = particles.length - 1; i >= 0; i--) {
                if (particles[i].frictionCoefficient !== 0 || particles[i].isStatic) {
                    var direction = p.createVector(Math.random() - 0.5, Math.random() - 0.5);
                    direction.setMag(Math.random() * 1 + 0.1);

                    particles[i].setLinearMotion(direction);
                }
            }
        }
    });

    p.setup = function () {
        opentype.load('/dist/SourceSansPro-Regular.otf', function (err, newFont) {
            if (err) {
                alert('Could not load font: ' + err);
            } else {
                font = newFont;
            }
        });
    };

    p.draw = function () {
        world.executeCoroutines();
        // Update the number of particles (just for the tweak panel)
        p.animationConfiguration.nbParticles = particles.length;

        if (p.animationConfiguration.hasBackground) {
            // Animate background color
            animateBackgroundColor();
        } else {
            p.clear();
        }

        if (textPath) {
            //textPath.draw(p.canvas.getContext('2d'));
            //font.drawPoints(p.canvas.getContext('2d'), 'Hello, World!', 100, 500, 300);
        }

        p.stroke(p.animationConfiguration.lineColor.r, p.animationConfiguration.lineColor.g, p.animationConfiguration.lineColor.b);
        for (var i = 0; i < particles.length; i++) {
            if (isParticleOutsideWorld(particles[i])) {
                respawnParticle(particles[i]);
            } else {
                particles[i].update(1 / p.frameRate());
            }

            var dist = Math.sqrt(Math.pow(particles[i].position.x - p.mouseX, 2) + Math.pow(particles[i].position.y - p.mouseY, 2));
            if (dist < p.animationConfiguration.maxDistance) {
                p.beginShape(p.LINES);
                p.strokeWeight(p.animationConfiguration.maxLineWidth - dist / (p.animationConfiguration.maxDistance / p.animationConfiguration.maxLineWidth));
                p.vertex(p.mouseX, p.mouseY);
                p.vertex(particles[i].position.x, particles[i].position.y);
                p.endShape();
            }
            // Waiting for a better optimization algorithm (failed with quadtree)
            var candidates = particles;
            for (var j = i + 1, nbLinks = 0; j < candidates.length && nbLinks < p.animationConfiguration.maxLinks; j++, nbLinks++) {
                var _dist = distance(particles[i].position.x, particles[i].position.y, candidates[j].position.x, candidates[j].position.y);
                if (_dist < p.animationConfiguration.maxDistance) {
                    p.beginShape(p.LINES);
                    p.strokeWeight(p.animationConfiguration.maxLineWidth - _dist / (p.animationConfiguration.maxDistance / p.animationConfiguration.maxLineWidth));
                    p.vertex(particles[i].position.x, particles[i].position.y);
                    p.vertex(candidates[j].position.x, candidates[j].position.y);
                    //p.line(particles[i].position.x, particles[i].position.y, candidates[j].position.x, candidates[j].position.y);
                    p.endShape();
                }
            }
        }
    };
    // Move particles when clicked
    p.mouseDragged = function (t) {
        // BUG t.target is the container and not the canvas anymore
        if (p.animationConfiguration.isMouseDragAllowed && t.target == p.getCanvas().canvas && distance(p.mouseX, p.mouseY, lastMouseDraggedX, lastMouseDraggedY) > p.animationConfiguration.maxDistance / 4) {
            // Don't move particles attracted to text
            if (p.animationConfiguration.isShowingText) {
                if (lastParticleDraggedId >= particles.length || lastParticleDraggedId < getTextParticleCount()) {
                    lastParticleDraggedId = getTextParticleCount();
                }
            } else {
                if (lastParticleDraggedId >= particles.length) {
                    lastParticleDraggedId = 0;
                }
            }
            var part = particles[lastParticleDraggedId++];
            part.position.x = lastMouseDraggedX = p.mouseX;
            part.position.y = lastMouseDraggedY = p.mouseY;
            part.positionPrev.x = part.position.x - part.velocity.x;
            part.positionPrev.y = part.position.y - part.velocity.y;
            return false;
        }
    };
    // dynamically adjust the canvas to the window
    p.windowResized = function () {
        minClientSize = p.getWidth() < p.getHeight() ? p.getWidth() : p.getHeight();
    };
    /******* Particles ********/
    function SpringMovement(target) {
        this.target = p.createVector(target.x, target.y);
    }
    SpringMovement.prototype.update = function (particle, delta) {
        particle.force.x += 3 * (this.target.x - particle.position.x) - particle.velocity.x * 0.9;
        particle.force.y += 3 * (this.target.y - particle.position.y) - particle.velocity.y * 0.9;
        // Stop the particle when arrived at target
        if (particle.force.x * particle.force.x + particle.force.y * particle.force.y < 0.01) {
            particle.setStatic();
            return;
        }
    };
    function Particle(position) {
        this.position = Object.assign({}, position);
        this.positionPrev = Object.assign({}, position);
        this.velocity = { x: 0, y: 0 };
        this.mass = 0.1;
        this.force = { x: 0, y: 0 };
        this.frictionCoefficient = 0;
        this.forces = [];
        this.isStatic = false;
    }
    Particle.prototype.update = function (delta) {
        if (this.isStatic) return;

        this.velocity.x = 0;
        this.velocity.y = 0;
        this.force.x = 0;
        this.force.y = 0;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this.forces[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var f = _step.value;

                f.update(this, delta);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        var deltaTimeSquared = Math.pow(p.animationConfiguration.timeFactor * delta, 2);

        // from the previous step
        var frictionAir = 1 - this.frictionCoefficient * delta,
            velocityPrevX = this.position.x - this.positionPrev.x,
            velocityPrevY = this.position.y - this.positionPrev.y;

        // update velocity with Verlet integration
        this.velocity.x = velocityPrevX * frictionAir + this.force.x / this.mass * deltaTimeSquared;
        this.velocity.y = velocityPrevY * frictionAir + this.force.y / this.mass * deltaTimeSquared;

        this.positionPrev.x = this.position.x;
        this.positionPrev.y = this.position.y;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    };
    Particle.prototype.setLinearMotion = function (velocity) {
        this.isStatic = false;
        this.positionPrev.x = this.position.x - velocity.x;
        this.positionPrev.y = this.position.y - velocity.y;
        this.frictionCoefficient = 0;
        this.forces = [];
    };
    Particle.prototype.setSpringMotion = function (target) {
        this.isStatic = false;
        this.frictionCoefficient = 10;
        this.forces = [];
        this.forces.push(new SpringMovement(target));
    };
    Particle.prototype.setStatic = function () {
        this.isStatic = true;
        this.forces = [];
    };
    // Add one particle to the list of particles
    function addParticle(particles, position) {
        position = position || { x: Math.random() * p.getWidth(), y: Math.random() * p.getHeight() };

        var direction = p.createVector(Math.random() - 0.5, Math.random() - 0.5);
        direction.setMag(Math.random() * 1 + 0.1);

        var newParticle = new Particle(position);
        newParticle.setLinearMotion(direction);

        particles.push(newParticle);
    }
    // Move a particle at a random position, trying to put it away of every other particle
    function respawnParticle(particle) {
        var randX = 0;
        var randY = 0;
        var allowedTries = 10;
        do {
            randX = Math.random() * p.getWidth();
            randY = Math.random() * p.getHeight();
            allowedTries--;
        } while (allowedTries !== 0 && isConnectedToParticles(particles, p.animationConfiguration.maxDistance, randX, randY));
        particle.position.x = randX;
        particle.position.y = randY;
        particle.positionPrev.x = randX - particle.velocity.x;
        particle.positionPrev.y = randY - particle.velocity.y;
    }
    // Returns true if the position is close enough to make a connection with another particle
    function isConnectedToParticles(particles, maxDistance, x, y) {
        var invisible = true;
        for (var j = 0; j < particles.length; j++) {
            if (distance(particles[j].position.x, particles[j].position.y, x, y) < maxDistance) {
                invisible = false;
                break;
            }
        }
        return !invisible;
    }
    function isParticleOutsideWorld(particle) {
        return particle.position.x > p.getWidth() + p.animationConfiguration.maxDistance || particle.position.x < -p.animationConfiguration.maxDistance || particle.position.y > p.getHeight() + p.animationConfiguration.maxDistance || particle.position.y < -p.animationConfiguration.maxDistance;
    }

    /******* Utilities ********/
    // Returns the distance between two points
    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
    function vectorDistance(a, b) {
        return distance(a.x, a.y, b.x, b.y);
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
    function objToCSSColor(obj) {
        return 'rgb(' + Math.floor(obj.r) + ',' + Math.floor(obj.g) + ',' + Math.floor(obj.b) + ')';
    }
    function animateBackgroundColor() {
        p.animationConfiguration.backgroundColor = increaseHue(p.animationConfiguration.backgroundColor, p.animationConfiguration.backgroundSpeed / p.frameRate());
        p.background('rgb(' + Math.floor(p.animationConfiguration.backgroundColor.r) + ',' + Math.floor(p.animationConfiguration.backgroundColor.g) + ',' + Math.floor(p.animationConfiguration.backgroundColor.b) + ')');
    }

    function applyParticlePhysics(i) {
        particles[i].x += p.animationConfiguration.timeFactor * particles[i].direction.x / p.frameRate();
        particles[i].y += p.animationConfiguration.timeFactor * particles[i].direction.y / p.frameRate();
    }
    function getTextParticleCount() {
        return Math.floor(particles.length * 0.7);
    }
    /******* Other events ********/
    p.decreaseQuality = function () {
        if (!p.animationConfiguration.isShowingText && particles.length > 50) {
            // Decrease the number of particles first if we're not showing any text (otherwise, prefer to decrease the pixel density)
            particles.pop();
            // Return true to signal that we have processed the decreaseQuality event
            return true;
        }
        return false;
    };
    p.increaseQuality = function () {
        if (particles.length < 100) {
            addParticle(particles);
            // Return true to signal that we have processed the increaseQuality event
            return true;
        }
        return false;
    };
};