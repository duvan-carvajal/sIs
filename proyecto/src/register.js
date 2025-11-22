import './register.css';
import { supabase } from './supabase.js';

export function mostrarRegistro() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section>
      <h2>Crear cuenta</h2>
      <form id="registro-form">

        <input type="text" name="username" placeholder="Nombre de usuario" required />
        <input type="email" name="correo" placeholder="Correo electrónico" required />
        <input type="password" name="password" placeholder="Contraseña" required />

        <button type="submit">Registrarse</button>
        

      </form>
      <button id="btnGoLogin" class="btn-secondary">Ya tengo cuenta</button>

      <p id="error" style="color:red;"></p>
    </section>
  `;
  document.getElementById("btnGoLogin").addEventListener("click", () => {
    import("./login.js").then(mod => {
        mod.mostrarLogin();  // Llama a la función del login
    });
});



  const form = document.getElementById('registro-form');
  const errorMsg = document.getElementById('error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const username = form.username.value.trim();
    const correo = form.correo.value.trim();
    const password = form.password.value.trim();

    if (!username || !correo || !password) {
      errorMsg.textContent = 'Por favor completa todos los campos.';
      return;
    }

    // 1️⃣ Crear usuario en Supabase Auth
    const { data: dataAuth, error: errorAuth } = await supabase.auth.signUp({
      email: correo,
      password: password,
    });
    console.log('dataAuth:', dataAuth);
console.log('errorAuth:', errorAuth);


    if (errorAuth) {
      errorMsg.textContent = `Error al registrar usuario: ${errorAuth.message}`;
      return;
    }

    const uid = dataAuth.user?.id;
    if (!uid) {
      errorMsg.textContent = 'No se pudo obtener el ID del usuario.';
      return;
    }

    // 2️⃣ Guardar datos en tabla "usuarios"
    const { error: errorInsert } = await supabase.from('usuarios').insert([
      {
        id: uid,
        username,
        email: correo
      },
    ]);

    if (errorInsert) {
      errorMsg.textContent = 'Error guardando información del usuario: ' + errorInsert.message;
      return;
    }

    alert('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
  });
}
