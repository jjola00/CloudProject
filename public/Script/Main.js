const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sizeEl = document.getElementById('size');
const colorEl = document.getElementById('color');
const clearEl = document.getElementById('clear');
const increaseBtn = document.getElementById('increase');
const decreaseBtn = document.getElementById('decrease');
const saveBtn = document.getElementById('save');
const galleryBtn = document.getElementById('view-gallery');
const galleryDiv = document.getElementById('gallery');

let size = 30;
let x = undefined;
let y = undefined;
let color = 'black';
let isPressed = false;

canvas.addEventListener('mousedown', (e) => {
    isPressed = true;
    x = e.offsetX;
    y = e.offsetY;
});

canvas.addEventListener('mouseup', () => {
    isPressed = false;
    x = undefined;
    y = undefined;
});

canvas.addEventListener('mousemove', (e) => {
    if (isPressed) {
        const x2 = e.offsetX;
        const y2 = e.offsetY;
        drawCircle(x2, y2);
        drawLine(x, y, x2, y2);
        x = x2;
        y = y2;
    }
});

function drawCircle(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 2;
    ctx.stroke();
}

increaseBtn.addEventListener('click', () => {
    size += 5;
    if (size > 50) {
        size = 50;
    }
    updateSizeOnScreen();
});

decreaseBtn.addEventListener('click', () => {
    size -= 5;
    if (size < 5) {
        size = 5;
    }
    updateSizeOnScreen();
});

colorEl.addEventListener('change', (e) => {
    color = e.target.value;
});

clearEl.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

saveBtn.addEventListener('click', saveDrawing);
galleryBtn.addEventListener('click', loadGallery);

function updateSizeOnScreen() {
    sizeEl.innerText = size;
}

function saveDrawing() {
    const dataURL = canvas.toDataURL('image/png');
    fetch('/save-drawing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: dataURL })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Drawing saved successfully!');
        }
    });
}

function loadGallery() {
    fetch('/gallery')
    .then(response => response.json())
    .then(data => {
        galleryDiv.innerHTML = '';
        data.images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            galleryDiv.appendChild(img);
        });
    });
}
