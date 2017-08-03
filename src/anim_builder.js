function AnimBuilder() {
    let animation = {
        pixelDensity: 1,
        lastPixelDensity: 1,
        fpsHistory: [0,0,0,0,0,0,0],
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

    
    
    let animFunctions = {
        decreaseQuality: undefined,
        increaseQuality: undefined,
        draw: undefined
    };
    let overridenFunctions = {
        setOnNewConfigurationCallback(p) {
            return (onNewConfigurationCallback) => {
                animation.onNewConfigurationCallback = onNewConfigurationCallback;
            };
        },
        setup(p) {
            return () => {
                // Create the canvas
                animation.myCanvas = p.createCanvas(animation.width, animation.height);
                animation.myCanvas.parent(animation.animationContainer);
                p.frameRate(60);
            };
        },
        draw(p) {
            return () => {
                if(!animation.isRunning || p.frameRate() < 1 || !p.frameRate()) return;
                // Update the pixel density parameter
                if(animation.lastPixelDensity != animation.pixelDensity) {
                    animation.lastPixelDensity = animation.pixelDensity;
                    p.pixelDensity(animation.pixelDensity);
                }
                // Update the smoothed out frameRate
                animation.fpsHistory[animation.currentFpsHistoryId] = p.frameRate();
                animation.currentFpsHistoryId = (animation.currentFpsHistoryId+1)%animation.fpsHistory.length;
                animation.smoothFrameRate = animation.fpsHistory.reduce((a, b) => a+b)/animation.fpsHistory.length;
                // Adaptative quality
                if(animation.isAdaptativeQualityEnabled) {
                    if(animation.smoothFrameRate < 25) {
                        decreaseQuality();
                    } else if (animation.smoothFrameRate > 30) {
                        increaseQuality();
                    }
                }
                // Update the gui
                if(animation.gui !== undefined) {
                    for (let i in animation.gui.__controllers) {
                        animation.gui.__controllers[i].updateDisplay();
                    }
                }
                animFunctions.draw();
            };
        },
        getCanvas() {
            return () => {
                return animation.myCanvas;
            };        
        },
        getWidth() {
            return () => {
                return animation.width;
            };
        },
        getHeight() {
            return () => {
                return animation.height;
            };
        },
        updateDimensions() {
            return this.updateDimensions;
        },
        toggleAnimation() {
            return this.toggleAnimation;
        },
        isAnimationRunning() {
            return this.isAnimationRunning;
        },
        toggleGui() {
            return this.toggleGui;
        },
        isGuiVisible() {
            return this.isGuiVisible;
        }
    }

    function decreaseQuality() {
        if(!animFunctions.decreaseQuality()) {
            // First let the user code decrease quality
            if(animation.pixelDensity > 0.5) {
                // Then decrease pixelDensity
                animation.pixelDensity -= 0.01;
            }
        }
    }
    function increaseQuality() {
        if(animation.pixelDensity < 1) {
            animation.pixelDensity += 0.01;
        } else {
            // Let user code increase quality back after our own deoptimization
            animFunctions.increaseQuality();
        }
    }
    this.toggleAnimation = () => {
        animation.isRunning = !animation.isRunning;
    }
    this.isAnimationRunning = () => {
        return animation.isRunning;
    }
    this.toggleGui = () => {
        animation.isGuiVisible = !animation.isGuiVisible;
        if(animation.isGuiVisible) {
            animation.guiContainer.style.visibility = 'visible';
        } else {
            animation.guiContainer.style.visibility = 'hidden';
        }
    }
    this.isGuiVisible = () => {
        return animation.isGuiVisible;
    }

    this.updateDimensions = () => {
        animation.width = animation.animationContainer.clientWidth;
        animation.height = animation.animationContainer.clientHeight;
    }

    this.createSketch = (builder, preset = null, animationContainer = 'animation-container', guiContainer = 'gui-container') => {
        if(!builder) {
            throw new Error('No animation builder was provided.');
        }

        if(typeof animationContainer === 'string') {
            animation.animationContainer = document.getElementById(animationContainer);
            if(!animation.animationContainer) {
                animation.animationContainer = document.body;
            }
        } else {
            animation.animationContainer = animationContainer;
        }

        if(typeof guiContainer === 'string') {
            animation.guiContainer = document.getElementById(guiContainer);
        } else {
            animation.guiContainer = guiContainer;
        }

        this.updateDimensions();

        // Create the p5 sketch
        new p5((p) => {
            // Override some functions with our own
            let overridenFunctionsKeys = Object.keys(overridenFunctions);
            for(let key in overridenFunctions) {
                p[key] = overridenFunctions[key](p);
            }

            builder(p);

            // Retrieve the functions needed by the framework
            let animFunctionsKeys = Object.keys(animFunctions);
            for(let key in p) {
                if(animFunctionsKeys.indexOf(key) !== -1) {
                    animFunctions[key] = p[key];
                }
            }
            // Override a second time after having retrieved the functions
            for(let key in overridenFunctions) {
                p[key] = overridenFunctions[key](p);
            }
        }, animation.animationContainer);
        
        if(animation.onNewConfigurationCallback && preset) {
            animation.onNewConfigurationCallback(preset);
        }

        // Add GUI data if the required library is present
        if(dat !== undefined) {
            animation.gui = new dat.GUI({ autoPlace: false });
            animation.guiContainer.appendChild(animation.gui.domElement);
            animation.guiContainer.style.visibility = 'hidden';

            animation.gui.add(animation, 'pixelDensity', 0, 2);
            animation.gui.add(animation, 'smoothFrameRate');
            animation.gui.add(animation, 'isAdaptativeQualityEnabled');
        }
    }
};