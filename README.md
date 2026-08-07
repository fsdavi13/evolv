# 🚀 Evolv

> Transformando dados de treino, corrida e alimentação em evolução.

O **Evolv** é uma aplicação web para acompanhamento de academia, corridas e alimentação, permitindo registrar atividades, acompanhar histórico e visualizar indicadores de evolução em um único lugar.

## 🌐 Aplicação online

- [Acessar o Evolv](https://evolv-fsdavi1.vercel.app)
- [Documentação da API](https://evolv-production-a9a4.up.railway.app/docs)

## ✨ Funcionalidades

### 🏋️ Academia

- Criação de divisões de treino;
- Cadastro de exercícios por divisão;
- Registro de peso e repetições por série;
- Continuação de treinos em andamento;
- Cancelamento e finalização de treinos;
- Histórico de treinos realizados;
- Utilização do último treino da mesma divisão como referência;
- Sugestão de quantidade de séries com base no treino anterior;
- Indicador de progressão semanal por exercício.

### 🏃 Corridas

- Registro de corridas por data;
- Distância percorrida;
- Pace;
- Tempo total calculado automaticamente;
- Observações;
- Edição e exclusão de registros;
- Histórico de corridas;
- Indicadores semanais de:
  - distância total;
  - tempo total;
  - melhor pace.

### 🥗 Dieta

- Busca de alimentos;
- Base nutricional da TACO;
- Registro de alimentos por refeição;
- Quantidade consumida em gramas;
- Cálculo automático de:
  - calorias;
  - proteínas;
  - carboidratos;
  - gorduras;
- Totais nutricionais diários;
- Histórico de registros por data;
- Exclusão de alimentos registrados.

### 👤 Perfil

- Peso;
- Altura;
- Idade;
- Sexo;
- Nível de atividade física;
- Dados utilizados nos cálculos apresentados no dashboard.

### 📊 Dashboard

Visão geral dos principais dados do usuário:

- Progressão semanal dos treinos;
- Quantidade de treinos realizados;
- Resumo semanal das corridas;
- Distância total;
- Tempo total;
- Melhor pace;
- Consumo calórico diário;
- Balanço calórico.

## 🛠️ Tecnologias

### Frontend

- React
- TypeScript
- Vite
- Axios
- CSS

### Backend

- Python
- FastAPI
- SQLite
- Uvicorn

### Dados e testes

- Pandas
- OpenPyXL
- Pytest
- TACO — Tabela Brasileira de Composição de Alimentos

### Deploy

- Vercel — frontend;
- Railway — backend e persistência do banco de dados.

## 🏗️ Estrutura do projeto

```text
evolv/
├── backend/
│   ├── api/
│   ├── dao/
│   ├── database/
│   ├── models/
│   └── services/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── types/
│       └── utils/
│
├── requirements.txt
└── README.md
```

## 📱 Responsividade

A interface foi desenvolvida com abordagem mobile-first e adaptada para diferentes tamanhos de tela, incluindo testes em dispositivos móveis reais.

## 🧪 Testes

O backend possui testes automatizados com **Pytest**.

Para executar:

```bash
python -m pytest
```

Para validar o frontend:

```bash
cd frontend
npm install
npm run build
```

## ▶️ Executando localmente

### Backend

Na raiz do projeto:

```bash
pip install -r requirements.txt
python -m uvicorn backend.api.main:app --reload
```

API:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicação:

```text
http://localhost:5173
```

Crie um arquivo `.env.local` dentro de `frontend`:

```env
VITE_API_URL=http://localhost:8000
```

## 📌 Status

**Versão 1 concluída e publicada.**

O projeto foi desenvolvido com foco em organização de código, integração entre frontend e backend, persistência de dados, responsividade e aplicação prática de conceitos de desenvolvimento de software.
