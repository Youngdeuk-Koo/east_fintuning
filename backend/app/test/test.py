import os
import shutil
from huggingface_hub import hf_hub_download, HfApi
from requests.exceptions import HTTPError
from tqdm import tqdm

model_name = "meta-llama/Meta-Llama-3.1-8B-Instruct"
api_token = "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"  # Hugging Face API 토큰

download_progress = {}

def download_model(model_name: str, api_token: str):
    try:
        local_dir = f"./{model_name.replace('/', '_')}"
        
        # 기존 디렉토리가 존재하면 삭제
        if os.path.exists(local_dir):
            shutil.rmtree(local_dir)
            print(f"Existing directory {local_dir} removed.")

        # Hugging Face API 인스턴스 생성
        api = HfApi()

        # 모델 파일 목록 가져오기
        files = api.list_repo_files(repo_id=model_name, token=api_token)
        total_size = 0
        downloaded_size = 0

        # 파일별 다운로드 진행 상황 추적
        for file in files:
            file_info = api.repo_file_info(repo_id=model_name, filename=file, token=api_token)
            total_size += file_info.size

        for file in tqdm(files, desc="Downloading files", unit="file"):
            hf_hub_download(repo_id=model_name, filename=file, use_auth_token=api_token, local_dir=local_dir)
            file_info = api.repo_file_info(repo_id=model_name, filename=file, token=api_token)
            downloaded_size += file_info.size
            download_progress[model_name] = {
                "progress": int((downloaded_size / total_size) * 100),
                "total_size": total_size,
                "downloaded_size": downloaded_size
            }
            print(f"Downloading {file}: {download_progress[model_name]['progress']}% complete")

        download_progress[model_name] = {
            "progress": 100,
            "total_size": total_size,
            "downloaded_size": downloaded_size
        }
        print(f"Model and tokenizer downloaded successfully to {local_dir}.")

    except HTTPError as e:
        if e.response.status_code == 416:
            # Handle the case where the file is already downloaded
            download_progress[model_name] = {
                "progress": 100,
                "total_size": 0,
                "downloaded_size": 0
            }
            print(f"File already downloaded: {e}")
        else:
            print(f"Model {model_name} not found: {str(e)}")
    except Exception as e:
        download_progress[model_name] = {
            "progress": 0,
            "total_size": 0,
            "downloaded_size": 0
        }
        print(f"Error downloading model: {str(e)}")

# 테스트 실행
download_model(model_name, api_token)