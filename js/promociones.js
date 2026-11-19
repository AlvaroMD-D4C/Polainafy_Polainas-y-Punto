const cubierta = document.querySelector('#cubierta-rasca');
const contexto = cubierta.getContext('2d', { willReadFrequently: true });
const premio = document.querySelector('#premio');
const descuento = document.querySelector('#descuento');
const codigo = document.querySelector('#codigo');
const accion = document.querySelector('#accion-rasca');
const estado = document.querySelector('#estado-rasca');
const instrucciones = document.querySelector('#instrucciones-rasca');
const confeti = document.querySelector('#confeti-rasca');
const porcentajes = [5, 10, 15, 20];
const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let revelado = false;
let hayPremio = false;
let granPremio = false;
let puntero = null;
let puntoAnterior = null;

function prepararRasca() {
  const tirada = Math.floor(Math.random() * 2000);
  granPremio = tirada === 1999;
  hayPremio = tirada >= 500;
  confeti.replaceChildren();
  document.documentElement.classList.remove('rasca-gran-premio');

  if (granPremio) {
    descuento.textContent = '¡Toda la tienda gratis!';
  } else if (hayPremio) {
    const porcentaje = porcentajes[Math.floor(Math.random() * porcentajes.length)];
    descuento.textContent = porcentaje + ' % de descuento';
  } else {
    descuento.textContent = 'Esta vez no hay premio';
  }

  codigo.textContent = '';
  codigo.hidden = !hayPremio;
  if (hayPremio) {
    const sufijo = Array.from({ length: 6 }, () =>
      caracteres[Math.floor(Math.random() * caracteres.length)]
    ).join('');
    codigo.textContent = (granPremio ? 'DEMO-GRATIS-' : 'DEMO-') + sufijo;
  }

  premio.hidden = false;
  premio.setAttribute('aria-hidden', 'true');
  revelado = false;
  puntero = null;
  puntoAnterior = null;
  accion.textContent = 'Revelar código';
  instrucciones.textContent = contexto
    ? 'Desliza el dedo o el ratón por la zona rayada.'
    : 'Pulsa el botón para descubrir tu código.';
  estado.textContent = '';

  if (contexto) {
    cubierta.hidden = false;
    contexto.fillStyle = '#f7bb8b';
    contexto.fillRect(0, 0, cubierta.width, cubierta.height);
    contexto.strokeStyle = '#ffe2c7';
    contexto.lineWidth = 7;

    for (let x = -cubierta.height; x < cubierta.width; x += 24) {
      contexto.beginPath();
      contexto.moveTo(x, cubierta.height);
      contexto.lineTo(x + cubierta.height, 0);
      contexto.stroke();
    }

    contexto.fillStyle = '#fff6ed';
    contexto.fillRect(117, 49, 166, 47);
    contexto.fillStyle = '#742b08';
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';
    contexto.font = 'bold 20px system-ui, sans-serif';
    contexto.fillText('RASCA AQUÍ', 200, 73);
  } else {
    cubierta.hidden = true;
    premio.hidden = true;
  }
}

function celebrarPremio() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const colores = ['#ffd18c', '#fff6ed', '#ff8a47', '#ffdf66', '#ffd1dc'];
  const cantidad = granPremio ? 70 : 32;

  for (let indice = 0; indice < cantidad; indice += 1) {
    const pieza = document.createElement('span');
    pieza.style.left = (Math.random() * 100) + '%';
    pieza.style.backgroundColor = colores[indice % colores.length];
    pieza.style.setProperty('--deriva', (Math.random() * 120 - 60) + 'px');
    pieza.style.animationDelay = (Math.random() * 450) + 'ms';
    pieza.style.animationDuration = (950 + Math.random() * 650) + 'ms';
    pieza.addEventListener('animationend', () => pieza.remove(), { once: true });
    confeti.append(pieza);
  }
}

function celebrarGranPremio() {
  const pagina = document.documentElement;
  const centroVisible = window.scrollY + window.innerHeight / 2;
  pagina.style.setProperty('--centro-giro', centroVisible + 'px');
  pagina.classList.add('rasca-gran-premio');
}

document.body.addEventListener('animationend', (evento) => {
  if (evento.animationName !== 'rasca-giro-pagina') return;
  document.documentElement.classList.remove('rasca-gran-premio');
  document.documentElement.style.removeProperty('--centro-giro');
});

function revelarRasca() {
  revelado = true;
  puntero = null;
  puntoAnterior = null;
  cubierta.hidden = true;
  premio.hidden = false;
  premio.removeAttribute('aria-hidden');
  instrucciones.textContent = hayPremio ? '¡Te ha tocado un premio de demo!' : 'Puedes probar suerte otra vez.';
  accion.textContent = 'Probar otro rasca';
  estado.textContent = descuento.textContent;
  if (hayPremio) {
    estado.textContent += ' Código de demo: ' + codigo.textContent;
    celebrarPremio();
    if (granPremio) celebrarGranPremio();
  }
}

function rascar(evento) {
  const rectangulo = cubierta.getBoundingClientRect();
  const x = (evento.clientX - rectangulo.left) * cubierta.width / rectangulo.width;
  const y = (evento.clientY - rectangulo.top) * cubierta.height / rectangulo.height;

  contexto.globalCompositeOperation = 'destination-out';
  contexto.beginPath();
  if (puntoAnterior) {
    contexto.lineWidth = 38;
    contexto.lineCap = 'round';
    contexto.moveTo(puntoAnterior.x, puntoAnterior.y);
    contexto.lineTo(x, y);
    contexto.stroke();
  } else {
    contexto.arc(x, y, 19, 0, Math.PI * 2);
    contexto.fill();
  }
  contexto.globalCompositeOperation = 'source-over';
  puntoAnterior = { x, y };

  const { data } = contexto.getImageData(0, 0, cubierta.width, cubierta.height);
  let muestras = 0;
  let borradas = 0;
  for (let fila = 4; fila < cubierta.height; fila += 8) {
    for (let columna = 4; columna < cubierta.width; columna += 8) {
      muestras += 1;
      if (data[(fila * cubierta.width + columna) * 4 + 3] < 128) {
        borradas += 1;
      }
    }
  }

  if (borradas / muestras >= 0.42) {
    revelarRasca();
  }
}

cubierta.addEventListener('pointerdown', (evento) => {
  if (!contexto || revelado || puntero !== null || evento.button !== 0) return;
  puntero = evento.pointerId;
  cubierta.setPointerCapture(puntero);
  rascar(evento);
});

cubierta.addEventListener('pointermove', (evento) => {
  if (evento.pointerId === puntero) rascar(evento);
});

cubierta.addEventListener('lostpointercapture', (evento) => {
  if (evento.pointerId === puntero) {
    puntero = null;
    puntoAnterior = null;
  }
});

accion.addEventListener('click', () => {
  if (revelado) {
    prepararRasca();
    estado.textContent = 'Nuevo rasca preparado.';
  } else {
    revelarRasca();
  }
});

prepararRasca();
accion.hidden = false;
