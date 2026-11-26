
import { supabase } from './supabase.js';

// ==========================================
// 1. AUTENTICAÇÃO E DADOS DO MEMBRO
// ==========================================

document.documentElement.style.visibility = 'hidden';

const { data: { session }, error: sessionError } =
  await supabase.auth.getSession();

if (sessionError || !session) {
  window.location.replace('login.html');
  throw new Error('Membro não autenticado.');
}

const { data: { user }, error: userError } =
  await supabase.auth.getUser();

if (userError || !user) {
  window.location.replace('login.html');
  throw new Error('Não foi possível identificar o membro.');
}

document.documentElement.style.visibility = 'visible';

const ADMIN_ID = 'aae39bd5-700b-470b-bb1f-0315834e3f3d';
const isAdmin = user.id === ADMIN_ID;

let memberName = user.user_metadata?.full_name ||
  user.email?.split('@')[0] || 'Membro';

let memberProfile = null;

function gerarIniciais(nome) {
  return (nome || 'Membro')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(parte => parte[0])
    .join('')
    .toUpperCase();
}

function formatarData(data) {
  if (!data) return '';

  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('full_name, username, member_number, status, created_at')
  .eq('id', user.id)
  .single();

if (profileError) {
  console.error('Erro ao buscar perfil:', profileError);
}

memberProfile = profile;
memberName = profile?.full_name || memberName;

// ==========================================
// 2. DADOS AUTOMÁTICOS DA CARTEIRINHA
// ==========================================

function preencherCarteirinha(profile) {
  if (!profile) return;

  const numero = profile.member_number != null
    ? `#${String(profile.member_number).padStart(4, '0')}`
    : 'PENDENTE';

  const statusAtivo = profile.status === 'active';
  const status = statusAtivo ? 'ATIVO' : 'INATIVO';

  const dataEntrada = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : 'Não informado';

  const dataCurta = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric'
      }).replace('.', '').toUpperCase()
    : '---';

  const nome = (profile.full_name || memberName).toUpperCase();

  document.getElementById('cardMemberName').textContent = nome;
  document.getElementById('cardMemberNumber').textContent = numero;
  document.getElementById('cardMemberStatus').textContent = status;
  document.getElementById('cardMemberDate').textContent = dataCurta;

  document.getElementById('detailMemberNumber').textContent = numero;
  document.getElementById('detailMemberStatus').textContent =
    `● ${status}`;
  document.getElementById('detailMemberDate').textContent = dataEntrada;
}

preencherCarteirinha(profile);

// ==========================================
// 3. PREENCHER DADOS DO MEMBRO
// ==========================================

const nomeElemento = document.getElementById('memberName');
const avatarElemento = document.getElementById('memberAvatar');

if (nomeElemento) nomeElemento.textContent = memberName;
if (avatarElemento) avatarElemento.textContent = gerarIniciais(memberName);

const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileFullName = document.getElementById('profileFullName');
const profileEmail = document.getElementById('profileEmail');
const profileCreatedAt = document.getElementById('profileCreatedAt');

if (profileAvatar) profileAvatar.textContent = gerarIniciais(memberName);
if (profileName) profileName.textContent = memberName;
if (profileFullName) profileFullName.textContent = memberName;
if (profileEmail) profileEmail.textContent = user.email || 'Não informado';

if (profileCreatedAt) {
  profileCreatedAt.textContent = formatarData(profile?.created_at);
}

const editFullName = document.getElementById('editFullName');
const editUsername = document.getElementById('editUsername');

if (editFullName) editFullName.value = profile?.full_name || '';
if (editUsername) editUsername.value = profile?.username || '';

// ==========================================
// 4. MENSAGENS DE AVISO
// ==========================================

let toastTimer;

function toast(message) {
  const element = document.getElementById('toast');
  if (!element) return;

  element.textContent = message;
  element.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.classList.remove('show');
  }, 2500);
}

// ==========================================
// 5. EDITAR PERFIL
// ==========================================

const profileForm = document.getElementById('profileForm');
const profileMessage = document.getElementById('profileMessage');

profileForm?.addEventListener('submit', async event => {
  event.preventDefault();

  const novoNome = editFullName.value.trim();
  const novoUsername = editUsername.value.trim();

  if (!novoNome) {
    profileMessage.textContent = 'Digite seu nome completo.';
    return;
  }

  profileMessage.textContent = 'Salvando...';

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: novoNome,
      username: novoUsername || null
    })
    .eq('id', user.id);

  if (error) {
    console.error('Erro ao atualizar perfil:', error);

    profileMessage.textContent =
      'Não foi possível salvar. Verifique os dados e tente novamente.';

    return;
  }

  memberName = novoNome;

  if (nomeElemento) nomeElemento.textContent = novoNome;
  if (profileName) profileName.textContent = novoNome;
  if (profileFullName) profileFullName.textContent = novoNome;

  const iniciais = gerarIniciais(novoNome);

  if (avatarElemento) avatarElemento.textContent = iniciais;
  if (profileAvatar) profileAvatar.textContent = iniciais;

  profileMessage.textContent = 'Perfil atualizado com sucesso!';
  toast('Seus dados foram atualizados!');
});

// ==========================================
// 6. SAIR DA CONTA
// ==========================================

document.getElementById('logoutButton')?.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    toast('Não foi possível sair. Tente novamente.');
    return;
  }

  window.location.replace('login.html');
});

// ==========================================
// 7. NAVEGAÇÃO DO SITE
// ==========================================

const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const breadcrumb = document.getElementById('breadcrumbTitle');
const sidebar = document.getElementById('sidebar');
const brand = document.querySelector('.brand');

const titles = {
  home: 'VISÃO GERAL',
  community: 'COMUNIDADE',
  challenges: 'DESAFIOS',
  training: 'TREINAMENTO',
  benefits: 'BENEFÍCIOS',
  card: 'MINHA CARTEIRINHA',
  profile: 'MEU PERFIL',
  ranking: 'RANKING'
};

function showPage(name) {
  const targetPage = document.getElementById(`page-${name}`);
  if (!targetPage) return;

  pages.forEach(page => {
    page.classList.toggle('active', page === targetPage);
  });

  navItems.forEach(item => {
    const active = item.dataset.page === name;

    item.classList.toggle('active', active);

    if (active) {
      item.setAttribute('aria-current', 'page');
    } else {
      item.removeAttribute('aria-current');
    }
  });

  if (breadcrumb) {
    breadcrumb.textContent = titles[name] || 'VISÃO GERAL';
  }

  sidebar?.classList.remove('open');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'community') {
    carregarPublicacoes();
  }

  if (name === 'challenges') {
    carregarDesafios();
  }

  if (name === 'profile') {
    carregarMeuProgresso();
  }
}

navItems.forEach(item => {
  item.addEventListener('click', () => showPage(item.dataset.page));
});

document.querySelectorAll('[data-go]').forEach(button => {
  button.addEventListener('click', () => showPage(button.dataset.go));
});

brand?.addEventListener('click', event => {
  event.preventDefault();
  showPage('home');
});

const mobileMenu = document.getElementById('mobileMenu');

mobileMenu?.addEventListener('click', () => {
  const isOpen = sidebar?.classList.toggle('open') || false;
  mobileMenu.setAttribute('aria-expanded', String(isOpen));
});

// ==========================================
// 8. MODAL DE PUBLICAÇÃO
// ==========================================

const modal = document.getElementById('postModal');
const postText = document.getElementById('postText');

function openModal() {
  if (!isAdmin) {
    toast('Somente a equipe pode publicar.');
    return;
  }

  modal?.classList.add('open');
  postText?.focus();
}

function closeModal() {
  modal?.classList.remove('open');
}

document.getElementById('newPost')?.addEventListener('click', openModal);
document.getElementById('composerButton')?.addEventListener('click', openModal);
document.getElementById('closeModal')?.addEventListener('click', closeModal);

modal?.addEventListener('click', event => {
  if (event.target === modal) closeModal();
});

if (!isAdmin) {
  const newPostButton = document.getElementById('newPost');
  const composer = document.querySelector('.composer');

  if (newPostButton) newPostButton.hidden = true;
  if (composer) composer.hidden = true;
}

// ==========================================
// 9. PUBLICAÇÕES REAIS DO SUPABASE
// ==========================================

const communityFeed = document.getElementById('communityFeed');

function criarElemento(tag, className, texto) {
  const elemento = document.createElement(tag);

  if (className) elemento.className = className;
  if (texto !== undefined) elemento.textContent = texto;

  return elemento;
}

function criarBotao(className, texto) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = texto;

  return button;
}

async function carregarPublicacoes() {
  if (!communityFeed) return;

  const composer = communityFeed.querySelector('.composer');

  communityFeed.querySelectorAll('.post-card').forEach(post => post.remove());

  const loading = criarElemento(
    'p',
    'muted',
    'Carregando publicações...'
  );

  loading.classList.add('community-loading');

  if (composer) {
    composer.insertAdjacentElement('afterend', loading);
  } else {
    communityFeed.appendChild(loading);
  }

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, author_id, content, image_url, created_at')
    .order('created_at', { ascending: false });

  loading.remove();

  if (error) {
    console.error('Erro ao carregar publicações:', error);
    toast('Não foi possível carregar as publicações.');
    return;
  }

  if (!posts || posts.length === 0) {
    const empty = criarElemento(
      'p',
      'muted community-empty',
      'Ainda não há publicações. Em breve teremos novidades por aqui!'
    );

    if (composer) {
      composer.insertAdjacentElement('afterend', empty);
    } else {
      communityFeed.appendChild(empty);
    }

    return;
  }

  const postIds = posts.map(post => post.id);
  const authorIds = [...new Set(posts.map(post => post.author_id))];

  const [
    { data: profiles, error: profilesError },
    { data: likes, error: likesError },
    { data: comments, error: commentsError }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', authorIds),

    supabase
      .from('likes')
      .select('post_id, user_id')
      .in('post_id', postIds),

    supabase
      .from('comments')
      .select('id, post_id, user_id, content, created_at')
      .in('post_id', postIds)
      .order('created_at', { ascending: true })
  ]);

  if (profilesError) console.error('Erro ao buscar autores:', profilesError);
  if (likesError) console.error('Erro ao buscar curtidas:', likesError);
  if (commentsError) console.error('Erro ao buscar comentários:', commentsError);

  const profileMap = new Map((profiles || []).map(item => [item.id, item]));
  const commentsList = comments || [];
  const likesList = likes || [];

  const commentAuthorIds = [
    ...new Set(commentsList.map(comment => comment.user_id))
  ];

  let commentProfiles = [];

  if (commentAuthorIds.length) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', commentAuthorIds);

    commentProfiles = data || [];
  }

  const commentProfileMap = new Map(
    commentProfiles.map(item => [item.id, item])
  );

  posts.forEach(post => {
    const author = profileMap.get(post.author_id);

    const postLikes = likesList.filter(
      like => like.post_id === post.id
    );

    const postComments = commentsList.filter(
      comment => comment.post_id === post.id
    );

    const card = criarElemento('article', 'post-card');
    card.dataset.postId = post.id;

    // Cabeçalho da publicação
    const head = criarElemento('div', 'post-head');

    const avatar = criarElemento(
      'div',
      'avatar',
      gerarIniciais(author?.full_name || 'Membro')
    );

    const authorBox = criarElemento('div', 'post-author');

    authorBox.appendChild(
      criarElemento('strong', '', author?.full_name || 'Membro IYFY')
    );

    const username = author?.username ? `@${author.username} · ` : '';

    authorBox.appendChild(
      criarElemento(
        'small',
        '',
        `${username}${formatarData(post.created_at)}`
      )
    );

    head.append(avatar, authorBox);

    if (post.author_id === ADMIN_ID) {
      head.appendChild(criarElemento('span', 'verified', '✓'));
    }

    card.appendChild(head);

    // Texto da publicação
    card.appendChild(criarElemento('p', 'post-text', post.content));

    // Imagem opcional
    if (post.image_url) {
      const visual = criarElemento('div', 'post-visual');

      const image = document.createElement('img');
      image.src = post.image_url;
      image.alt = 'Imagem da publicação';
      image.className = 'post-image';
      image.loading = 'lazy';

      visual.appendChild(image);
      card.appendChild(visual);
    }

    // Ações da publicação
    const actions = criarElemento('div', 'post-actions');

    const userLiked = postLikes.some(
      like => like.user_id === user.id
    );

    const likeButton = criarBotao(
      `like-button${userLiked ? ' liked' : ''}`,
      `♡ ${postLikes.length}`
    );

    likeButton.dataset.action = 'like';
    likeButton.dataset.postId = post.id;

    const commentButton = criarBotao(
      '',
      `▢ ${postComments.length} comentários`
    );

    commentButton.dataset.action = 'focus-comment';
    commentButton.dataset.postId = post.id;

    const shareButton = criarBotao(
      'share-button',
      '↗ Compartilhar'
    );

    shareButton.dataset.action = 'share';
    shareButton.dataset.postId = post.id;

    actions.append(likeButton, commentButton, shareButton);
    card.appendChild(actions);

    // Área de comentários
    const commentsArea = criarElemento('div', 'post-comments');
    commentsArea.dataset.commentsFor = post.id;

    const commentsListElement = criarElemento('div', 'comments-list');

    postComments.forEach(comment => {
      const commentAuthor = commentProfileMap.get(comment.user_id);

      const commentRow = criarElemento('div', 'comment-item');

      const commentAvatar = criarElemento(
        'div',
        'avatar comment-avatar',
        gerarIniciais(commentAuthor?.full_name || 'Membro')
      );

      const commentContent = criarElemento('div', 'comment-content');

      const commentName = criarElemento(
        'strong',
        '',
        commentAuthor?.full_name || 'Membro'
      );

      const commentText = criarElemento('p', '', comment.content);

      const commentDate = criarElemento(
        'small',
        '',
        formatarData(comment.created_at)
      );

      commentContent.append(commentName, commentText, commentDate);
      commentRow.append(commentAvatar, commentContent);

      // MENU DE MODERAÇÃO: SOMENTE ADMINISTRADOR
      if (isAdmin) {
        const adminMenu = document.createElement('details');
        adminMenu.className = 'comment-admin-menu';

        const menuTrigger = document.createElement('summary');
        menuTrigger.className = 'comment-admin-trigger';
        menuTrigger.textContent = '⋯';
        menuTrigger.setAttribute('aria-label', 'Opções do comentário');

        const deleteButton = criarBotao(
          'comment-delete-option',
          'Excluir comentário'
        );

        deleteButton.dataset.action = 'delete-comment';
        deleteButton.dataset.commentId = comment.id;
        deleteButton.dataset.postId = post.id;

        adminMenu.append(menuTrigger, deleteButton);
        commentRow.appendChild(adminMenu);
      }

      commentsListElement.appendChild(commentRow);
    });

    commentsArea.appendChild(commentsListElement);

    const commentForm = document.createElement('form');
    commentForm.className = 'comment-form';
    commentForm.dataset.postId = post.id;

    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.name = 'comment';
    commentInput.placeholder = 'Escreva um comentário...';
    commentInput.maxLength = 1000;
    commentInput.required = true;
    commentInput.setAttribute('aria-label', 'Escreva um comentário');

    const commentSubmit = document.createElement('button');
    commentSubmit.type = 'submit';
    commentSubmit.textContent = 'Comentar';

    commentForm.append(commentInput, commentSubmit);
    commentsArea.appendChild(commentForm);

    card.appendChild(commentsArea);

    if (composer) {
      composer.insertAdjacentElement('afterend', card);
    } else {
      communityFeed.appendChild(card);
    }
  });
}

// ==========================================
// 10. PUBLICAR NO BANCO DE DADOS
// ==========================================

document.getElementById('publishPost')?.addEventListener('click', async () => {
  if (!isAdmin) {
    toast('Somente a equipe pode publicar.');
    return;
  }

  const value = postText?.value.trim();

  if (!value) {
    postText?.focus();
    return;
  }

  const publishButton = document.getElementById('publishPost');

  publishButton.disabled = true;
  publishButton.textContent = 'Publicando...';

  const { error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      content: value,
      image_url: null
    });

  publishButton.disabled = false;
  publishButton.textContent = 'Publicar ↗';

  if (error) {
    console.error('Erro ao publicar:', error);
    toast('Não foi possível publicar. Tente novamente.');
    return;
  }

  postText.value = '';
  closeModal();

  showPage('community');

  await carregarPublicacoes();

  toast('Publicação feita com sucesso!');
});

// ==========================================
// 11. CURTIDAS, COMENTÁRIOS E MODERAÇÃO
// ==========================================

communityFeed?.addEventListener('click', async event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  const postId = button.dataset.postId;

  // EXCLUIR COMENTÁRIO — SOMENTE ADMINISTRADOR
  if (action === 'delete-comment') {
    if (!isAdmin) {
      toast('Você não tem permissão para isso.');
      return;
    }

    const commentId = button.dataset.commentId;

    if (!commentId) {
      toast('Não foi possível identificar o comentário.');
      return;
    }

    const confirmou = window.confirm(
      'Tem certeza de que deseja excluir este comentário? Esta ação não poderá ser desfeita.'
    );

    if (!confirmou) return;

    button.disabled = true;
    button.textContent = 'Excluindo...';

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Erro ao excluir comentário:', error);
      toast('Não foi possível excluir o comentário.');
      button.disabled = false;
      button.textContent = 'Excluir comentário';
      return;
    }

    toast('Comentário excluído com sucesso!');

    await carregarPublicacoes();
    return;
  }

  // CURTIR / REMOVER CURTIDA
  if (action === 'like') {
    if (button.disabled) return;

    button.disabled = true;

    const alreadyLiked = button.classList.contains('liked');

    if (alreadyLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao remover curtida:', error);
        toast('Não foi possível remover a curtida.');
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error) {
        console.error('Erro ao curtir:', error);
        toast('Não foi possível registrar sua curtida.');
      }
    }

    button.disabled = false;

    await carregarPublicacoes();
  }

  // IR PARA O CAMPO DE COMENTÁRIO
  if (action === 'focus-comment') {
    const input = communityFeed.querySelector(
      `.comment-form[data-post-id="${postId}"] input`
    );

    input?.focus();
  }

  // COMPARTILHAR PUBLICAÇÃO
  if (action === 'share') {
    const shareUrl =
      `${window.location.origin}${window.location.pathname}?post=${postId}`;

    const shareData = {
      title: 'IYFY CLUB',
      text: 'Confira esta publicação da comunidade IYFY CLUB!',
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast('Link da publicação copiado!');
      } else {
        window.prompt('Copie o link da publicação:', shareUrl);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
        toast('Não foi possível compartilhar.');
      }
    }
  }
});

// Enviar comentários
communityFeed?.addEventListener('submit', async event => {
  const form = event.target.closest('.comment-form');
  if (!form) return;

  event.preventDefault();

  const input = form.querySelector('input[name="comment"]');
  const submitButton = form.querySelector('button');
  const content = input.value.trim();
  const postId = form.dataset.postId;

  if (!content) {
    input.focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';

  const { error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content
    });

  submitButton.disabled = false;
  submitButton.textContent = 'Comentar';

  if (error) {
    console.error('Erro ao comentar:', error);
    toast('Não foi possível enviar seu comentário.');
    return;
  }

  await carregarPublicacoes();

  toast('Comentário enviado!');
});

// ==========================================
// 12. CUPONS
// ==========================================

document.addEventListener('click', event => {
  const copy = event.target.closest('.copy-code');

  if (!copy) return;

  const code = copy.dataset.code;

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(code)
      .then(() => toast(`Cupom ${code} copiado!`))
      .catch(() => toast('Não foi possível copiar o cupom.'));
  } else {
    window.prompt('Copie seu cupom:', code);
  }
});

// ==========================================
// 13. CARTEIRINHA
// ==========================================

document.getElementById('downloadCard')?.addEventListener('click', () => {
  document.title = 'Carteirinha IYFY CLUB';
  window.print();
});

// ==========================================
// 14. DESAFIOS — THE LAST 100K
// ==========================================

const CHALLENGE_KEY = 'the-last-100k';
const CHALLENGE_TARGET = 100;

const myChallengesSection =
  document.getElementById('myChallengesSection');

const myChallengesList =
  document.getElementById('myChallengesList');

const profileChallengeSection =
  document.getElementById('profileChallengeSection');

const profileChallengeProgress =
  document.getElementById('profileChallengeProgress');

const challengeAdminPanel =
  document.getElementById('challengeAdminPanel');

const adminAthleteSelect =
  document.getElementById('adminAthleteSelect');

const adminParticipantSelect =
  document.getElementById('adminParticipantSelect');

const adminKmInput =
  document.getElementById('adminKmInput');

const adminSourceSelect =
  document.getElementById('adminSourceSelect');

const adminKmNote =
  document.getElementById('adminKmNote');

const challengeAdminMessage =
  document.getElementById('challengeAdminMessage');

function criarOpcao(texto, valor = '') {
  const option = document.createElement('option');

  option.value = valor;
  option.textContent = texto;

  return option;
}

function formatarKm(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ==========================================
// 15. MONTAR CARTÃO DE PROGRESSO
// ==========================================

function montarCartaoProgresso(participante, historico) {
  const total = Number(participante.total_km || 0);

  const restante = Math.max(CHALLENGE_TARGET - total, 0);

  const percentual = Math.min(
    (total / CHALLENGE_TARGET) * 100,
    100
  );

  const concluido =
    participante.status === 'completed' ||
    total >= CHALLENGE_TARGET;

  const card = criarElemento('article', 'challenge-card');

  card.appendChild(
    criarElemento(
      'span',
      'tag-upcoming',
      concluido ? 'CONCLUÍDO' : 'EM ANDAMENTO'
    )
  );

  card.appendChild(
    criarElemento('h3', '', 'THE LAST 100K')
  );

  card.appendChild(
    criarElemento(
      'p',
      '',
      `${formatarKm(total)} km de ${CHALLENGE_TARGET} km realizados`
    )
  );

  const barra = criarElemento('div', 'progress');

  const preenchimento = document.createElement('i');
  preenchimento.style.width = `${percentual}%`;

  barra.appendChild(preenchimento);
  card.appendChild(barra);

  card.appendChild(
    criarElemento(
      'p',
      'muted',
      `${percentual.toLocaleString('pt-BR', {
        maximumFractionDigits: 1
      })}% concluído`
    )
  );

  card.appendChild(
    criarElemento(
      'strong',
      '',
      concluido
        ? 'Parabéns! Você completou o desafio!'
        : `Faltam ${formatarKm(restante)} km para completar.`
    )
  );

  card.appendChild(
    criarElemento('h4', '', 'Histórico de atividades')
  );

  if (!historico.length) {
    card.appendChild(
      criarElemento(
        'p',
        'muted',
        'Nenhuma atividade registrada ainda.'
      )
    );
  } else {
    const lista = document.createElement('ul');
    lista.className = 'challenge-history';

    historico.forEach(item => {
      const linha = document.createElement('li');

      const distancia = criarElemento(
        'strong',
        '',
        `+${formatarKm(item.km_added)} km`
      );

      const origem = criarElemento(
        'span',
        '',
        ` · ${item.source || 'Não informado'}`
      );

      const data = criarElemento(
        'small',
        '',
        ` — ${formatarData(item.created_at)}`
      );

      linha.append(distancia, origem, data);

      if (item.note) {
        linha.appendChild(
          criarElemento('p', 'muted', item.note)
        );
      }

      lista.appendChild(linha);
    });

    card.appendChild(lista);
  }

  return card;
}

// ==========================================
// 16. CARREGAR PROGRESSO DO MEMBRO
// ==========================================

async function carregarMeuProgresso() {
  if (myChallengesList) {
    myChallengesList.replaceChildren();
  }

  if (profileChallengeProgress) {
    profileChallengeProgress.replaceChildren();
  }

  const { data: participantes, error } = await supabase
    .from('challenge_participants')
    .select('id, challenge_key, total_km, status, authorized_at')
    .eq('user_id', user.id)
    .eq('challenge_key', CHALLENGE_KEY);

  if (error) {
    console.error('Erro ao carregar progresso:', error);

    if (myChallengesSection) {
      myChallengesSection.hidden = true;
    }

    if (profileChallengeSection) {
      profileChallengeSection.hidden = true;
    }

    return;
  }

  if (!participantes || participantes.length === 0) {
    if (myChallengesSection) {
      myChallengesSection.hidden = true;
    }

    if (profileChallengeSection) {
      profileChallengeSection.hidden = true;
    }

    return;
  }

  const ids = participantes.map(item => item.id);

  const { data: historico, error: historyError } = await supabase
    .from('challenge_progress_logs')
    .select('id, participant_id, km_added, source, note, created_at')
    .in('participant_id', ids)
    .order('created_at', { ascending: false });

  if (historyError) {
    console.error('Erro ao carregar histórico:', historyError);
  }

  const registros = historico || [];

  participantes.forEach(participante => {
    const atividades = registros.filter(
      item => item.participant_id === participante.id
    );

    if (myChallengesList) {
      myChallengesList.appendChild(
        montarCartaoProgresso(participante, atividades)
      );
    }

    if (profileChallengeProgress) {
      profileChallengeProgress.appendChild(
        montarCartaoProgresso(participante, atividades)
      );
    }
  });

  if (myChallengesSection) {
    myChallengesSection.hidden = false;
  }

  if (profileChallengeSection) {
    profileChallengeSection.hidden = false;
  }
}

// ==========================================
// 17. PAINEL ADMINISTRATIVO DOS DESAFIOS
// ==========================================

async function carregarPainelAdmin() {
  if (!isAdmin || !challengeAdminPanel) return;

  challengeAdminPanel.hidden = false;

  if (adminAthleteSelect) {
    adminAthleteSelect.replaceChildren(
      criarOpcao('Carregando atletas...')
    );
  }

  const [
    { data: profiles, error: profilesError },
    { data: participantes, error: participantsError }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, username')
      .order('full_name'),

    supabase
      .from('challenge_participants')
      .select('id, user_id, total_km, status, authorized_at')
      .eq('challenge_key', CHALLENGE_KEY)
      .order('authorized_at', { ascending: false })
  ]);

  if (profilesError) {
    console.error('Erro ao carregar atletas:', profilesError);
    toast('Não foi possível carregar os atletas.');
    return;
  }

  if (participantsError) {
    console.error('Erro ao carregar participantes:', participantsError);
    toast('Não foi possível carregar os participantes.');
    return;
  }

  const listaPerfis = profiles || [];
  const listaParticipantes = participantes || [];

  const perfilMap = new Map(
    listaPerfis.map(item => [item.id, item])
  );

  if (adminAthleteSelect) {
    adminAthleteSelect.replaceChildren(
      criarOpcao('Selecione um atleta')
    );

    listaPerfis.forEach(atleta => {
      const nome =
        atleta.full_name || atleta.username || 'Membro';

      adminAthleteSelect.appendChild(
        criarOpcao(nome, atleta.id)
      );
    });
  }

  if (adminParticipantSelect) {
    adminParticipantSelect.replaceChildren(
      criarOpcao('Selecione um participante')
    );

    listaParticipantes.forEach(participante => {
      const atleta = perfilMap.get(participante.user_id);

      const nome =
        atleta?.full_name || atleta?.username || 'Membro';

      const km = formatarKm(participante.total_km);

      adminParticipantSelect.appendChild(
        criarOpcao(
          `${nome} — ${km} km`,
          participante.id
        )
      );
    });
  }
}

// ==========================================
// 18. ATUALIZAR PÁGINA DE DESAFIOS
// ==========================================

async function carregarDesafios() {
  if (myChallengesSection) {
    myChallengesSection.hidden = true;
  }

  if (challengeAdminPanel) {
    challengeAdminPanel.hidden = !isAdmin;
  }

  await Promise.all([
    carregarMeuProgresso(),
    isAdmin
      ? carregarPainelAdmin()
      : Promise.resolve()
  ]);
}

// ==========================================
// 19. AUTORIZAR ATLETA NO DESAFIO
// ==========================================

document.getElementById('authorizeChallengeButton')
  ?.addEventListener('click', async event => {
    if (!isAdmin) return;

    const button = event.currentTarget;
    const athleteId = adminAthleteSelect?.value;

    if (!athleteId) {
      toast('Selecione um atleta primeiro.');
      return;
    }

    button.disabled = true;
    button.textContent = 'Autorizando...';

    const { error } = await supabase
      .from('challenge_participants')
      .insert({
        user_id: athleteId,
        challenge_key: CHALLENGE_KEY
      });

    button.disabled = false;
    button.textContent = 'LIBERAR THE LAST 100K';

    if (error) {
      console.error('Erro ao autorizar atleta:', error);

      if (error.code === '23505') {
        toast('Esse atleta já está autorizado.');
      } else {
        toast('Não foi possível autorizar o atleta.');
      }

      return;
    }

    if (challengeAdminMessage) {
      challengeAdminMessage.textContent =
        'Atleta autorizado com sucesso!';
    }

    toast('Atleta liberado no desafio!');

    await carregarDesafios();
  });

// ==========================================
// 20. REGISTRAR QUILÔMETROS DO ATLETA
// ==========================================

document.getElementById('registerKmButton')
  ?.addEventListener('click', async event => {
    if (!isAdmin) return;

    const button = event.currentTarget;

    const participantId = adminParticipantSelect?.value;
    const km = Number(adminKmInput?.value);

    const source = adminSourceSelect?.value || 'Outro';
    const note = adminKmNote?.value.trim() || null;

    if (!participantId) {
      toast('Selecione um participante.');
      return;
    }

    if (!Number.isFinite(km) || km <= 0) {
      toast('Informe uma distância válida.');
      return;
    }

    button.disabled = true;
    button.textContent = 'Registrando...';

    const { data, error } = await supabase.rpc(
      'admin_add_challenge_km',
      {
        p_participant_id: participantId,
        p_km_added: km,
        p_source: source,
        p_note: note
      }
    );

    button.disabled = false;
    button.textContent = 'REGISTRAR QUILÔMETROS';

    if (error) {
      console.error('Erro ao registrar quilômetros:', error);
      toast('Não foi possível registrar os quilômetros.');
      return;
    }

    if (adminKmInput) {
      adminKmInput.value = '';
    }

    if (adminKmNote) {
      adminKmNote.value = '';
    }

    if (challengeAdminMessage) {
      challengeAdminMessage.textContent =
        `Registro realizado! Total atualizado: ${formatarKm(data)} km.`;
    }

    toast('Quilômetros registrados com sucesso!');

    await carregarDesafios();
  });

// ==========================================
// 21. INICIALIZAÇÃO
// ==========================================

carregarPublicacoes();
carregarDesafios();