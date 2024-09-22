import json
import pandas as pd
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from transformers import AutoTokenizer
from typing import Dict, Any, Optional
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
import uuid

from app.services.model_init import get_task_status, set_task_status, get_current_model_name, get_dataset, set_dataset, get_tokenizer, get_uploaded_df, set_uploaded_df

router = APIRouter()

class TokenizerSettingsRequest(BaseModel):
    settings: Dict[str, Any]
    test_set_ratio: float

    class Config:
        arbitrary_types_allowed = True

class DatasetRequest(BaseModel):
    columnMapping: Dict[str, str]
    tokenizerSettings: Dict[str, Any]
    testSetRatio: float
    shuffle: bool
    randomState: Optional[int] = None

    class Config:
        arbitrary_types_allowed = True

@router.post("/uploadfile")
async def upload_file(file: UploadFile = File(...)):
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)
        
        # NaN 또는 무한대 값을 처리
        df = df.replace({float('inf'): None, float('-inf'): None})
        df = df.fillna('')  # NaN 값을 빈 문자열로 대체
        
        # 문장 길이 분포 계산
        sentence_lengths = df.applymap(lambda x: len(str(x))).to_dict(orient="records")
        
        # 단어 빈도 계산
        all_text = ' '.join(df.apply(lambda row: ' '.join(row.values.astype(str)), axis=1))
        word_freq = Counter(all_text.split())
        most_common_words = word_freq.most_common(20)
        
        # TF-IDF 계산
        tfidf_scores = {}
        for col in df.columns:
            vectorizer = TfidfVectorizer()
            tfidf_matrix = vectorizer.fit_transform(df[col].astype(str))
            scores = dict(zip(vectorizer.get_feature_names_out(), tfidf_matrix.sum(axis=0).tolist()[0]))
            sorted_scores = sorted(scores.items(), key=lambda item: item[1], reverse=True)[:40]
            tfidf_scores[col] = sorted_scores
        
        # 각 컬럼의 통계 계산
        column_stats = {}
        for col in df.columns:
            lengths = df[col].apply(lambda x: len(str(x)))
            column_stats[col] = {
                "min": lengths.min(),
                "max": lengths.max(),
                "avg": lengths.mean()
            }
        
        # 데이터프레임의 첫 10줄을 반환
        head_data = df.head(10).to_dict(orient="records")
        columns = df.columns.tolist()
        
        # numpy 데이터 타입을 Python 기본 데이터 타입으로 변환
        head_data = json.loads(json.dumps(head_data, default=str))
        sentence_lengths = json.loads(json.dumps(sentence_lengths, default=str))
        column_stats = json.loads(json.dumps(column_stats, default=str))
        
        # 업로드된 DataFrame을 전역 변수로 저장
        set_uploaded_df(df)
        
        return {
            "columns": columns,
            "data": head_data,
            "sentence_lengths": sentence_lengths,
            "word_freq": most_common_words,
            "tfidf_scores": tfidf_scores,
            "column_stats": column_stats
        }
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="빈 파일입니다.")
    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail="파일을 파싱하는 중 오류가 발생했습니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def split_dataset(df: pd.DataFrame, test_size: float, shuffle: bool, random_state: Optional[int]):
    train_df, test_df = train_test_split(df, test_size=test_size, shuffle=shuffle, random_state=random_state)
    return train_df, test_df


def create_dataset_task(task_id: str, request: DatasetRequest, tokenizer: AutoTokenizer):
    try:
        # 토크나이저 설정
        tokenizer_settings = request.tokenizerSettings

        # 업로드된 DataFrame 가져오기
        df = get_uploaded_df()
        if df is None:
            raise HTTPException(status_code=400, detail="업로드된 파일이 없습니다.")

        # 데이터셋 분리
        train_df, test_df = split_dataset(df, request.testSetRatio, request.shuffle, request.randomState)

        max_sequence_length = 0  # 최대 시퀀스 길이 초기화

        def process_dataframe(dataframe):
            nonlocal max_sequence_length
            dataset = []
            for _, row in dataframe.iterrows():
                system_message = row[request.columnMapping['system']] if request.columnMapping['system'] != 'None' else ''
                user_message = row[request.columnMapping['user']] if request.columnMapping['user'] != 'None' else ''
                label = row[request.columnMapping['label']] if request.columnMapping['label'] != 'None' else ''

                prompt = f"{tokenizer.bos_token}system{system_message}user{user_message}assistant\n{label}"
                encoded = tokenizer(prompt + label, **tokenizer_settings)

                # labels 설정: 프롬프트 부분은 -100으로, 응답 부분은 그대로 유지
                prompt_length = len(tokenizer.encode(prompt + "assistant\n"))
                labels = [-100] * prompt_length + encoded["input_ids"].squeeze().tolist()[prompt_length:]

                # 최대 시퀀스 길이 업데이트
                max_sequence_length = max(max_sequence_length, len(encoded["input_ids"].squeeze().tolist()))

                dataset_item = {
                    "input_ids": encoded["input_ids"].squeeze().tolist(),
                    "labels": labels
                }

                # attention_mask가 존재하는 경우에만 추가
                if "attention_mask" in encoded:
                    dataset_item["attention_mask"] = encoded["attention_mask"].squeeze().tolist()

                dataset.append(dataset_item)
            return dataset

        # train과 test 데이터셋 생성
        train_dataset = process_dataframe(train_df)
        test_dataset = process_dataframe(test_df)

        # max_length가 None인 경우 최대 시퀀스 길이로 설정
        if tokenizer_settings.get('max_length') is None:
            tokenizer_settings['max_length'] = max_sequence_length

        # 전역 변수에 데이터셋 저장
        set_dataset({"train": train_dataset, "test": test_dataset})

        # 작업 상태 업데이트
        set_task_status(task_id, {
            "status": "completed",
            "train_size": len(train_dataset),
            "test_size": len(test_dataset),
            "max_sequence_length": max_sequence_length  # 최대 시퀀스 길이 추가
        })
    except Exception as e:
        set_task_status(task_id, {"status": "failed", "error": str(e)})


@router.post("/create-dataset")
async def create_dataset(request: DatasetRequest, background_tasks: BackgroundTasks):
    current_model_name = get_current_model_name()
    
    if not get_tokenizer(current_model_name):
        raise HTTPException(status_code=400, detail="모델이 다운로드되지 않았습니다.")
    
    task_id = str(uuid.uuid4())
    set_task_status(task_id, {"status": "in_progress"})
    background_tasks.add_task(create_dataset_task, task_id, request, get_tokenizer(current_model_name))
    return {"task_id": task_id}

@router.get("/dataset-status/{task_id}")
async def dataset_status(task_id: str):
    status = get_task_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="작업 ID를 찾을 수 없습니다.")
    
    if status["status"] == "completed":
        dataset = get_dataset()
        if dataset and dataset["train"]:
            sample_data = dataset["train"][0]  # 첫 번째 데이터 샘플
            status["sample_data"] = sample_data
    
    return status