// Añade más fotos a esta lista para ampliar el carrusel.
const fotos = [
  { src: 'img/polainas.png', alt: 'Polainas naranjas y negras sobre unas botas en la montaña' },
  { src: 'img/montana.jpg', alt: 'Paisaje de montañas con cumbres rocosas' }
];
let fotoActual = 0;
const imagen = document.getElementById('foto-carrusel');
const contador = document.getElementById('contador-fotos');

function mostrarFoto() {
  imagen.src = fotos[fotoActual].src;
  imagen.alt = fotos[fotoActual].alt;
  contador.textContent = 'Foto ' + (fotoActual + 1) + ' de ' + fotos.length;
}

document.getElementById('anterior').addEventListener('click', function () {
  fotoActual = (fotoActual - 1 + fotos.length) % fotos.length;
  mostrarFoto();
});

document.getElementById('siguiente').addEventListener('click', function () {
  fotoActual = (fotoActual + 1) % fotos.length;
  mostrarFoto();
});
