from typing import Dict, Any
import pandas as pd

# 전역 변수로 모델, 토크나이저, 모델 이름을 관리
models = {}
tokenizers = {}
download_status: Dict[str, str] = {}
current_model_name = None
task_status = {}
dataset = None  # 전역 변수로 데이터셋 관리
uploaded_df = None  # 전역 변수로 업로드된 DataFrame 관리

def get_current_model_name():
    global current_model_name
    return current_model_name

def set_current_model_name(model_name: str):
    global current_model_name
    current_model_name = model_name

def get_dataset():
    global dataset
    return dataset

def set_dataset(new_dataset):
    global dataset
    dataset = new_dataset

def get_model(model_name: str):
    global models
    return models.get(model_name)

def set_model(model_name: str, model):
    global models
    models[model_name] = model

def get_tokenizer(model_name: str):
    global tokenizers
    return tokenizers.get(model_name)

def set_tokenizer(model_name: str, tokenizer):
    global tokenizers
    tokenizers[model_name] = tokenizer

def get_task_status(task_id: str):
    global task_status
    return task_status.get(task_id)

def set_task_status(task_id: str, status: Dict[str, Any]):
    global task_status
    task_status[task_id] = status

def get_uploaded_df():
    global uploaded_df
    return uploaded_df

def set_uploaded_df(df: pd.DataFrame):
    global uploaded_df
    uploaded_df = df