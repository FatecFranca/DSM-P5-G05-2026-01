# Sistema de Triagem Médica Digital (Protocolo de Manchester)

Uma aplicação para auxiliar enfermeiros ou recepcionistas de pronto-socorro na classificação de risco de pacientes.

## Integrantes

- Ana Júlia Alves Mota
- Lauane Gabriela de Araújo Toledo
- Pedro Henrique Cintra Silva

---

## 🚀 Como Rodar o Projeto

Para o ecossistema funcionar de ponta a ponta, abra **três terminais separados** no VS Code e execute cada um dos seguintes serviços:

### Terminal 1: Inteligência Artificial (Python)
```
cd triax-ia
# Ativar ambiente (se houver): .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn api_ia:app --reload --port 8000
```

### Terminal 2: Backend (Node.js)
``` bash
cd triax-backend
npm install      # (Apenas na primeira vez ou se clonar o projeto agora)
npm run dev
```


### Terminal 3: Frontend (React)
```bash
cd triax-web
npm install      # (Apenas na primeira vez ou se clonar o projeto agora)
npm run dev
```

### Terminal 4: Mobile
```bash
cd triax-mobile
npx expo start
```
