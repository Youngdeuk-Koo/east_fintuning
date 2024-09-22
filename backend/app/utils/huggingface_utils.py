import os
import shutil
import tempfile
from huggingface_hub import HfApi, HfFolder, login

# 환경 변수로 임시 디렉토리 설정
os.environ['TMPDIR'] = '/data/temp'

def login_to_hub(token):
    login(token=token, add_to_git_credential=True)

# 임시 디렉토리를 지정하여 모델 업로드
def upload_model_to_hub(model, tokenizer, repo_name, api_token, save_dir=None):
    # 임시 디렉토리를 /data 아래에 생성
    temp_base_dir = '/data/huggingface_temp'
    os.makedirs(temp_base_dir, exist_ok=True)

    print(f"임시 디렉토리 설정: {temp_base_dir}")

    # Hugging Face API 인스턴스를 초기화하고 토큰을 설정합니다.
    api = HfApi()
    HfFolder.save_token(api_token)

    try:
        # 저장소 생성 (저장소가 이미 존재하는 경우 예외 처리)
        api.create_repo(repo_name, private=True, exist_ok=True, token=api_token)
        print(f"Hugging Face 저장소 생성 또는 확인: {repo_name}")
    except Exception as e:
        print(f"Hugging Face 저장소 생성 중 오류 발생 (이미 존재할 수 있음): {e}")

    try:
        # 모델과 토크나이저를 Hugging Face Hub에 푸시
        print("모델 업로드 시작...")
        with tempfile.TemporaryDirectory(dir=temp_base_dir) as temp_dir:
            print(f"사용된 임시 디렉토리: {temp_dir}")
            model.push_to_hub(repo_name, use_temp_dir=True, token=api_token, temp_dir=temp_dir)
            tokenizer.push_to_hub(repo_name, use_temp_dir=True, token=api_token, temp_dir=temp_dir)
        print("모델 업로드 완료")

    except Exception as e:
        print(f"모델을 Hugging Face Hub에 푸시하는 중 오류 발생: {e}")
        print("로컬에 모델 저장을 시도합니다.")
        import traceback
        print(traceback.format_exc())

        if save_dir:
            os.makedirs(save_dir, exist_ok=True)
            try:
                model.save_pretrained(save_dir)
                tokenizer.save_pretrained(save_dir)
                print(f"모델과 토크나이저가 로컬에 저장되었습니다: {save_dir}")
            except Exception as local_save_error:
                print(f"로컬에 모델 저장 중 오류 발생: {local_save_error}")
        else:
            print("로컬 저장 경로가 지정되지 않았습니다. 모델을 저장할 수 없습니다.")

    print("업로드 프로세스 완료")

    # 임시 디렉토리 정리
    try:
        shutil.rmtree(temp_base_dir)
        print(f"임시 디렉토리 삭제 완료: {temp_base_dir}")
    except Exception as e:
        print(f"임시 디렉토리 삭제 중 오류 발생: {e}")