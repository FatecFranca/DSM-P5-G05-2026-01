from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carregar o modelo e a lista de colunas que você baixou do Colab
modelo = joblib.load('modelo_triagem.pkl')
colunas_modelo = joblib.load('colunas_modelo.pkl')

# Estrutura dos dados que o frontend vai enviar
class DadosPaciente(BaseModel):
    age: float
    heart_rate: float
    systolic_blood_pressure: float
    oxygen_saturation: float
    body_temperature: float
    pain_level: int
    chronic_disease_count: int
    previous_er_visits: int
    arrival_mode: str  # 'walk_in', 'ambulance' ou 'wheelchair'

@app.post("/predict")
def prever_score(paciente: DadosPaciente):
    # 1. Converte o JSON recebido para um dicionário
    dados = paciente.model_dump()
    
    # 2. Cria o DataFrame de 1 linha
    df_input = pd.DataFrame([dados])
    
    # 3. Faz o mesmo pré-processamento (get_dummies)
    df_input = pd.get_dummies(df_input, columns=['arrival_mode'])
    
    # Reindexa para bater exatamente com as colunas do modelo
    df_input = df_input.reindex(columns=colunas_modelo, fill_value=0)
    
    # 4. Calcula o nível e a probabilidade (IA Score)
    classe_prevista = int(modelo.predict(df_input)[0])
    probabilidades = modelo.predict_proba(df_input)[0]
    ia_score_percentual = round(max(probabilidades) * 100, 2)
    
    return {
        "triage_level_suggested": classe_prevista,
        "ia_score": ia_score_percentual
    }