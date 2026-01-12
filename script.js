// Mantenha estas variáveis e funções FORA de qualquer outra função
let todosNomes = [];
let todosSprites = [];
let count = 0

// 1. Carrega todos os nomes ao abrir a página (Executa uma vez só)
async function carregarNomes() {
    try {
        const url = "https://pokeapi.co/api/v2/pokemon?limit=10000"; 
        const resposta = await fetch(url);
        const dados = await resposta.json();
        // Salva e coloca em ordem alfabética
        todosNomes = dados.results.map(p => p.name).sort(); 
        todosSprites = dados.sprites.map(p => p.name).sort()
        console.log("Nomes carregados!"); 
    } catch (erro) {
        console.error("Erro ao carregar lista de nomes", erro);
    }
}

// Chama a função assim que o script carregar
carregarNomes();

// 2. Filtra conforme o usuário digita (Chamada pelo oninput no HTML)
function atualizarSugestoes() {
    const input = document.getElementById('pokemon-input');
    const valor = input.value.toLowerCase();
    const lista = document.getElementById('sugestoes');

    lista.innerHTML = ""; // Limpa a lista anterior

    if (valor.length > 0) {
        const filtrados = todosNomes.filter(nome => nome.startsWith(valor));

        filtrados.slice(0, 5).forEach(nome => {
            const item = document.createElement('li');
            item.innerText = nome;
            item.onclick = () => {
                input.value = nome;
                lista.innerHTML = "";
                buscarPokemon(); // Busca automaticamente ao clicar na sugestão
            };
            lista.appendChild(item);
        });
    }
}

// 3. Busca os dados do Pokémon específico (Chamada pelo botão ou pelo clique na sugestão)
async function buscarPokemon() {
    const input = document.getElementById('pokemon-input');
    const nomePokemon = input.value.toLowerCase();
    const lista = document.getElementById('sugestoes');
    
    lista.innerHTML = ""; // Esconde as sugestões ao buscar

    if (!nomePokemon) {
        alert("Digite um nome!");
        return;
    }

    const url = `https://pokeapi.co/api/v2/pokemon/${nomePokemon}`;

    try {
        const resposta = await fetch(url);
        
        if (!resposta.ok) {
            throw new Error("Pokémon não encontrado!");
        }

        const dados = await resposta.json();

        // Preenchendo os dados na tela
        document.getElementById('poke-nome').innerText = dados.name;
        document.getElementById('poke-id').innerText = "#" + dados.id;
        document.getElementById('poke-img').src = dados.sprites.front_default;
        document.getElementById('poke-tipo').innerText = "Type: " + dados.types[0].type.name;
        
        // Mostra o card
        document.getElementById('pokemon-card').style.display = "block";
        


        document.getElementById('tabela-pokemon')

        const tabela = document.getElementById('corpo-tabela');
        const imagemUrl = document.getElementById('poke-img').src;
            
            
    
        const novaLinha = document.createElement('tr'); 
        const celulaImg = document.createElement('img'); 
        celulaImg.src = imagemUrl
        celulaImg.style.width = "50px";

        novaLinha.appendChild(celulaImg);
        tabela.appendChild(novaLinha);


    } catch (erro) {
        alert(erro.message);
        document.getElementById('pokemon-card').style.display = "none";
        count = 0

    }
}