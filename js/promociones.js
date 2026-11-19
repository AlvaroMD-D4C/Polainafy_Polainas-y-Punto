(() => {
  const cubierta = document.getElementById('cubierta-rasca');
  const contexto = cubierta.getContext('2d', { willReadFrequently: true });
  const premio = document.getElementById('premio');
  const boton = document.getElementById('accion-rasca');
  const descuento = document.getElementById('descuento');
  const codigo = document.getElementById('codigo');
  const estado = document.getElementById('estado-rasca');
  const instrucciones = document.getElementById('instrucciones-rasca');
  const { width: ancho, height: alto } = cubierta;

  descuento.textContent = '10 % de descuento';
  codigo.textContent = 'POLAINA10';
  premio.setAttribute('aria-hidden', 'true');
  premio.hidden = false;
  boton.hidden = false;

  function revelar() {
    cubierta.hidden = true;
    premio.removeAttribute('aria-hidden');
    boton.disabled = true;
    boton.textContent = 'Código revelado';
    instrucciones.textContent = 'Has descubierto tu código de demostración.';
    estado.textContent = descuento.textContent + '. Código ' + codigo.textContent + '.';
  }

  boton.addEventListener('click', revelar);
  if (!contexto) {
    revelar();
    return;
  }

  contexto.fillStyle = '#b7afa7';
  contexto.fillRect(0, 0, ancho, alto);
  contexto.strokeStyle = '#d5cec7';
  contexto.lineWidth = 4;
  contexto.beginPath();
  for (let x = -alto; x < ancho; x += 12) {
    contexto.moveTo(x, alto);
    contexto.lineTo(x + alto, 0);
  }
  contexto.stroke();

  contexto.globalCompositeOperation = 'destination-out';
  contexto.lineWidth = 36;
  contexto.lineCap = 'round';
  let puntero = null;
  let anterior;
  let ultimaComprobacion = 0;

  function posicion(evento) {
    const zona = cubierta.getBoundingClientRect();
    return {
      x: (evento.clientX - zona.left) * ancho / zona.width,
      y: (evento.clientY - zona.top) * alto / zona.height
    };
  }

  function comprobarSuperficie() {
    const pixeles = contexto.getImageData(0, 0, ancho, alto).data;
    let borrados = 0;
    for (let i = 3; i < pixeles.length; i += 4) {
      if (pixeles[i] < 128) borrados++;
    }
    if (borrados >= ancho * alto * 0.45) revelar();
  }

  cubierta.addEventListener('pointerdown', (evento) => {
    if (puntero !== null || evento.button !== 0) return;
    puntero = evento.pointerId;
    cubierta.setPointerCapture(puntero);
    anterior = posicion(evento);
    contexto.beginPath();
    contexto.arc(anterior.x, anterior.y, contexto.lineWidth / 2, 0, 2 * Math.PI);
    contexto.fill();
  });

  cubierta.addEventListener('pointermove', (evento) => {
    if (evento.pointerId !== puntero || cubierta.hidden) return;
    const actual = posicion(evento);
    contexto.beginPath();
    contexto.moveTo(anterior.x, anterior.y);
    contexto.lineTo(actual.x, actual.y);
    contexto.stroke();
    anterior = actual;
    if (evento.timeStamp - ultimaComprobacion >= 100) {
      ultimaComprobacion = evento.timeStamp;
      comprobarSuperficie();
    }
  });

  cubierta.addEventListener('lostpointercapture', (evento) => {
    if (evento.pointerId !== puntero) return;
    puntero = null;
    if (!cubierta.hidden) comprobarSuperficie();
  });
})();