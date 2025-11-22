import { supabase } from "./supabase.js";

export async function Home() {
  const app = document.getElementById('app');
  const { data: { user } } = await supabase.auth.getUser(); // usuario actual autenticado


  if (!user) return; // seguridad: si no hay usuario, no mostrar home

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
          ${post.imagen ? `<img src="${post.imagen}" class="post-image">` : ''}
        </div>
        <div class="post-footer">
          <div class="votes">
            <button class="upvote">⬆</button>
            <span class="vote-count">${post.votos || 0}</span>
            <button class="downvote">⬇</button>
          </div>
          <div class="comments">${post.comentarios || 0} comentarios</div>
        </div>
      `;

      // Votaciones
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

  // HTML principal
  app.innerHTML = `
    <header class="header">
      <div class="logo">Reddit Clone</div>
      <div class="user-info">
        <span>${user?.email || 'Usuario'}</span>
        <button id="logout" class="btn-logout">Cerrar sesión</button>
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

    <style>
      * { margin:0; padding:0; box-sizing:border-box; font-family:'Roboto', sans-serif; }
      body { background:#f6f7f8; }
      .header { display:flex; justify-content:space-between; align-items:center; background:#ff4500; color:#fff; padding:1rem 2rem; position:sticky; top:0; z-index:10; }
      .logo { font-weight:bold; font-size:1.4rem; }
      .user-info { display:flex; align-items:center; gap:1rem; }
      .btn-logout { background:#fff; color:#ff4500; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; }
      .feed { max-width:600px; margin:2rem auto; padding:0 1rem; }
      .create-post { background:#fff; border-radius:12px; padding:1rem; margin-bottom:1.5rem; box-shadow:0 4px 12px rgba(0,0,0,0.06); }
      .create-post input[type=text], .create-post input[type=file] { width:100%; padding:0.5rem; margin-bottom:0.5rem; border-radius:6px; border:1px solid #ccc; }
      .create-post button { background:#ff4500; color:#fff; border:none; padding:0.5rem 1rem; border-radius:6px; cursor:pointer; }
      .post-error { color:red; margin-top:0.5rem; }
      .post { background:#fff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.06); margin-bottom:1.5rem; transition:transform 0.2s; }
      .post:hover { transform: translateY(-3px); }
      .post-header { display:flex; justify-content:space-between; padding:0.8rem 1rem; font-size:0.85rem; color:#555; border-bottom:1px solid #eee; }
      .subreddit { font-weight:bold; color:#000; }
      .join-btn { background:#ff4500; color:#fff; border:none; padding:0.3rem 0.7rem; border-radius:6px; cursor:pointer; font-size:0.75rem; }
      .post-content { padding:1rem; }
      .post-title { font-weight:bold; margin-bottom:0.5rem; font-size:1rem; }
      .post-image { width:100%; height:auto; border-radius:8px; margin-top:0.5rem; }
      .post-footer { display:flex; justify-content:space-between; align-items:center; padding:0.8rem 1rem; font-size:0.85rem; border-top:1px solid #eee; }
      .votes { display:flex; align-items:center; gap:0.5rem; }
      .votes button { background:none; border:none; font-size:1.2rem; cursor:pointer; color:#ff4500; }
      .vote-count { min-width:2rem; text-align:center; }
      .comments { color:#555; }
    </style>
  `;

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

  await renderPosts();
}
