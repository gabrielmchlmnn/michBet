$(document).ready(function() {
    $('#login-form').on('submit', function(event) {
        event.preventDefault(); // Evita o envio do formulário
        window.location.href = '../../index.html'; 
    });
});

function voltarLogin(){
    window.location.href = 'templates/html/login.html'; 

}

async function carregarDados() {
    var disabled = '';
    try {
        const betList = document.getElementById('betList');
        const createBetItem = (bet) => {
            const betItem = document.createElement('div');
            betItem.className = `bet-item ${bet.aoVivo ? 'live' : ''}`;
            betItem.style.position = 'relative'; 
            const apostaExistente = localStorage.getItem(`aposta_${bet.id}`);
            if (apostaExistente){
                disabled = 'color: white;\" disabled readonly value=\"'+JSON.parse(apostaExistente).valor+"\"";
            } else {
                disabled = '\"';
            }
            if (bet.aoVivo) {
                const liveHighlight = document.createElement('div');
                liveHighlight.className = 'live-highlight';
                betItem.appendChild(liveHighlight);
            }
            betItem.innerHTML += `
                <h2>${bet.timeA} vs ${bet.timeB}</h2>
                ${bet.minutoAtual != '' ? '<p>Placar: '+bet.placar+'</p>'+
                                          '<p>Minuto Atual: '+bet.minutoAtual+'\'</p>': ''}
                <div class="linha">
                <button class="bet-button timeA" id="timeA${bet.id}" onclick="mostraForm(${bet.id},${bet.percentualGanhoTimeA},this);">${bet.timeA}: ${bet.percentualGanhoTimeA}</button>
                <button class="bet-button" id="empate${bet.id}" onclick="mostraForm(${bet.id},${bet.percentualEmpate},this);">Empate: ${bet.percentualEmpate}</button>
                <button class="bet-button timeB" id="timeB${bet.id}" onclick="mostraForm(${bet.id},${bet.percentualGanhoTimeB},this);">${bet.timeB}: ${bet.percentualGanhoTimeB}</button>
                </div>
                <div class="formAposta${bet.id}" id="formAposta${bet.id}" style="display:none">
                    <form id="form-aposta${bet.id}" class="bet-form" style="    display: flex;flex-wrap: wrap;">
                        <div class="left-section">
                            <label for="valorInput${bet.id}" style="align-items: center;display: flex;">Valor:</label>
                            <input type="number" id="valorInput${bet.id}" name="valorInput${bet.id}" oninput="maskMoney(this,${bet.id});" placeholder="Digite o valor:" maxlength="15" size="15" style="width: 20ch; ${disabled}/>
                        </div>
                        <div class="right-section">
                        <button type="button" class="concluir-button" id="concluirAposta${bet.id}" onclick="concluirAposta(${bet.id});" ${disabled != '\"' ? "style=display:none" : ""}>Concluir</button>
                        <button type="button" class="cancelar-button" id="cancelarAposta${bet.id}" onclick="cancelarAposta(${bet.id});" ${disabled == '\"' ? "style=display:none" : ""}>Cancelar </button>
                        <button type="button" class="fechar-button" onclick="mostraForm(${bet.id},0,'');">Fechar</button>
                        </div>
                        <input type="hidden" id="multiplo${bet.id}" name="multiplo${bet.id}" />
                    </form>
                </div>
                <div id="ganhosAposta${bet.id}" style="display:none; padding-top:10px">
                        <div class="left-section">
                            
                            ${disabled != '\"' 
                            ? '<label for="ganhosPotenciais'+bet.id+"\">Ganhos potenciais:</label>"
                            + '<p type="text" id="ganhosPotenciais'+bet.id+"\" name=\"ganhosPotenciais"+bet.id+"\">"+JSON.parse(apostaExistente).ganhos+'</p>' 
                            : '<label for="ganhosPotenciais'+bet.id+"\">Ganhos potenciais:</label>"
                            +'<p type="text" id="ganhosPotenciais'+bet.id+"\" name=\"ganhosPotenciais"+bet.id+"\"> </p>"}
                            <p></p>
                        </div>
                </div>

            `;

            return betItem;
        };
        const resposta = await fetch('templates/js/dados.json'); 
        if (!resposta.ok) {
            throw new Error('Erro ao carregar o arquivo JSON.');
        }

        const dados = await resposta.json();

        console.log(dados);

        dados.itensDeAposta.forEach(item => {
            const betItem = createBetItem(item);
            betList.appendChild(betItem);
        });


    } catch (erro) {
        console.error('Erro ao carregar os dados:', erro);
    }
}


function maskMoney(campo, id) {

    if ($(campo).val() != ''){
        const valor = multiplyCurrency($(campo).val().replaceAll('.', '').replace(',', '.'), $("#multiplo" + id).val());
        $("#ganhosPotenciais" + id).text("R$ "+valor);
    } else {
        $("#ganhosPotenciais" + id).text('');
    }

}

function parseFloatBrasil(value) {
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue);
}

function multiplyCurrency(inputValue, multiplier) {
    const multiplierFloat = parseFloat(multiplier);
    console.log(multiplierFloat+"  multiplierFloat");
    console.log(inputValue+"  inputValue");

    const result = inputValue * multiplierFloat;

    console.log(result+"  result");

    return result.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}



function mostraForm(id, nrMultipo, campo) {
    $("#timeA" + id).removeClass('selected');
    $("#timeB" + id).removeClass('selected');
    $("#empate" + id).removeClass('selected');

    if (!$(campo).hasClass('selected')) {
        $(campo).addClass('selected');
    } else {
        $(campo).removeClass('selected');
    }

    if ($("#timeA" + id).hasClass('selected') || $("#timeB" + id).hasClass('selected') || $("#empate" + id).hasClass('selected')) {
        $("#formAposta" + id).show();
        $("#ganhosAposta" + id).show();
        $("#multiplo" + id).val(nrMultipo);
    } else {
        $("#formAposta" + id).hide();
        $("#ganhosAposta" + id).hide();
        $("#multiplo" + id).val('');
    }
}


document.addEventListener('DOMContentLoaded', function() {
    if ($("#login-form").length === 0){
        carregarDados();
    }
});


function concluirAposta(id){
    const valorInput = $("#valorInput"+id).val();
    
    if (isNaN(valorInput) == false && (valorInput > 0 && valorInput != '')){
        const ganhosPotenciais = $("#ganhosPotenciais"+id).text();
        const aposta = {
            valor: valorInput,
            ganhos: ganhosPotenciais,
            idJogo: id
        };
    
        localStorage.setItem(`aposta_${id}`, JSON.stringify(aposta));
        alert('Aposta concluída e salva!');
        $("#valorInput"+id).prop('disabled', true).css('color', 'white');
        $("#concluirAposta"+id).css("display","none");
        $("#cancelarAposta"+id).css("display","block");
    
        carregarDados();
    } else {
        alert('Insira um valor válido!');
    }
}


function cancelarAposta(id){
    if (localStorage.getItem("aposta_"+id) !== null) {
        localStorage.removeItem("aposta_"+id);
        alert('Aposta cancelada!');
        $("#valorInput"+id).prop('disabled', false).prop('readonly',false).css('color', 'black').val('');
        $("#concluirAposta"+id).css("display","block");
        $("#cancelarAposta"+id).css("display","none");
        $("#ganhosPotenciais"+id).text('');
    }
}