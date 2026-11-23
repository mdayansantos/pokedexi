let todosNomes = [];
let pokemonDisponiveis = [];
const limitePokemonLista = 18;
const regioesPokemon = ['alola', 'galar', 'hisui', 'paldea'];

const nomesStats = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Attack',
    'special-defense': 'Sp. Defense',
    speed: 'Speed'
};

async function carregarPokemon() {
    const status = document.getElementById('status-lista');
    const lista = document.getElementById('lista-pokemon');

    try {
        const resposta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        if (!resposta.ok) {
            throw new Error('Unable to load the Pokémon list.');
        }

        const dados = await resposta.json();
        todosNomes = dados.results.map(pokemon => pokemon.name);
        atualizarSugestoes();

        pokemonDisponiveis = dados.results;
        await mostrarPokemonLista(embaralhar([...pokemonDisponiveis]).slice(0, limitePokemonLista));
    } catch (erro) {
        status.textContent = erro.message;
        status.classList.add('erro');
    }
}

async function mostrarPokemonLista(itens) {
    const lista = document.getElementById('lista-pokemon');
    const status = document.getElementById('status-lista');
    lista.innerHTML = '';
    status.textContent = 'Loading Pokémon...';
    status.classList.remove('erro');
    status.hidden = false;

    try {
        const pokemon = await Promise.all(itens.map(async item => {
            const respostaPokemon = await fetch(item.url);
            if (!respostaPokemon.ok) {
                throw new Error(`Unable to load ${item.name}.`);
            }
            return respostaPokemon.json();
        }));
        pokemon.forEach(adicionarPokemonALista);
        status.hidden = true;
    } catch (erro) {
        status.textContent = erro.message;
        status.classList.add('erro');
    }
}

async function filtrarPokemonPorTipo(tipo) {
    if (!tipo) {
        await mostrarPokemonLista(embaralhar([...pokemonDisponiveis]).slice(0, limitePokemonLista));
        return;
    }

    const status = document.getElementById('status-lista');
    status.textContent = 'Loading Pokémon...';
    status.classList.remove('erro');
    status.hidden = false;

    try {
        const resposta = await fetch(`https://pokeapi.co/api/v2/type/${encodeURIComponent(tipo)}`);
        if (!resposta.ok) {
            throw new Error(`Unable to load Pokémon of type ${tipo}.`);
        }
        const dados = await resposta.json();
        const encontrados = dados.pokemon.map(item => ({
            name: item.pokemon.name,
            url: item.pokemon.url
        }));
        await mostrarPokemonLista(embaralhar(encontrados).slice(0, limitePokemonLista));
    } catch (erro) {
        status.textContent = erro.message;
        status.classList.add('erro');
    }
}

function embaralhar(itens) {
    for (let indice = itens.length - 1; indice > 0; indice--) {
        const aleatorio = Math.floor(Math.random() * (indice + 1));
        [itens[indice], itens[aleatorio]] = [itens[aleatorio], itens[indice]];
    }
    return itens;
}

function adicionarPokemonALista(pokemon) {
    const lista = document.getElementById('lista-pokemon');
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'pokemon-item';
    botao.setAttribute('aria-label', `Search ${pokemon.name}`);
    botao.onclick = () => selecionarPokemon(pokemon.name);

    const imagem = document.createElement('img');
    imagem.src = pokemon.sprites.front_default || '';
    imagem.alt = '';
    imagem.loading = 'lazy';

    const id = document.createElement('span');
    id.className = 'pokemon-item-id';
    id.textContent = `#${pokemon.id}`;

    const nome = document.createElement('span');
    nome.className = 'pokemon-item-nome';
    nome.textContent = pokemon.name;

    botao.append(imagem, id, nome);
    lista.appendChild(botao);
}

function mostrarAba(aba) {
    const explorando = aba === 'explorar';
    document.getElementById('painel-explorar').hidden = !explorando;
    document.getElementById('painel-pesquisar').hidden = explorando;
    document.getElementById('aba-explorar').classList.toggle('ativa', explorando);
    document.getElementById('aba-pesquisar').classList.toggle('ativa', !explorando);
    document.getElementById('aba-explorar').setAttribute('aria-selected', String(explorando));
    document.getElementById('aba-pesquisar').setAttribute('aria-selected', String(!explorando));
}

function mostrarAbaDetalhe(aba) {
    const detalhes = aba === 'detalhes';
    document.getElementById('painel-detalhes-pokemon').hidden = !detalhes;
    document.getElementById('painel-evolucoes-pokemon').hidden = detalhes;
    document.getElementById('aba-detalhes-pokemon').classList.toggle('ativa', detalhes);
    document.getElementById('aba-evolucoes-pokemon').classList.toggle('ativa', !detalhes);
    document.getElementById('aba-detalhes-pokemon').setAttribute('aria-selected', String(detalhes));
    document.getElementById('aba-evolucoes-pokemon').setAttribute('aria-selected', String(!detalhes));
}

function selecionarPokemon(nome) {
    mostrarAba('pesquisar');
    document.getElementById('pokemon-input').value = nome;
    buscarPokemon();
}

function atualizarSugestoes() {
    const input = document.getElementById('pokemon-input');
    const valor = input.value.toLowerCase().trim();
    const lista = document.getElementById('sugestoes');
    lista.innerHTML = '';

    if (!valor) {
        return;
    }

    todosNomes
        .filter(nome => nome.startsWith(valor))
        .slice(0, 5)
        .forEach(nome => {
            const item = document.createElement('li');
            item.textContent = nome;
            item.addEventListener('mousedown', () => selecionarPokemon(nome));
            lista.appendChild(item);
        });
}

async function buscarPokemon() {
    const input = document.getElementById('pokemon-input');
    const nomePokemon = input.value.trim().toLowerCase();
    const lista = document.getElementById('sugestoes');
    const status = document.getElementById('status-busca');
    const erroBusca = document.getElementById('erro-busca');
    const card = document.getElementById('pokemon-card');

    lista.innerHTML = '';
    erroBusca.hidden = true;
    card.hidden = true;
    mostrarAbaDetalhe('detalhes');

    if (!nomePokemon) {
        erroBusca.textContent = 'Enter a Pokémon name or ID.';
        erroBusca.hidden = false;
        return;
    }

    status.textContent = 'Searching Pokémon...';

    try {
        const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nomePokemon)}`);
        if (!resposta.ok) {
            throw new Error('Pokémon not found. Check the name or ID and try again.');
        }

        const dados = await resposta.json();
        const [efetividades, especie] = await Promise.all([
            calcularEfetividades(dados.types),
            carregarEspecie(dados.species.url)
        ]);
        document.getElementById('poke-nome').textContent = dados.name;
        document.getElementById('poke-id').textContent = `#${dados.id}`;
        document.getElementById('poke-descricao').textContent = carregarDescricaoPokedex(especie);

        const imagem = document.getElementById('poke-img');
        imagem.src = dados.sprites.other['official-artwork'].front_default || dados.sprites.front_default || '';
        imagem.alt = `Image of ${dados.name}`;

        mostrarTipos(dados.types);
        mostrarEfetividades(efetividades);
        mostrarStats(dados.stats);
        card.hidden = false;
        status.textContent = '';
        await carregarLinhaEvolucao(especie.evolution_chain.url);
    } catch (erro) {
        status.textContent = '';
        erroBusca.textContent = erro.message;
        erroBusca.hidden = false;
    }
}

async function carregarEspecie(urlEspecie) {
    const resposta = await fetch(urlEspecie);
    if (!resposta.ok) {
        throw new Error('Unable to load Pokémon species data.');
    }

    return resposta.json();
}

function carregarDescricaoPokedex(especie) {
    const entradas = especie.flavor_text_entries;
    const entrada = entradas.find(item => item.language.name === 'en');

    if (!entrada) {
        return 'No English Pokédex entry is available.';
    }

    return entrada.flavor_text.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim();
}

async function carregarLinhaEvolucao(url) {
    const status = document.getElementById('status-evolucoes');
    const container = document.getElementById('poke-evolucoes');
    container.innerHTML = '';
    status.textContent = 'Loading evolution line...';
    status.classList.remove('erro');

    try {
        const resposta = await fetch(url);
        if (!resposta.ok) {
            throw new Error('Unable to load the evolution line.');
        }
        const dados = await resposta.json();
        const arvore = await criarArvoreEvolucao(dados.chain);
        container.appendChild(renderizarNoEvolucao(arvore));
        status.textContent = '';
    } catch (erro) {
        status.textContent = erro.message;
        status.classList.add('erro');
    }
}

async function criarArvoreEvolucao(no) {
    const resposta = await fetch(no.species.url);
    if (!resposta.ok) {
        throw new Error(`Unable to load ${no.species.name} evolution data.`);
    }
    const especie = await resposta.json();
    const variedades = especie.varieties.filter(variedade => {
        if (variedade.is_default) {
            return true;
        }
        return regioesPokemon.some(regiao => variedade.pokemon.name.endsWith(`-${regiao}`));
    });
    const pokemon = await Promise.all(variedades.map(async variedade => {
        const respostaPokemon = await fetch(variedade.pokemon.url);
        if (!respostaPokemon.ok) {
            throw new Error(`Unable to load ${variedade.pokemon.name}.`);
        }
        return respostaPokemon.json();
    }));
    const filhos = await Promise.all(no.evolves_to.map(criarArvoreEvolucao));

    return { pokemon, filhos };
}

function renderizarNoEvolucao(no) {
    const elemento = document.createElement('div');
    elemento.className = 'evolucao-no';
    const variedades = document.createElement('div');
    variedades.className = 'evolucao-variedades';

    no.pokemon.forEach(pokemon => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'evolucao-pokemon';
        botao.setAttribute('aria-label', `Search ${pokemon.name}`);
        botao.addEventListener('click', () => selecionarPokemon(pokemon.name));

        const imagem = document.createElement('img');
        imagem.src = pokemon.sprites.front_default || '';
        imagem.alt = '';
        imagem.loading = 'lazy';

        const nome = document.createElement('span');
        nome.textContent = pokemon.name.replace(/-/g, ' ');
        botao.append(imagem, nome);
        variedades.appendChild(botao);
    });
    elemento.appendChild(variedades);

    if (no.filhos.length > 0) {
        const filhos = document.createElement('div');
        filhos.className = 'evolucao-filhos';
        no.filhos.forEach(filho => filhos.appendChild(renderizarNoEvolucao(filho)));
        elemento.appendChild(filhos);
    }

    return elemento;
}

async function calcularEfetividades(tiposPokemon) {
    const relacoes = await Promise.all(tiposPokemon.map(async ({ type }) => {
        const resposta = await fetch(type.url);
        if (!resposta.ok) {
            throw new Error(`Unable to load type effectiveness for ${type.name}.`);
        }

        const dadosTipo = await resposta.json();
        return dadosTipo.damage_relations;
    }));

    const propriedades = ['no_damage_from', 'half_damage_from', 'double_damage_from'];
    const tiposOfensivos = new Set();
    relacoes.forEach(relacao => {
        propriedades.forEach(propriedade => {
            relacao[propriedade].forEach(tipo => tiposOfensivos.add(tipo.name));
        });
    });

    const resultado = [];
    tiposOfensivos.forEach(nomeTipo => {
        let multiplicador = 1;
        relacoes.forEach(relacao => {
            if (relacao.no_damage_from.some(tipo => tipo.name === nomeTipo)) {
                multiplicador = 0;
            } else if (relacao.double_damage_from.some(tipo => tipo.name === nomeTipo)) {
                multiplicador *= 2;
            } else if (relacao.half_damage_from.some(tipo => tipo.name === nomeTipo)) {
                multiplicador *= 0.5;
            }
        });

        if (multiplicador !== 1) {
            resultado.push({ nomeTipo, multiplicador });
        }
    });

    return resultado;
}

function mostrarEfetividades(efetividades) {
    const fraquezas = efetividades
        .filter(item => item.multiplicador > 1)
        .sort((a, b) => b.multiplicador - a.multiplicador || a.nomeTipo.localeCompare(b.nomeTipo));
    const resistencias = efetividades
        .filter(item => item.multiplicador > 0 && item.multiplicador < 1)
        .sort((a, b) => a.multiplicador - b.multiplicador || a.nomeTipo.localeCompare(b.nomeTipo));
    const imunidades = efetividades.filter(item => item.multiplicador === 0);

    mostrarGrupoEfetividade('poke-fraquezas', fraquezas);
    mostrarGrupoEfetividade('poke-resistencias', resistencias);
    mostrarGrupoEfetividade('poke-imunidades', imunidades);
}

function mostrarGrupoEfetividade(idContainer, itens) {
    const container = document.getElementById(idContainer);
    container.innerHTML = '';

    if (itens.length === 0) {
        const vazio = document.createElement('span');
        vazio.className = 'efetividade-vazia';
        vazio.textContent = 'None';
        container.appendChild(vazio);
        return;
    }

    itens.forEach(item => {
        const entrada = document.createElement('span');
        entrada.className = 'efetividade-item';
        entrada.appendChild(criarBadgeTipo(item.nomeTipo));

        if (item.multiplicador > 0) {
            const valor = document.createElement('span');
            valor.className = 'multiplicador';
            const formatos = { 0.5: '1/2×', 0.25: '1/4×' };
            valor.textContent = formatos[item.multiplicador] || `${item.multiplicador}×`;
            entrada.appendChild(valor);
        }

        container.appendChild(entrada);
    });
}

function criarBadgeTipo(nomeTipo) {
    const badge = document.createElement('span');
    badge.className = `tipo-badge tipo-${nomeTipo}`;
    badge.textContent = nomeTipo;
    return badge;
}

function mostrarTipos(tipos) {
    const container = document.getElementById('poke-tipo');
    container.innerHTML = '';
    container.setAttribute('aria-label', `Types: ${tipos.map(tipo => tipo.type.name).join(', ')}`);

    tipos.forEach(tipo => {
        container.appendChild(criarBadgeTipo(tipo.type.name));
    });
}

function mostrarStats(stats) {
    const container = document.getElementById('poke-stats');
    container.innerHTML = '';

    stats.forEach(stat => {
        const percentual = Math.min(Math.max(stat.base_stat, 0), 255) / 255;
        const matiz = Math.round(percentual * 270);
        const item = document.createElement('div');
        item.className = 'stat';
        item.innerHTML = `
            <span class="stat-nome">${nomesStats[stat.stat.name] || stat.stat.name}</span>
            <span class="stat-valor">${stat.base_stat}</span>
            <div class="stat-barra">
                <div class="stat-progresso" style="width: ${percentual * 100}%; --stat-cor: hsl(${matiz} 78% 45%)"></div>
            </div>
        `;
        container.appendChild(item);
    });
}

document.getElementById('pokemon-input').addEventListener('input', atualizarSugestoes);
document.getElementById('pokemon-input').addEventListener('keydown', evento => {
    if (evento.key === 'Enter') {
        buscarPokemon();
    }
});

document.getElementById('filtro-tipo').addEventListener('change', evento => {
    filtrarPokemonPorTipo(evento.target.value);
});

carregarPokemon();
