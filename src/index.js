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

var desktopPreset = {
    lineColor: {r: 255, g: 255, b: 255},
    backgroundColor: {r: 11, g: 70, b: 80},
    backgroundSpeed: 0.06,
    maxLinks: 100,
    timeFactor: 1,
    nbParticles: 0
    
};
var mobilePreset = {
    lineColor: {r: 255, g: 255, b: 255},
    backgroundColor: {r: 11, g: 70, b: 80},
    backgroundSpeed: 0,
    maxLinks: 100,
    timeFactor: 1,
    nbParticles: 0
};

let anim1 = new AnimBuilder();
let anim2 = new AnimBuilder();

// Check mobile browser
anim1.createSketch(NetworkAnimBuilder, desktopPreset);
anim2.createSketch(NetworkAnimBuilder, mobilePreset, 'animation-container2', 'gui-container2');

let domTweakAnimationBtn = document.getElementById('tweak-animation-btn');
let domNameContainer = document.getElementById('name-container');
let domToggleAnimationBtn = document.getElementById('toggle-animation-btn');

// Buttons listeners
domNameContainer.classList.add('visible');
domToggleAnimationBtn.onclick = onToggleAnimationClick;
domTweakAnimationBtn.onclick = onTweakClick;

function onTweakClick() {
    anim1.toggleGui();
    anim2.toggleGui();
    if(anim1.isGuiVisible()) {
        domNameContainer.classList.remove('visible');
    } else {
        domNameContainer.classList.add('visible');
    }
}
function onToggleAnimationClick() {
    anim1.toggleAnimation();
    anim2.toggleAnimation();
    if(anim1.isAnimationRunning()) {
        this.innerHTML = 'Animation On';
    } else {
        this.innerHTML = 'Animation Off';            
    }
}