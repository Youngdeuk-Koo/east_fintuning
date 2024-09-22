import time
import torch
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, AutoConfig, TextIteratorStreamer
from typing import Dict
import asyncio
from threading import Thread

from app.services.model_init import get_model, set_model, get_tokenizer, set_tokenizer, download_status, get_current_model_name, set_current_model_name

router = APIRouter()

class ModelDownloadRequest(BaseModel):
    model_name: str
    api_token: str = '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'  # 기본 API 토큰

class ModelDownloadResponse(BaseModel):
    message: str

class ModelInfoResponse(BaseModel):
    model_info: dict
    tokenizer_info: dict

class ChatRequest(BaseModel):
    input_text: str
    system_message: str = ""  # Add this field
    max_new_tokens: int = None
    use_gpu: bool = False
    use_fp16: bool = False
    use_autocast: bool = False
    use_gradient_checkpointing: bool = False
    temperature: float = 1.0
    top_p: float = 1.0
    top_k: int = 50
    repetition_penalty: float = 1.0
    seed: int = None

class ChatResponse(BaseModel):
    response_text: str

class ModelNameRequest(BaseModel):
    model_name: str

class GPUMemoryInfoResponse(BaseModel):
    elapsed_time: float
    memory_allocated: float
    max_memory_allocated: float
    memory_reserved: float
    memory_cached: float

def download_model(model_name: str, api_token: str):
    try:
        download_status[model_name] = "downloading"
        print(f"Downloading model: {model_name}")  # 로그 추가
        # 모델과 토크나이저를 다운로드
        model = AutoModelForCausalLM.from_pretrained(model_name, use_auth_token=api_token)
        tokenizer = AutoTokenizer.from_pretrained(model_name, use_auth_token=api_token)
        
        download_status[model_name] = "registering"
        
        # 모델에 tokenizer의 vocab 크기 확장 반영
        model.resize_token_embeddings(len(tokenizer))
        
        set_model(model_name, model)
        set_tokenizer(model_name, tokenizer)
        set_current_model_name(model_name)
        print(f"Model {get_current_model_name()} download completed")  # 로그 추가
        time.sleep(3)

        download_status[model_name] = "ready_to_chat"
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # 모델이 채팅 준비가 되도록 아무 글자나 보내기
        dummy_input = "안녕"
        inputs = tokenizer.encode(dummy_input, return_tensors="pt").to(device)
        output = model.to(device).generate(inputs)
        print(output)

        print(f"Model {model_name} is ready for chat")  # 로그 추가

        download_status[model_name] = "completed"
    except Exception as e:
        download_status[model_name] = "failed"
        print(f"Model {model_name} download failed: {str(e)}")  # 로그 추가
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found: {str(e)}")


@router.post("/download", response_model=ModelDownloadResponse)
async def download_model_endpoint(request: ModelDownloadRequest, background_tasks: BackgroundTasks):
    model_name = request.model_name
    api_token = request.api_token
    background_tasks.add_task(download_model, model_name, api_token)
    return {"message": "Model download started"}

@router.post("/download_status", response_model=ModelDownloadResponse)
async def get_download_status(request: ModelNameRequest):
    model_name = request.model_name
    status = download_status.get(model_name, "not_started")
    print(f"Checking download status for model: {model_name}, status: {status}")  # 로그 추가
    return {"message": status}

@router.post("/model_info", response_model=ModelInfoResponse)
async def get_model_info():
    model_name = get_current_model_name()
    if not model_name:
        raise HTTPException(status_code=404, detail="No model is currently loaded")
    try:
        config = AutoConfig.from_pretrained(model_name)
        tokenizer = get_tokenizer(model_name)
        model_info = config.to_dict()
        tokenizer_info = tokenizer.special_tokens_map
        
        return {
            "model_info": model_info,
            "tokenizer_info": tokenizer_info
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
async def chat_with_model(request: ChatRequest):
    model_name = get_current_model_name()
    if not model_name:
        raise HTTPException(status_code=404, detail="No model is currently loaded")
    
    input_text = request.input_text
    system_message = request.system_message
    max_new_tokens = request.max_new_tokens
    use_gpu = request.use_gpu
    use_fp16 = request.use_fp16
    use_autocast = request.use_autocast
    use_gradient_checkpointing = request.use_gradient_checkpointing
    temperature = request.temperature
    top_p = request.top_p
    top_k = request.top_k
    repetition_penalty = request.repetition_penalty if request.repetition_penalty > 0 else 1.0
    seed = request.seed

    do_sample = any([request.temperature != 1.0, request.top_p != 1.0, request.top_k != 50])
    
    if not get_model(model_name) or not get_tokenizer(model_name):
        raise HTTPException(status_code=404, detail="Model not loaded")

    model = get_model(model_name)
    tokenizer = get_tokenizer(model_name)

    # 모델을 GPU로 이동
    device = 'cuda' if use_gpu and torch.cuda.is_available() else 'cpu'
    model = model.to(device)

    # 모델을 FP16으로 캐스팅
    if use_fp16 and device == 'cuda':
        model.half()
    
    # gradient checkpointing 활성화
    if use_gradient_checkpointing:
        model.config.use_cache = False
        model.gradient_checkpointing_enable()

    # 프롬프트 구성
    bos_token = tokenizer.bos_token
    eos_token = tokenizer.eos_token
    prompt_assustant = "assistant"
    
    print(system_message)
    
    if system_message:
        prompt = f"{bos_token}system{system_message}user{input_text}{prompt_assustant}"
    else:
        prompt = f"{bos_token}user{input_text}{prompt_assustant}"
    
    print(prompt)
    
    # 입력 데이터를 GPU로 이동
    inputs = tokenizer.encode(prompt, return_tensors="pt").to(device)
    
    # 시드 설정
    if seed is not None:
        torch.manual_seed(seed)
        if device == 'cuda':
            torch.cuda.manual_seed_all(seed)

    generate_kwargs = {
        "do_sample": do_sample,
        "input_ids": inputs,
        "temperature": temperature,
        "top_p": top_p,
        "top_k": top_k,
        "repetition_penalty": repetition_penalty,
        "return_dict_in_generate": True,
        "output_scores": True,
        "max_length": inputs.shape[1] + max_new_tokens if max_new_tokens is not None else None
    }

    # 스트리밍 응답
    async def stream_response():
        streamer = TextIteratorStreamer(tokenizer, skip_special_tokens=True)
        generate_kwargs["streamer"] = streamer

        def generate():
            with torch.inference_mode():
                if use_autocast and device == 'cuda':
                    with torch.amp.autocast(device_type=device):
                        model.generate(**generate_kwargs)
                else:
                    model.generate(**generate_kwargs)

        # 모델 추론을 백그라운드에서 실행
        generation_thread = Thread(target=generate)
        generation_thread.start()

        
        prompt_detected = False

        for new_text in streamer:
            if not prompt_detected:
                if prompt_assustant in new_text:
                    prompt_detected = True
                    new_text = new_text.split(prompt_assustant, 1)[1]  # 'assistant' 이후의 텍스트만 남김
                else:
                    continue  # 'assistant'가 나올 때까지 건너뜀

            yield new_text
            await asyncio.sleep(0.005)  # 클라이언트가 처리할 시간을 주기 위해 잠시 대기

        generation_thread.join()  # 모델 추론이 완료될 때까지 대기

    response = StreamingResponse(stream_response(), media_type="text/plain")

    original_dtype = next(model.parameters()).dtype
    model.to(original_dtype)
    torch.cuda.empty_cache()  # GPU 메모리 해제

    return response


@router.post("/unload_model")
async def unload_model():
    model_name = get_current_model_name()
    if not model_name:
        raise HTTPException(status_code=404, detail="No model is currently loaded")
    
    model = get_model(model_name)
    tokenizer = get_tokenizer(model_name)
    
    if model:
        del model
        set_model(model_name, None)
    if tokenizer:
        del tokenizer
        set_tokenizer(model_name, None)
        
    torch.cuda.empty_cache()  # GPU 메모리 초기화
    set_current_model_name(None)
    return {"message": f"Model {model_name} unloaded successfully"}


@router.get("/gpu_memory_info", response_model=GPUMemoryInfoResponse)
async def get_gpu_memory_info():
    if not torch.cuda.is_available():
        raise HTTPException(status_code=404, detail="CUDA is not available")

    elapsed_time = 0.0  # 경과 시간은 필요에 따라 계산
    memory_allocated = torch.cuda.memory_allocated() / 1e9
    max_memory_allocated = torch.cuda.max_memory_allocated() / 1e9
    memory_reserved = torch.cuda.memory_reserved() / 1e9
    memory_cached = torch.cuda.memory_reserved() / 1e9

    return GPUMemoryInfoResponse(
        elapsed_time=elapsed_time,
        memory_allocated=memory_allocated,
        max_memory_allocated=max_memory_allocated,
        memory_reserved=memory_reserved,
        memory_cached=memory_cached
    )