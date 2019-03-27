$(document).ready(function(){
	clean();
});
$(function(){
	$('#words').submit(function(e){
		var inputWord = $('#register_words');
		if(!testWord(inputWord.val())) {
			/*função para pegar as palavras*/
			generate_submitForm();
			register_estate();
			Tabela = generate_lines();
			table_html(Tabela);
			inputWord.val('');
			e.preventDefault();
			return false;
		} else {
			alert('"' + inputWord.val() + '"' + ' não faz parte da gramática!');
			clean();
		}
	});
	
	$('#getWords').keyup(function(e){
		if(Tabela.length > 0){
			valida_palavra(e);
		}
	});
});

function testWord(word) {
	let exprRegular = /([^A-Za-z_])+$/;
	if(exprRegular.test(word)) {
		return true;
	}
	return false;
}

function register_estate(){
	/*pega o tamanho total das palavras e percorre*/
	for (var i = 0; i < words.length; i++) {
		/*estado atual*/
		var actually_state = 0;
		var palavra_vetor = words[i];
		/*for para percorrer as palavras*/
		for(var j = 0; j < palavra_vetor.length; j++){

			if(typeof states[actually_state][palavra_vetor[j]] === 'undefined'){
				/*vai comparando as palavras letra por letra*/
				var next_state = statesGlobal + 1;
				states[actually_state][palavra_vetor[j]] = next_state;
				states[next_state] = [];
				statesGlobal = actually_state = next_state;
			} else {
				actually_state = states[actually_state][palavra_vetor[j]];
			}
			/*caso nao tiver mais nada a palavra é final*/
			if(j == palavra_vetor.length - 1){
				states[actually_state]['final'] = true;
			}
		};
	};
}

/*função gerar linhas*/
function generate_lines(){
	var vetor_states = [];
	for (var i = 0; i < states.length; i++) {
		var aux = [];
		aux['states'] = i;
		/*mapa vai de A ate Z*/
		var primeiro = 'a';
		var ultimo = 'z';
		for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
			var letra = String.fromCharCode(j);
			if(typeof states[i][letra] === 'undefined'){
				aux[letra] = '-'
			} else {
				aux[letra] = states[i][letra]
			}
		}
		/*se terminar com espaço é estado final*/
		if(typeof states[i]['final'] !== 'undefined'){
			aux['final'] = true;
		}
		vetor_states.push(aux);
	};
	// console.log(vetor_states);
	/*retorna o estado de cada vetor*/
	return vetor_states;
}

function generate_submitForm(){
	/*Pega as palavras do campo input*/
	var palavras = $('#register_words').val();
	var $save_word = $('#save-words');
	/*transforma as palavras em minusculo*/
	palavras = palavras.toLowerCase();
	/*cada espaço que tiver vai quebrar a string*/
	palavras = palavras.split(' ');
	/*for para percorrer as palavras adicionadas*/
	for (var i = 0; i < palavras.length; i++) {
		if(words.indexOf(palavras[i]) < 0 && palavras[i].length > 0){
			console.log(words.length);
			if((words.length <= 0)) {
				$save_word.append(palavras[i]);
			} else {
				$save_word.append(', ' + palavras[i]);
			}
			/*puxa as palavras cadastradas*/
			words.push(palavras[i]);
		}
	};
}
/*variaves de estado*/
var words = [];
var states = [[]];
var statesGlobal = 0;
var statesIteracao = [0];
var Tabela = [];

function table_html(vetor_states){
	/*declara tabela com o id da tebela do html*/
	tabela = $('#automato');
	tabela.html('');
	
	/*criar linhas e colunas*/
	var tr = $( document.createElement('tr') );
	var th = $( document.createElement('th') );
	th.html('Estado'); 
	tr.append(th);
	var primeiro = 'a';
	var ultimo = 'z';
	for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
		var th = $( document.createElement('th') );
		th.html(String.fromCharCode(j));
		tr.append(th);
	}
	tabela.append(tr);

	/*percorre o vetor adicionando os estados*/
	for(var i = 0; i < vetor_states.length; i++){
		var tr = $( document.createElement('tr') );
		var td = $( document.createElement('td') );
		/*quando for final, no estado será adicionado '*' */
		tr.addClass('tr-ex');
		if(vetor_states[i]['final']){
			td.html('q' + vetor_states[i]['states'] + '*');
		} else {
			/*se não é final, adiciona o estado normal*/
			td.html('q' + vetor_states[i]['states']);
		}
		tr.append(td);
		tr.addClass('states_'+vetor_states[i]['states']);
		var primeiro = 'a';
		var ultimo = 'z';
		/*percorre o automato adicionando a posição das letras*/
		for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
			var letra = String.fromCharCode(j);
			/*pega a letra e adiciona ela no automato*/
			var td = $( document.createElement('td') );
			td.addClass('letra_'+letra);
			if(vetor_states[i][letra] != '-'){
				td.html('q' + vetor_states[i][letra]);
			}
			tr.append(td);
		}
		tabela.append(tr);
	}
}

/*função para validar as palavras*/
function valida_palavra(event){
	/*seta primeira e ultima variavel*/
	var primeiro = 'a';
	var ultimo = 'z';
	/*palavra atual pega no campo*/
	var palavras = $('#getWords').val();
	if(palavras.length == 0){ 
		/*inicia com todas as classes removidas*/
		$('#getWords').removeClass('acerto');
		$('#getWords').removeClass('erro');
		$('#automato tr').removeClass('states_selecionado');
		$('#automato td').removeClass('letra_selecionada');
	}

	var states = 0;
	/*percorre as palavras, caso tiver algum simbolo inválido vai dar mensagem de error*/
	for (var i = 0; i < palavras.length; i++) {
		if(palavras[i].charCodeAt(0) >= primeiro.charCodeAt(0) && palavras[i].charCodeAt(0) <= ultimo.charCodeAt(0)){
			highlightState(states, palavras[i]);
			if(Tabela[states][palavras[i]] != '-'){ 
				states = Tabela[states][palavras[i]];
				onAccept();
			} else { 
				onError();
				break;
			}
			/*caso tiver espaço seta como estado final*/
		} else if(palavras[i] == ' '){ 
			highlightState(states, palavras[i]);
			if(Tabela[states]['final']){ 
				states = 0;
				$('#getWords').val('');
			} else { 
				onError();
				break;
			}
			/*exibe a mensagem de error*/
		} else {
			alert('Caractere não suportado: ' + palavras[i]);
			break;
		}
	};
}

/*função palavra errada, adiciona classe erro e remove classe acerto*/
function onError(){
	$('#getWords').removeClass('acerto');
	$('#getWords').addClass('erro');
}

/*função palavra certa, adiciona classe acerto e remove classe erro*/
function onAccept(){
	$('#getWords').addClass('acerto');
	$('#getWords').removeClass('erro');
}

/*função para colorir as linhas e as colunas*/
/*remove as linhas e colunas anteriores selecionas e adiciona cor nas novas*/
function highlightState(state, letter){
	$('#automato tr').removeClass('states_selecionado');
	$('#automato td').removeClass('letra_selecionada');
	$('#automato .states_' + state).addClass('states_selecionado');
	$('#automato .letra_' + letter).addClass('letra_selecionada');
}

function clean() {
	$('#reset').on('click', function() {
		words = [];
		states = [[]];
		statesGlobal = 0;
		statesIteracao = [0];
		Tabela = [];
		$('#save-words').html('');
		var trTrable = $('tr.tr-ex');
		trTrable.html('');
		$('#register_words').val('');
		$('#getWords').val('');
		$('#getWords').removeClass('acerto');
		$('#getWords').removeClass('erro');
	});
}