import { Pilota } from "./pilota.js";

// Configuración del canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

// Funciones auxiliares
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRGB() {
    return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

// Creación de 20 pelotas como especifica el PDF (no 25)
const pilotes = [];

for (let i = 0; i < 20; i++) {
    const mida = random(10, 20);
    const x = random(mida, width - mida);
    const y = random(mida, height - mida);
    const velX = random(-4, 4);
    const velY = random(-4, 4);
    const color = randomRGB();

    pilotes.push(new Pilota(x, y, velX, velY, color, mida));
}

// Función loop como especifica el PDF
function loop() {
    // Limpiar el canvas con negro
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // Actualizar y dibujar cada pelota
    for (let i = 0; i < pilotes.length; i++) {
        pilotes[i].dibuixa(ctx);
        pilotes[i].mou(width, height);
        
        // Detección de colisiones (solo con pelotas siguientes para optimizar)
        for (let j = i + 1; j < pilotes.length; j++) {
            pilotes[i].colisio(pilotes[j]);
        }
    }

    requestAnimationFrame(loop);
}

// Iniciar la animación
loop();