'use strict';

function AnimBuilder() {
    var _this = this;

    var animation = {
        pixelDensity: 1,
        lastPixelDensity: 1,
        fpsHistory: [0, 0, 0, 0, 0, 0, 0],
        isAdaptativeQualityEnabled: true,
        smoothFrameRate: 0,
        currentFpsHistoryId: 0,
        isRunning: true,
        myCanvas: undefined,
        animationContainer: undefined,
        width: 0,
        height: 0,
        onNewConfigurationCallback: undefined,
        // GUI stuff
        gui: undefined,
        isGuiVisible: false,
        guiContainer: undefined
    };

    var animFunctions = {
        decreaseQuality: undefined,
        increaseQuality: undefined,
        draw: undefined
    };
    var overridenFunctions = {
        setOnNewConfigurationCallback: function setOnNewConfigurationCallback(p) {
            return function (onNewConfigurationCallback) {
                animation.onNewConfigurationCallback = onNewConfigurationCallback;
            };
        },
        setup: function setup(p) {
            return function () {
                // Create the canvas
                animation.myCanvas = p.createCanvas(animation.width, animation.height);
                animation.myCanvas.parent(animation.animationContainer);
                p.frameRate(60);
            };
        },
        draw: function draw(p) {
            return function () {
                if (!animation.isRunning || p.frameRate() < 1 || !p.frameRate()) return;
                // Update the pixel density parameter
                if (animation.lastPixelDensity != animation.pixelDensity) {
                    animation.lastPixelDensity = animation.pixelDensity;
                    p.pixelDensity(animation.pixelDensity);
                }
                // Update the smoothed out frameRate
                animation.fpsHistory[animation.currentFpsHistoryId] = p.frameRate();
                animation.currentFpsHistoryId = (animation.currentFpsHistoryId + 1) % animation.fpsHistory.length;
                animation.smoothFrameRate = animation.fpsHistory.reduce(function (a, b) {
                    return a + b;
                }) / animation.fpsHistory.length;
                // Adaptative quality
                if (animation.isAdaptativeQualityEnabled) {
                    if (animation.smoothFrameRate < 25) {
                        decreaseQuality();
                    } else if (animation.smoothFrameRate > 30) {
                        increaseQuality();
                    }
                }
                // Update the gui
                if (animation.gui !== undefined) {
                    for (var i in animation.gui.__controllers) {
                        animation.gui.__controllers[i].updateDisplay();
                    }
                }
                animFunctions.draw();
            };
        },
        getCanvas: function getCanvas() {
            return function () {
                return animation.myCanvas;
            };
        },
        getWidth: function getWidth() {
            return function () {
                return animation.width;
            };
        },
        getHeight: function getHeight() {
            return function () {
                return animation.height;
            };
        },
        updateDimensions: function updateDimensions() {
            return this.updateDimensions;
        },
        toggleAnimation: function toggleAnimation() {
            return this.toggleAnimation;
        },
        isAnimationRunning: function isAnimationRunning() {
            return this.isAnimationRunning;
        },
        toggleGui: function toggleGui() {
            return this.toggleGui;
        },
        isGuiVisible: function isGuiVisible() {
            return this.isGuiVisible;
        }
    };

    function decreaseQuality() {
        if (!animFunctions.decreaseQuality()) {
            // First let the user code decrease quality
            if (animation.pixelDensity > 0.5) {
                // Then decrease pixelDensity
                animation.pixelDensity -= 0.01;
            }
        }
    }
    function increaseQuality() {
        if (animation.pixelDensity < 1) {
            animation.pixelDensity += 0.01;
        } else {
            // Let user code increase quality back after our own deoptimization
            animFunctions.increaseQuality();
        }
    }
    this.toggleAnimation = function () {
        animation.isRunning = !animation.isRunning;
    };
    this.isAnimationRunning = function () {
        return animation.isRunning;
    };
    this.toggleGui = function () {
        animation.isGuiVisible = !animation.isGuiVisible;
        if (animation.isGuiVisible) {
            animation.guiContainer.style.visibility = 'visible';
        } else {
            animation.guiContainer.style.visibility = 'hidden';
        }
    };
    this.isGuiVisible = function () {
        return animation.isGuiVisible;
    };

    this.updateDimensions = function () {
        animation.width = animation.animationContainer.clientWidth;
        animation.height = animation.animationContainer.clientHeight;
    };

    this.createSketch = function (builder) {
        var preset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var animationContainer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'animation-container';
        var guiContainer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'gui-container';

        if (!builder) {
            throw new Error('No animation builder was provided.');
        }

        if (typeof animationContainer === 'string') {
            animation.animationContainer = document.getElementById(animationContainer);
            if (!animation.animationContainer) {
                animation.animationContainer = document.body;
            }
        } else {
            animation.animationContainer = animationContainer;
        }

        if (typeof guiContainer === 'string') {
            animation.guiContainer = document.getElementById(guiContainer);
        } else {
            animation.guiContainer = guiContainer;
        }

        _this.updateDimensions();

        // Create the p5 sketch
        new p5(function (p) {
            // Override some functions with our own
            var overridenFunctionsKeys = Object.keys(overridenFunctions);
            for (var key in overridenFunctions) {
                p[key] = overridenFunctions[key](p);
            }

            builder(p);

            // Retrieve the functions needed by the framework
            var animFunctionsKeys = Object.keys(animFunctions);
            for (var _key in p) {
                if (animFunctionsKeys.indexOf(_key) !== -1) {
                    animFunctions[_key] = p[_key];
                }
            }
            // Override a second time after having retrieved the functions
            for (var _key2 in overridenFunctions) {
                p[_key2] = overridenFunctions[_key2](p);
            }
        }, animation.animationContainer);

        if (animation.onNewConfigurationCallback && preset) {
            animation.onNewConfigurationCallback(preset);
        }

        // Add GUI data if the required library is present
        if (dat !== undefined) {
            animation.gui = new dat.GUI({ autoPlace: false });
            animation.guiContainer.appendChild(animation.gui.domElement);
            animation.guiContainer.style.visibility = 'hidden';

            animation.gui.add(animation, 'pixelDensity', 0, 2);
            animation.gui.add(animation, 'smoothFrameRate');
            animation.gui.add(animation, 'isAdaptativeQualityEnabled');
        }
    };
};