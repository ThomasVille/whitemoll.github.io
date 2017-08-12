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
    preset: 'default',
    timeFactor: 1,
    nbParticles: 0
};

let anim1 = new AnimBuilder();

// Check mobile browser
anim1.createSketch(NetworkAnimBuilder, desktopPreset);
anim1.hideGui();
let texts = [
    {text: "Particles", duration: 4000},
    {text: "Hi, I'm Thomas", duration: 4000},
    {text: 'Programmer', duration: 4000},
    {text: 'Looking for', duration: 4000},
    {text: 'an internship', duration: 4000},
    {text: 'February 2018', duration: 4000}
];
let currentTextId = 0;
function showNextText() {
    anim1.updateConfiguration({text: texts[currentTextId].text});
    if(currentTextId < texts.length-1) {
        setTimeout(showNextText, texts[currentTextId].duration);
        currentTextId++;
    }
}
setTimeout(launchAnimation, 4000);
/*if(!isMobileBrowser()) {
    anim2.createSketch(NetworkAnimBuilder, mobilePreset, 'animation-container2', 'gui-container2');
}*/

let domTweakAnimationBtn = document.getElementById('tweak-animation-btn');
let domReplayAnimationBtn = document.getElementById('replay-animation-btn');
let domToggleAnimationBtn = document.getElementById('toggle-animation-btn');
let domNameContainer = document.getElementById('name-container');

// Buttons listeners
domNameContainer.classList.add('visible');
domToggleAnimationBtn.onclick = onToggleAnimationClick;
domTweakAnimationBtn.onclick = onTweakClick;
domReplayAnimationBtn.onclick = onReplayAnimationClick;

function launchAnimation() {
    currentTextId = 0;
    showNextText();
    let totalDuration = texts.reduce((a, b) => a + b.duration, 0);
    setTimeout(() => {
        domReplayAnimationBtn.classList.add('visible');
    }, totalDuration);
}
function onTweakClick() {
    anim1.toggleGui();
    if(anim1.isGuiVisible()) {
        domNameContainer.classList.remove('visible');
        setTimeout(() => domNameContainer.style.display = 'none', 1000);
    } else {
        domNameContainer.style.display = 'flex';
        domNameContainer.classList.add('visible');
    }
}
function onToggleAnimationClick() {
    anim1.toggleAnimation();
    if(anim1.isAnimationRunning()) {
        this.innerHTML = 'Animation On';
    } else {
        this.innerHTML = 'Animation Off';
    }
}
function onReplayAnimationClick() {
    domReplayAnimationBtn.classList.remove('visible');
    launchAnimation();
}