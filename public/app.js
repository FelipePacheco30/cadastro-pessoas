const API = '/api/pessoas';

const el = {
  contador: document.querySelector('#contador'),
  busca: document.querySelector('#busca'),
  linhas: document.querySelector('#linhas'),
  vazio: document.querySelector('#vazio'),
  form: document.querySelector('#form'),
  tituloForm: document.querySelector('#titulo-form'),
  cancelar: document.querySelector('#cancelar'),
  salvar: document.querySelector('#salvar'),
  cpf: document.querySelector('#cpf'),
  dataNascimento: document.querySelector('#dataNascimento'),
  idadePrevia: document.querySelector('#idade-previa'),
  toast: document.querySelector('#toast'),
};

const estado = { pessoas: [], editandoId: null, confirmandoId: null };

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const corpo = await res.json();
  if (!res.ok)
    throw Object.assign(new Error(corpo.erro), { status: res.status, detalhes: corpo.detalhes });
  return corpo;
}

function mascararCpf(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function formatarData(iso) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function idadeDe(iso) {
  const hoje = new Date();
  const nascimento = new Date(`${iso}T00:00:00`);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade -= 1;
  return idade;
}

function plural(n, singular, pluralForm) {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

let toastTimer;
function avisar(mensagem, erro = false) {
  el.toast.textContent = mensagem;
  el.toast.classList.toggle('is-error', erro);
  el.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('is-visible'), 2800);
}

function celula(texto, classe) {
  const td = document.createElement('td');
  td.textContent = texto;
  if (classe) td.className = classe;
  return td;
}

function botao(texto, classe, acao) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `link ${classe}`.trim();
  b.textContent = texto;
  b.addEventListener('click', acao);
  return b;
}

function renderizarLinha(pessoa) {
  const tr = document.createElement('tr');
  if (pessoa.id === estado.editandoId) tr.classList.add('is-editing');

  tr.append(
    celula(pessoa.nome, 'cell-name'),
    celula(pessoa.cpf, 'mono cell-muted'),
    celula(formatarData(pessoa.dataNascimento), 'cell-muted'),
    celula(plural(pessoa.idade, 'ano', 'anos'), 'num'),
  );

  const acoes = document.createElement('td');
  acoes.className = 'cell-actions';
  if (estado.confirmandoId === pessoa.id) {
    const aviso = document.createElement('span');
    aviso.className = 'confirm';
    aviso.textContent = 'Excluir?';
    acoes.append(
      aviso,
      botao('Sim', 'link--danger', () => excluir(pessoa)),
      botao('Não', 'link--muted', () => confirmarExclusao(null)),
    );
  } else {
    acoes.append(
      botao('Editar', '', () => editar(pessoa)),
      botao('Excluir', 'link--danger', () => confirmarExclusao(pessoa.id)),
    );
  }
  tr.append(acoes);
  return tr;
}

function renderizar() {
  el.linhas.replaceChildren(...estado.pessoas.map(renderizarLinha));
  const semResultados = estado.pessoas.length === 0;
  el.vazio.hidden = !semResultados;
  el.vazio.textContent = el.busca.value.trim()
    ? 'Nenhuma pessoa encontrada para essa busca.'
    : 'Nenhuma pessoa cadastrada ainda. Use o formulário ao lado para começar.';
  if (!el.busca.value.trim()) {
    el.contador.textContent = plural(estado.pessoas.length, 'registro', 'registros');
  }
}

async function carregar() {
  const busca = el.busca.value.trim();
  const url = busca ? `${API}?busca=${encodeURIComponent(busca)}` : API;
  try {
    estado.pessoas = await api(url);
    renderizar();
  } catch {
    avisar('Não foi possível carregar a lista.', true);
  }
}

function limparErros() {
  el.form.querySelectorAll('[data-erro]').forEach((p) => (p.textContent = ''));
  el.form.querySelectorAll('input').forEach((i) => i.removeAttribute('aria-invalid'));
}

function mostrarErros(detalhes = {}) {
  for (const [campo, mensagem] of Object.entries(detalhes)) {
    el.form.querySelector(`[data-erro="${campo}"]`).textContent = mensagem;
    el.form.elements[campo].setAttribute('aria-invalid', 'true');
  }
  const primeiro = Object.keys(detalhes)[0];
  if (primeiro) el.form.elements[primeiro].focus();
}

function atualizarPrevia() {
  const valor = el.dataNascimento.value;
  el.idadePrevia.textContent =
    valor && idadeDe(valor) >= 0 ? `Idade: ${plural(idadeDe(valor), 'ano', 'anos')}` : '';
}

function resetarFormulario() {
  estado.editandoId = null;
  el.form.reset();
  limparErros();
  atualizarPrevia();
  el.tituloForm.textContent = 'Nova pessoa';
  el.salvar.textContent = 'Cadastrar';
  el.cancelar.hidden = true;
  renderizar();
}

function editar(pessoa) {
  estado.editandoId = pessoa.id;
  estado.confirmandoId = null;
  limparErros();
  el.form.elements.nome.value = pessoa.nome;
  el.cpf.value = pessoa.cpf;
  el.dataNascimento.value = pessoa.dataNascimento;
  atualizarPrevia();
  el.tituloForm.textContent = 'Editar pessoa';
  el.salvar.textContent = 'Salvar alterações';
  el.cancelar.hidden = false;
  el.form.elements.nome.focus();
  renderizar();
}

function confirmarExclusao(id) {
  estado.confirmandoId = id;
  renderizar();
}

async function excluir(pessoa) {
  try {
    await api(`${API}/${pessoa.id}`, { method: 'DELETE' });
    estado.confirmandoId = null;
    if (estado.editandoId === pessoa.id) resetarFormulario();
    avisar(`${pessoa.nome} foi removida do cadastro.`);
    await carregar();
  } catch (error) {
    avisar(error.message, true);
  }
}

async function salvar(evento) {
  evento.preventDefault();
  limparErros();
  const dados = Object.fromEntries(new FormData(el.form));
  const editando = estado.editandoId !== null;

  el.salvar.disabled = true;
  try {
    await api(editando ? `${API}/${estado.editandoId}` : API, {
      method: editando ? 'PUT' : 'POST',
      body: JSON.stringify(dados),
    });
    avisar(editando ? 'Alterações salvas.' : 'Pessoa cadastrada.');
    resetarFormulario();
    await carregar();
  } catch (error) {
    if (error.detalhes) mostrarErros(error.detalhes);
    else if (error.status === 409) mostrarErros({ cpf: error.message });
    else avisar(error.message ?? 'Não foi possível salvar.', true);
  } finally {
    el.salvar.disabled = false;
  }
}

let buscaTimer;
el.busca.addEventListener('input', () => {
  clearTimeout(buscaTimer);
  buscaTimer = setTimeout(carregar, 200);
});
el.cpf.addEventListener('input', () => (el.cpf.value = mascararCpf(el.cpf.value)));
el.dataNascimento.addEventListener('input', atualizarPrevia);
el.dataNascimento.max = new Date().toISOString().slice(0, 10);
el.cancelar.addEventListener('click', resetarFormulario);
el.form.addEventListener('submit', salvar);

carregar();
