from fastapi import APIRouter
from app.router.endpoint import init_model_test
from app.router.endpoint import data_process
from app.router.endpoint import fine_tuning
from app.router.endpoint import vllm

recruit_api_router = APIRouter()
recruit_api_router.include_router(init_model_test.router, tags=['init_model_test'])
recruit_api_router.include_router(data_process.router, tags=['data_process'])
recruit_api_router.include_router(fine_tuning.router, tags=['fine_tuning'])
recruit_api_router.include_router(vllm.router, tags=['vllm'])