import { supabase } from "./supabase.js";
import './style.css';

export async function Home() {
  const app = document.getElementById('app');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // HTML principal
  app.innerHTML = `
    <header class="header">
      <div class="logo">Reddit Clone - Hot en Canadá</div>
      <div class="user-info">
        <span>${user.email}</span>
        <button id="logout" class="btn-logout">Cerrar sesión</button>
        <button id="toggle-theme" class="btn-theme">🌙</button>
      </div>
    </header>

    <div class="feed">
      <div class="create-post">
        <h3>Crear un nuevo post</h3>
        <form id="create-post-form">
          <input type="text" name="subreddit" placeholder="Subreddit" required>
          <input type="text" name="titulo" placeholder="Título del post" required>
          <input type="file" name="imagen">
          <button type="submit">Publicar</button>
        </form>
        <p id="post-error" class="post-error"></p>
      </div>

      <div class="posts-container"></div>
    </div>
  `;

// 🔥 Inicializar modo claro/oscuro aquí
const themeBtn = document.getElementById('toggle-theme');
const currentTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(currentTheme);

themeBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

themeBtn.addEventListener('click', () => {
  const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(newTheme);
  localStorage.setItem('theme', newTheme);
  themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});


  // Logout
  document.getElementById('logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    location.reload();
  });

  // Crear post
  const form = document.getElementById('create-post-form');
  const errorMsg = document.getElementById('post-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const titulo = form.titulo.value.trim();
    const subreddit = form.subreddit.value.trim();
    const file = form.imagen.files[0];
    let imagenURL = null;

    if (file) {
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(`${user.id}/${Date.now()}_${file.name}`, file, { upsert: true });
      if (error) {
        errorMsg.textContent = 'Error subiendo imagen: ' + error.message;
        return;
      }
      const { data: urlData } = supabase.storage.from('posts').getPublicUrl(data.path);
      imagenURL = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from('posts').insert([{
      titulo,
      subreddit,
      imagen: imagenURL,
      votos: 0,
      comentarios: 0,
      creado_en: new Date(),
      user_id: user.id
    }]);

    if (insertError) {
      errorMsg.textContent = 'Error creando post: ' + insertError.message;
      return;
    }

    form.reset();

    
    await renderPosts();
  });
  
  function renderStaticPosts() {
  const container = document.querySelector('.posts-container');

  const staticPosts = [
    {
      subreddit: 'r/facepalm • hace 6h',
      titulo: '¿La película de Barbie es realmente tan inapropiada en sus primeros 15 minutos?',
      imagen: 'https://i.pinimg.com/736x/99/d9/f5/99d9f5b219672fbb51f0b01c6850bc94.jpg',
      votos: '20K',
      comentarios: '7.2K comentarios',
      promocionado: false
    },
    {
      subreddit: 'r/memes • hace 5h',
      titulo: 'Dios perdona pero yo no 💥',
      imagen: 'https://i.pinimg.com/736x/b4/d7/3b/b4d73bf2d511eaf1dd6ea72a0fb1f05c.jpg',
      votos: '12K',
      comentarios: '2.4K comentarios',
      promocionado: false
    },
    {
      subreddit: 'r/memes • hace 4h',
      titulo: 'Miss Putito 😂',
      imagen: 'https://i.pinimg.com/736x/24/1a/3b/241a3bffd4bc3474866e8849d8a78d0e.jpg',
      votos: '8.5K',
      comentarios: '1.1K comentarios',
      promocionado: false
    },
    {
      subreddit: 'r/futbol • hace 3h',
      titulo: 'Messi con la copa 🏆 mientras CR7 llora',
      imagen: 'https://i.pinimg.com/736x/3b/b3/10/3bb310a715c1a305b2ba25ff73bb4213.jpg',
      votos: '25K',
      comentarios: '6.7K comentarios',
      promocionado: false
    },
    {
      subreddit: 'r/futbolstats • hace 2h',
      titulo: 'El Barça le metió 16 goles al Madrid en la temporada 2025 😱',
      imagen: 'https://i.pinimg.com/736x/05/f9/34/05f9344617f5e388fdf3f601ec2aef59.jpg',
      votos: '18K',
      comentarios: '4.2K comentarios',
      promocionado: false
    },
    {
      subreddit: 'r/random • hace 1h',
      titulo: 'Post sorpresa de Rapha ✨',
      imagen: 'https://i.pinimg.com/736x/06/4d/54/064d548a602fec00a9363089d9d846e4.jpg',
      votos: '10K',
      comentarios: '900 comentarios',
      promocionado: false
    },
    {
      subreddit: 'r/messi • hace 50min',
      titulo: 'Meme random de Messi 🐐',
      imagen: 'https://i.pinimg.com/736x/25/cf/0a/25cf0ae42c21b7f10ff572c3e5373e30.jpg',
      votos: '14K',
      comentarios: '2.2K comentarios',
      promocionado: false
    },
    {
      subreddit: 'r/futbol • hace 30min',
      titulo: 'La tijera brutal de Luiz Díaz con el Bayern 🔥',
      imagen: 'https://i.pinimg.com/1200x/25/f0/6e/25f06e1d16bc537e300becd0282f1177.jpg',
      votos: '22K',
      comentarios: '5.3K comentarios',
      promocionado: false
    },
    {
      subreddit: 'r/gaming • hace 20min',
      titulo: 'CJ y Big Smoke jugando videojuegos 🎮',
      imagen: 'https://i.pinimg.com/736x/56/9f/a1/569fa1aff0bfff1ea06b702f95fbfd53.jpg',
      votos: '30K',
      comentarios: '9.8K comentarios',
      promocionado: false
    },
    {
      subreddit: 'r/boca • hace 10min',
      titulo: 'Meme de Davo Xeneize 💙💛',
      imagen: 'https://i.pinimg.com/736x/32/bb/f8/32bbf832648ce7813b4e791983cfdc46.jpg',
      votos: '11K',
      comentarios: '1.5K comentarios',
      promocionado: false
    }
  ];

  staticPosts.forEach(post => {
    const postEl = document.createElement('div');
    postEl.classList.add('post');

    postEl.innerHTML = `
      <div class="post-header">
        <span class="subreddit">${post.subreddit}</span>
        <button class="join-btn">${post.promocionado ? 'Registrarse' : 'Unirse'}</button>
      </div>
      <div class="post-content">
        <div class="post-title">${post.titulo}</div>
        <img src="${post.imagen}" alt="Imagen del post" class="post-image">
      </div>
      <div class="post-footer">
        <div class="votes">
          <button>⬆️</button>
          <span>${post.votos}</span>
          <button>⬇️</button>
        </div>
        <div class="comments">${post.comentarios}</div>
      </div>
    `;

    container.appendChild(postEl);
  });
}

  // Función para traer posts
  async function fetchPosts() {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('creado_en', { ascending: false });
    if (error) {
      console.error("Error al traer posts:", error);
      return [];
    }
    return posts;
  }

  // Función para renderizar posts
  async function renderPosts() {
    const posts = await fetchPosts();
    const container = document.querySelector('.posts-container');
    container.innerHTML = '';

    posts.forEach(post => {
      const postEl = document.createElement('div');
      postEl.classList.add('post');

      postEl.innerHTML = `
        <div class="post-header">
          <span class="subreddit">${post.subreddit || 'r/general'} • ${new Date(post.creado_en).toLocaleString()}</span>
          <button class="join-btn">Unirse</button>
        </div>
        <div class="post-content">
          <div class="post-title">${post.titulo}</div>
          ${post.imagen 
            ? `<img src="${post.imagen}" alt="Imagen del post" class="post-image">` 
            : `<div class="image-placeholder">Sin imagen</div>`}
        </div>
        <div class="post-footer">
          <div class="votes">
            <button class="upvote">⬆️</button>
            <span class="vote-count">${post.votos || 0}</span>
            <button class="downvote">⬇️</button>
          </div>
          <div class="comments">${post.comentarios || 0} comentarios</div>
        </div>
      `;

      postEl.querySelector('.upvote').addEventListener('click', async () => await vote(post, 1, postEl));
      postEl.querySelector('.downvote').addEventListener('click', async () => await vote(post, -1, postEl));

      container.appendChild(postEl);
    });
  }

  // Función de votación
  async function vote(post, delta, postEl) {
    const { error } = await supabase
      .from('posts')
      .update({ votos: post.votos + delta })
      .eq('id', post.id);
    if (!error) {
      post.votos += delta;
      postEl.querySelector('.vote-count').textContent = post.votos;
    }
  }

  await renderPosts();
  await renderPosts();
renderStaticPosts();
}