const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { classificarPaciente } = require('./iaService'); // Importação da IA

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Uma senha secreta para gerar os tokens de login (em um projeto real, isso fica no arquivo .env)
const JWT_SECRET = 'minha_chave_secreta_triax_123';

// ==========================================
// ROTA 1: CADASTRO DE USUÁRIO
// ==========================================
app.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // 1. Verifica se o e-mail já está cadastrado
    const usuarioExistente = await prisma.user.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
    }

    // 2. Criptografa a senha antes de salvar no banco
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    // 3. Salva o novo usuário no banco de dados
    const novoUsuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
      },
    });

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', usuario: { id: novoUsuario.id, nome: novoUsuario.nome } });
  } catch (erro) {
    console.error("Erro no cadastro:", erro);
    res.status(500).json({ erro: 'Erro interno no servidor ao cadastrar.' });
  }
});

// ==========================================
// ROTA 2: LOGIN DE USUÁRIO
// ==========================================
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // 1. Busca o usuário pelo e-mail
    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // 2. Compara a senha digitada com a senha criptografada do banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta.' });
    }

    // 3. Gera um token de acesso para o usuário
    const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ mensagem: 'Login realizado com sucesso!', token, nome: usuario.nome });
  } catch (erro) {
    console.error("Erro no login:", erro);
    res.status(500).json({ erro: 'Erro interno no servidor ao fazer login.' });
  }
});

// ==========================================
// ROTAS DE TRIAGEM (COM IA INTEGRADA E CPF)
// ==========================================

// ROTA: Listar todas as triagens
app.get('/triagens', async (req, res) => {
  try {
    const triagens = await prisma.triagem.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(triagens);
  } catch (error) {
    console.error("Erro ao listar triagens:", error);
    res.status(500).json({ error: "Erro interno ao listar triagens." });
  }
});

// ROTA: Criar nova triagem (COM INTELIGÊNCIA ARTIFICIAL)
app.post('/triagens', async (req, res) => {
  try {
    const { nome, cpf, pa, temp, sat } = req.body;

    const paSistolica = Number(pa.split('/')[0]) * 10; 
    const temperaturaNum = Number(temp.replace(',', '.'));
    const saturacaoNum = Number(sat.replace('%', ''));

    const resultadoIA = classificarPaciente(paSistolica, temperaturaNum, saturacaoNum);

    const nova = await prisma.triagem.create({
      data: { 
        nome, 
        cpf,
        pa, 
        temp, 
        sat, 
        cor: resultadoIA.corPredita, 
        iaScore: resultadoIA.iaScore 
      }
    });

    res.status(201).json(nova);
  } catch (error) {
    console.error("Erro na classificação da IA:", error);
    res.status(500).json({ error: "Erro interno ao processar triagem." });
  }
});

// ROTA: Editar triagem existente (COM RECALCULO DA IA)
app.put('/triagens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, pa, temp, sat } = req.body; 
    
    const paSistolica = Number(pa.split('/')[0]) * 10; 
    const temperaturaNum = Number(String(temp).replace(',', '.'));
    const saturacaoNum = Number(String(sat).replace('%', ''));

    const resultadoIA = classificarPaciente(paSistolica, temperaturaNum, saturacaoNum);
    
    const atualizada = await prisma.triagem.update({
      where: { id: Number(id) },
      data: { 
        nome, 
        cpf, 
        pa, 
        temp, 
        sat, 
        cor: resultadoIA.corPredita, 
        iaScore: resultadoIA.iaScore 
      } 
    });
    res.json(atualizada);
  } catch (error) {
    console.error("Erro ao atualizar e reclassificar paciente:", error);
    res.status(500).json({ error: "Erro ao atualizar e reclassificar paciente." });
  }
});

// ==========================================
// ROTA: FILA DE RECEPÇÃO
// ==========================================

// Buscar quem está aguardando
app.get('/recepcao', async (req, res) => {
  try {
    const fila = await prisma.recepcao.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json(fila);
  } catch (error) {
    console.error("Erro ao buscar fila da recepção:", error);
    res.status(500).json({ error: "Erro ao buscar fila da recepção." });
  }
});

// Adicionar paciente na recepção
app.post('/recepcao', async (req, res) => {
  try {
    const { nome, cpf, entrada } = req.body;
    const novo = await prisma.recepcao.create({
      data: { nome, cpf, entrada }
    });
    res.status(201).json(novo);
  } catch (error) {
    console.error("Erro ao salvar na recepção:", error);
    res.status(500).json({ error: "Erro ao salvar na recepção." });
  }
});

// Remover paciente da recepção
app.delete('/recepcao/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.recepcao.delete({
      where: { id: Number(id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover da recepção:", error);
    res.status(500).json({ error: "Erro ao remover da recepção." });
  }
});

// ==========================================
// ROTA DE HISTÓRICO E ALTA
// ==========================================

// Buscar o histórico de pacientes que já tiveram alta
app.get('/historico', async (req, res) => {
  try {
    const historico = await prisma.historico.findMany({
      orderBy: { dataAlta: 'desc' }
    });
    res.json(historico);
  } catch (error) {
    console.error("ERRO REAL NO BACK-END (ROTA HISTÓRICO):", error); 
    res.status(500).json({ error: "Erro ao buscar histórico." });
  }
});

// ROTA NOVA AQUI: Buscar detalhes de um prontuário específico do histórico
app.get('/historico/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TRAVA DE SEGURANÇA: Verifica se não enviaram a palavra 'undefined' ou letras
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID do prontuário inválido." });
    }

    const prontuario = await prisma.historico.findUnique({
      where: { id: Number(id) }
    });

    if (!prontuario) {
      return res.status(404).json({ erro: "Prontuário não encontrado." });
    }

    res.json(prontuario);
  } catch (error) {
    console.error("ERRO REAL NO BACK-END (ROTA DETALHES):", error);
    res.status(500).json({ error: "Erro interno ao buscar prontuário." });
  }
});

// ROTA ATUALIZADA: Deletar triagem E salvar no Histórico
app.delete('/triagens/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Busca o paciente antes de deletar
    const paciente = await prisma.triagem.findUnique({
      where: { id: Number(id) }
    });

    if (paciente) {
      // 2. Salva no histórico
      await prisma.historico.create({
        data: {
          nome: paciente.nome,
          cpf: paciente.cpf,
          pa: paciente.pa,
          temp: paciente.temp,
          sat: paciente.sat,
          cor: paciente.cor,
          iaScore: paciente.iaScore,
        }
      });
    }

    // 3. Deleta da fila ativa
    await prisma.triagem.delete({
      where: { id: Number(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao processar alta do paciente:", error);
    res.status(500).json({ error: "Erro ao processar alta do paciente." });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor do TRIAX rodando com IA Ativa!');
});



// ==========================================
// INICIALIZAÇÃO DO SERVIDOR 
// ==========================================
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});