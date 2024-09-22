from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import vllm
import psutil
import socket
import threading

router = APIRouter()

class ModelRequest(BaseModel):
    model_name: str

# 전역 변수로 모델을 저장
