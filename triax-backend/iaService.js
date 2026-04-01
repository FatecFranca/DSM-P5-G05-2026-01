function classificarPaciente(paSistolica, temperatura, saturacao) {
  // Cores do Protocolo de Manchester
  const VERMELHO = '#EF4444'; // Emergência (0 min)
  const LARANJA = '#F97316';  // Muito Urgente (10 min)
  const AMARELO = '#EAB308';  // Urgente (60 min)
  const VERDE = '#84CC16';    // Pouco Urgente (120 min)
  const AZUL = '#3B82F6';     // Não Urgente (240 min)

  // 1. Regras de VERMELHO (Risco de Morte Imediato)
  // Hipotermia severa, febre altíssima, saturação crítica ou PA em colapso/hipertensão severa
  if (temperatura <= 34 || temperatura >= 40 || saturacao <= 89 || paSistolica <= 80 || paSistolica >= 220) {
    return { corPredita: VERMELHO, iaScore: 98 };
  }
  
  // 2. Regras de LARANJA (Muito Urgente)
  if ((temperatura > 34 && temperatura <= 35.5) || (temperatura >= 39 && temperatura < 40) || (saturacao >= 90 && saturacao <= 92) || (paSistolica > 80 && paSistolica <= 90) || (paSistolica >= 200 && paSistolica < 220)) {
    return { corPredita: LARANJA, iaScore: 88 };
  }

  // 3. Regras de AMARELO (Urgente)
  if ((temperatura > 38.5 && temperatura < 39) || (saturacao >= 93 && saturacao <= 94) || (paSistolica >= 180 && paSistolica < 200)) {
    return { corPredita: AMARELO, iaScore: 75 };
  }

  // 4. Regras de VERDE (Pouco Urgente)
  if ((temperatura >= 37.5 && temperatura <= 38.5) || (saturacao >= 95 && saturacao <= 97) || (paSistolica >= 140 && paSistolica < 180)) {
    return { corPredita: VERDE, iaScore: 82 };
  }

  // 5. AZUL (Não Urgente)
  // Sinais vitais dentro da normalidade: Temp ~36-37.4, Sat >= 98, PA 90-139
  return { corPredita: AZUL, iaScore: 95 };
}

module.exports = { classificarPaciente };