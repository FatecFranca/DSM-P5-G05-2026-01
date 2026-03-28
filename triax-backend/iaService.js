const KNN = require('ml-knn');

// 1. DATASET DE TREINAMENTO (O "Conhecimento" da IA)
// [Pressão Sistólica (alta), Temperatura, Saturação]

const dadosTreinamento = [
  // SINAIS NORMAIS -> VERDE (Classe 0)
  [120, 36.5, 98], [110, 36.8, 99], [130, 37.0, 97], [125, 36.6, 98],
  
  // FEBRE/ALTERAÇÕES LEVES -> AMARELO (Classe 1)
  [140, 38.5, 95], [110, 38.0, 96], [145, 37.5, 94], [135, 38.2, 95],
  
  // SINAIS GRAVES -> LARANJA (Classe 2)
  [160, 39.5, 90], [170, 39.0, 91], [155, 39.8, 89], [90, 35.0, 90],
  
  // RISCO DE MORTE -> VERMELHO (Classe 3)
  [190, 40.0, 85], [200, 41.0, 80], [80, 34.0, 82], [210, 39.5, 84]
];

// Rótulos correspondentes (0: Verde, 1: Amarelo, 2: Laranja, 3: Vermelho)
const rotulosTreinamento = [
  0, 0, 0, 0, // Verdes
  1, 1, 1, 1, // Amarelos
  2, 2, 2, 2, // Laranjas
  3, 3, 3, 3  // Vermelhos
];

// INSTANCIAR E TREINAR O MODELO
// k = 3 significa que ele vai olhar os 3 casos mais parecidos para tomar a decisão
const modeloKNN = new KNN(dadosTreinamento, rotulosTreinamento, { k: 3 });

// 3. FUNÇÃO QUE O SEU SERVIDOR VAI CHAMAR
function classificarPaciente(paSistolica, temperatura, saturacao) {
  // O modelo recebe os dados do paciente novo
  const pacienteNovo = [Number(paSistolica), Number(temperatura), Number(saturacao)];
  
  // Faz a predição
  const predicao = modeloKNN.predict(pacienteNovo);

  // Traduz o número de volta para as cores do seu Front-End
  const dicionarioCores = {
    0: '#84CC16', // Verde (Pouco Urgente)
    1: '#EAB308', // Amarelo (Urgente)
    2: '#F97316', // Laranja (Muito Urgente)
    3: '#EF4444'  // Vermelho (Emergência)
  };

  // Simula um Score de confiança baseado na gravidade (opcional para o seu painel)
  const iaScore = predicao === 3 ? 99 : predicao === 2 ? 85 : predicao === 1 ? 60 : 40;

  return {
    corPredita: dicionarioCores[predicao],
    iaScore: iaScore
  };
}

module.exports = { classificarPaciente };