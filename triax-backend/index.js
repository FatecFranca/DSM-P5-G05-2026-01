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
    console.error(erro);
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
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno no servidor ao fazer login.' });
  }
});

// ==========================================
// ROTAS DE TRIAGEM (COM IA INTEGRADA E CPF)
// ==========================================

// ROTA: Listar todas as triagens
app.get('/triagens', async (req, res) => {
  const triagens = await prisma.triagem.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(triagens);
});

// ROTA: Criar nova triagem (COM INTELIGÊNCIA ARTIFICIAL)
app.post('/triagens', async (req, res) => {
  try {
    // Apenas recebe os sinais vitais e o CPF (A cor não vem mais do front-end)
    const { nome, cpf, pa, temp, sat } = req.body;

    // Converte os textos para números para a IA entender
    const paSistolica = Number(pa.split('/')[0]) * 10; 
    const temperaturaNum = Number(temp.replace(',', '.'));
    const saturacaoNum = Number(sat.replace('%', ''));

    // Chama o algoritmo KNN
    const resultadoIA = classificarPaciente(paSistolica, temperaturaNum, saturacaoNum);

    // Salva no banco de dados com a classificação da IA e o CPF
    const nova = await prisma.triagem.create({
      data: { 
        nome, 
        cpf, // <-- CPF adicionado aqui
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

// ROTA: Editar triagem existente
app.put('/triagens/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, cpf, pa, temp, sat, cor, iaScore } = req.body; // <-- CPF adicionado aqui
  
  const atualizada = await prisma.triagem.update({
    where: { id: Number(id) },
    data: { nome, cpf, pa, temp, sat, cor, iaScore } // <-- CPF adicionado aqui
  });
  res.json(atualizada);
});

// ROTA: Deletar triagem
app.delete('/triagens/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.triagem.delete({
      where: { id: Number(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar triagem." });
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
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});