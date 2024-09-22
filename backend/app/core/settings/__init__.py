import os
from dotenv import load_dotenv

from fastapi import HTTPException, status

from app.core.settings.base import Config

from app.utils.logging import logger

common_config_path = "app/core/settings/config/common.yaml"
ENVIRONMENT = os.getenv("PYTHON_PROFILES_ACTIVE", "dev")

def initialize_config():
    
    if ENVIRONMENT == "dev":
        dotenv_path = ".env.development"
        env_config_path = "app/core/settings/config/dev.yaml"
    elif ENVIRONMENT == "prod":
        dotenv_path = ".env.production"
        env_config_path = "app/core/settings/config/prod.yaml"
    else:
        raise ValueError("Invalid environment name")

    load_dotenv(dotenv_path)
    return Config.initialize(common_config_path, env_config_path)


# 현재 설정된 환경을 로깅
config = initialize_config()

logger.info(f"Current environment is set to: {ENVIRONMENT}")

# openai_api_key = os.environ.get('OPENAI_KEY')
# anthropic_api_key = os.environ.get('ANTHROPIC_KEY')

# if openai_api_key is None:
#     raise HTTPException(
#         status_code=status.HTTP_404_NOT_FOUND,
#         detail={"error": "api key error", "message": "환경 변수에서 문제가 발생했습니다"}
#     )
    
# if anthropic_api_key is None:
#     raise HTTPException(
#         status_code=status.HTTP_404_NOT_FOUND,
#         detail={"error": "api key error", "message": "환경 변수에서 문제가 발생했습니다"}
#     )