import { supabase } from './supabase.js';
import { mostrarRegistro } from './register.js';
import { Home } from './Home.js';

export function mostrarLogin() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <section class="login-container">
      <h2>Iniciar sesión</h2>

      <form id="login-form">
        <input type="email" name="correo" placeholder="Correo electrónico" required />
        <input type="password" name="password" placeholder="Contraseña" required />
        <button type="submit">Ingresar</button>
      </form>
      

      <p id="error" class="error"></p>

      <div class="link">
        ¿No tienes cuenta? <button id="ir-registro" class="link-btn">Crear cuenta</button>
      </div>
    </section>
  `;

  const form = document.getElementById('login-form');
  const errorMsg = document.getElementById('error');
  const irRegistro = document.getElementById('ir-registro');

  // Cambiar a registro
  irRegistro.addEventListener('click', () => {
    mostrarRegistro();
  });

  // Hacer login
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const correo = form.correo.value.trim();
    const password = form.password.value.trim();

    if (!correo || !password) {
      errorMsg.textContent = 'Por favor llena todos los campos.';
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    });
    console.log(correo, password);
    console.log("Correo enviado a login:", `"${correo}"`);
console.log("Password enviado a login:", `"${password}"`);



    if (error) {
      errorMsg.textContent = 'Error al iniciar sesión: ' + error.message;
      return;
    }

    // Guardar sesión en localStorage
    localStorage.setItem("user", JSON.stringify(data.user));

    // Ir al feed
    console.log("Intentando cargar Home...");
Home();

  });
}
