const monitorSizeDropDown = document.getElementById('monitor-size');
const faceDistanceDropDown = document.getElementById('face-distance');
const cameraPositionDropDown = document.getElementById('camera-position');

const savedSettings = JSON.parse(localStorage.getItem('seeso_settings')) || {};

function createOptions(iteration, selected, parent, unit) {
    const option = document.createElement('option');
    option.innerText = `${iteration} ${unit}`;
    option.value = iteration;
    if (iteration === selected) option.selected = true;
    parent.appendChild(option);
    return option;
}

for (let i = 13; i <= 35; i++) {
    createOptions(i, Number(savedSettings.monitorSize) || 21, monitorSizeDropDown, 'Inch');
}

for (let i = 30; i <= 70; i += 10) {
    createOptions(i, Number(savedSettings.faceDistance) || 40, faceDistanceDropDown, 'cm');
}

[...document.querySelectorAll('.layout-link')].forEach(link => {
    link.addEventListener('click', () => {
        const monitorSize = monitorSizeDropDown.value;
        const faceDistance = faceDistanceDropDown.value;
        const cameraPosition = cameraPositionDropDown.value;
        localStorage.setItem('seeso_settings', JSON.stringify({ monitorSize, faceDistance, cameraPosition }));
    });
});
