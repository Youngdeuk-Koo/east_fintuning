from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any
import time
import torch
import asyncio
import json

from app.services.model_init import get_model, get_tokenizer, set_task_status, get_current_model_name
from app.services.train_utils import train_model, progress_status, stop_training

router = APIRouter()

class FineTuneRequest(BaseModel):
    modelAlias: str
    modelSize: str
    mainProjectName: str
    subProjectName: str
    workerName: str
    usePeft: bool
    useDeepSpeed: bool
    quantizationType: str
    useHF: bool
    useWandB: bool
    metrics: List[str]
    advancedSettings: Dict[str, Any]

@router.get("/progress/{task_id}")
async def get_progress(task_id: str):
    return progress_status.get(task_id, {"status": "unknown", "progress": 0})

@router.get("/gpu-info")
async def get_gpu_info():
    gpu_count = torch.cuda.device_count()
    gpus = []
    for i in range(gpu_count):
        gpu_info = {
            "name": torch.cuda.get_device_name(i),
            "total_memory": torch.cuda.get_device_properties(i).total_memory,
            "memory_allocated": torch.cuda.memory_allocated(i),
            "memory_reserved": torch.cuda.memory_reserved(i),
            "memory_free": torch.cuda.get_device_properties(i).total_memory - torch.cuda.memory_allocated(i)
        }
        gpus.append(gpu_info)
    return {"gpu_count": gpu_count, "gpus": gpus}

@router.post("/fine-tune")
async def fine_tune(request: FineTuneRequest, background_tasks: BackgroundTasks):
    model_name = get_current_model_name()
    model = get_model(model_name)
    tokenizer = get_tokenizer(model_name)
    
    if not model or not tokenizer:
        raise HTTPException(status_code=404, detail="Model or tokenizer not found")
    
    # task_id 생성
    task_id = f"{request.mainProjectName}_{request.subProjectName}_{int(time.time())}"
    set_task_status(task_id, {"status": "in_progress"})
    progress_status[task_id] = {"status": "in_progress", "progress": 0}
    
    print(request)
    
    def run_training():
        try:
            train_model(
                model=model,
                tokenizer=tokenizer,
                model_alias=request.modelAlias,
                model_size=request.modelSize,
                main_project_name=request.mainProjectName,
                sub_project_name=request.subProjectName,
                worker_name=request.workerName,
                use_peft=request.usePeft,
                use_deepspeed=request.useDeepSpeed,
                quantization_type=request.quantizationType,
                use_hf=request.useHF,
                use_wandb=request.useWandB,
                metrics=request.metrics,
                advanced_settings=request.advancedSettings,
                task_id=task_id
            )
            set_task_status(task_id, {"status": "completed"})
            progress_status[task_id]["status"] = "completed"
        except Exception as e:
            set_task_status(task_id, {"status": "failed", "error": str(e)})
            progress_status[task_id]["status"] = "failed"
            progress_status[task_id]["error"] = str(e)
    
    background_tasks.add_task(run_training)
    
    return {"task_id": task_id, "status": "in_progress"}


@router.post("/stop-fine-tune/{task_id}")
async def stop_fine_tune(task_id: str):
    if task_id not in progress_status:
        raise HTTPException(status_code=404, detail="Task not found")
    
    stop_training(task_id)
    set_task_status(task_id, {"status": "stopped"})
    progress_status[task_id]["status"] = "stopped"
    
    return {"task_id": task_id, "status": "stopped"}