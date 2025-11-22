import './style.css';
// main.js
import { mostrarRegistro } from './register.js';
import { mostrarLogin } from './login.js';
// (importas otros componentes que hagas)

function router(ruta) {
  const app = document.getElementById('app');

  switch (ruta) {
    case 'registro':
      mostrarRegistro();
      break;

    case 'login':
      mostrarLogin();
      break;

    default:
      app.innerHTML = '<h1>Pantalla principal</h1>';
  }
}

// Navegar según botones
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-route]')) {
    const ruta = e.target.dataset.route;
    router(ruta);
  }
});

// Pantalla inicial
router('registro');

