import os
import torch
import gc
import traceback
from transformers import Trainer, TrainingArguments, EarlyStoppingCallback
from app.utils.model_utils import load_model
from app.utils.collate_utils import get_data_collator
from app.utils.metrics_utils import get_compute_metrics
from app.utils.wandb_utils import CustomWandbCallback, init_wandb, log_summary, finish_wandb, login_to_wandb
from app.utils.huggingface_utils import login_to_hub, upload_model_to_hub
from app.utils.final_model_load_utils import load_best_model
from app.services.model_init import get_dataset

# 진행 상황을 저장할 전역 변수
progress_status = {}
trainers = {}

class CustomTrainer(Trainer):
    def __init__(self, *args, task_id=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.global_step = 0
        self.task_id = task_id

    def log(self, logs):
        super().log(logs)
        self.global_step += 1
        progress = {
            "step": self.global_step,
            "epoch": self.state.epoch,
            "total_steps": self.state.max_steps,
            "current_epoch": self.state.epoch,
            "total_epochs": self.args.num_train_epochs,
            "logs": logs
        }
        print(progress)
        if self.task_id:
            progress_status[self.task_id] = progress


def train_model(
    model, 
    tokenizer, 
    model_alias, 
    model_size, 
    main_project_name, 
    sub_project_name, 
    worker_name, 
    use_peft, 
    use_deepspeed, 
    quantization_type, 
    use_hf, 
    use_wandb, 
    metrics, 
    advanced_settings, 
    task_id
):
    train_result = None  # 초기화
    try:
        # 환경 초기화
        os.environ['HF_HOME'] = '/data/huggingface'
        os.environ['TRANSFORMERS_CACHE'] = '/data/huggingface/transformers'
        os.environ['HF_DATASETS_CACHE'] = '/data/huggingface/datasets'
        os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
        torch.cuda.empty_cache()

        # 데이터 및 모델 준비
        model = load_model(
            model=model,
            quantization_type=quantization_type,
            use_peft=use_peft,
            r_value=advanced_settings.get("r_value", 8),
            lora_alpha=advanced_settings.get("lora_alpha", 16),
            lora_dropout=advanced_settings.get("lora_dropout", 0.1),
            bias=advanced_settings.get("bias", "none")
        )

        # 데이터셋 준비
        dataset = get_dataset()
        train_dataset = dataset["train"]
        eval_dataset = dataset["test"]

        # 학습 경로 및 학습 인자 설정
        version = 1.0
        train_path = f"/data/train/{main_project_name}/{sub_project_name}_{model_alias}_v{version}"
        
        # WandB 초기화 및 로그인
        if use_wandb:
            wandb_token = advanced_settings.get("wandb_token")
            login_to_wandb(wandb_token)
            init_wandb(main_project_name, f"{sub_project_name}_{model_alias}_v{version}")
        
        load_best_model_at_end = advanced_settings.get("load_best_model_at_end", False)
        use_fp16 = advanced_settings.get("fp16", True)
        
        print(advanced_settings.get("metric_for_best_model", "eval_loss"))
        
        training_args = TrainingArguments(
            output_dir=f"{train_path}/checkpoint",
            num_train_epochs=advanced_settings.get("num_train_epochs", 10),
            per_device_train_batch_size=advanced_settings.get("per_device_train_batch_size", 2),
            per_device_eval_batch_size=advanced_settings.get("per_device_eval_batch_size", 2),
            gradient_accumulation_steps=advanced_settings.get("gradient_accumulation_steps", 16) or 1,
            eval_accumulation_steps=advanced_settings.get("eval_accumulation_steps", 10),
            save_steps=advanced_settings.get("save_steps", 10),
            save_total_limit=advanced_settings.get("save_total_limit", 3),
            eval_steps=advanced_settings.get("eval_steps", 10),
            logging_steps=advanced_settings.get("logging_steps", 1),
            learning_rate=advanced_settings.get("learning_rate", 1e-4),
            warmup_steps=advanced_settings.get("warmup_steps", 100),
            weight_decay=advanced_settings.get("weight_decay", 0.01),
            max_grad_norm=advanced_settings.get("max_grad_norm", 0.5),
            fp16=use_fp16,
            gradient_checkpointing=advanced_settings.get("gradient_checkpointing", True),
            deepspeed=advanced_settings.get("deepspeed_config", None),
            report_to="wandb" if use_wandb else "none",
            load_best_model_at_end=load_best_model_at_end,
            metric_for_best_model=advanced_settings.get("metric_for_best_model", "eval_loss"),
            greater_is_better=advanced_settings.get("greater_is_better", False),
            eval_strategy=advanced_settings.get("eval_strategy", "steps"), 
            logging_strategy=advanced_settings.get("logging_strategy", "steps"),  
            save_strategy=advanced_settings.get("eval_strategy", "steps"),  # 변경된 부분
        )

        compute_metrics = get_compute_metrics(metrics)
        
        callbacks = []
        if load_best_model_at_end:
            print(load_best_model_at_end)
            callbacks.append(EarlyStoppingCallback(early_stopping_patience=2))
            
        if use_wandb:
            callbacks.append(CustomWandbCallback())

        torch.cuda.empty_cache()

        trainer = CustomTrainer(
            model=model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            data_collator=get_data_collator,
            tokenizer=tokenizer,
            compute_metrics=compute_metrics,
            callbacks=callbacks,
            task_id=task_id
        )

        # Trainer 객체 저장
        trainers[task_id] = trainer
        
        train_result = trainer.train()
        
        # 평가
        with torch.no_grad():
            eval_result = trainer.evaluate()
            if trainer.state.global_step % 100 == 0:
                torch.cuda.empty_cache()
                gc.collect()
        
        print(f"학습 완료. 총 스텝: {train_result.global_step}, 최종 학습 손실: {train_result.training_loss:.4f}")
        print(f"평가 결과: {eval_result}")

        # 모델 저장 및 업로드
        if use_hf:
            hf_token = advanced_settings.get("hf_token")
            login_to_hub(hf_token)
            final_model, final_tokenizer = load_best_model(trainer)
            repo_name = f"{advanced_settings.get('hf_username')}/{main_project_name}-{sub_project_name}-{model_alias}-{model_size}-v{version}"
            upload_model_to_hub(final_model, final_tokenizer, repo_name, hf_token, train_path)
    
    except Exception as e:
        print(f"훈련 중 예외 발생: {e}")
        error_traceback = traceback.format_exc()
        print(error_traceback)
        trainer.save_model(f"{train_path}/partial_save_model")
        print("부분적으로 학습된 모델 저장 완료")
        raise e

    finally:
        # 모델과 트레이너 객체 삭제
        del model
        del trainer
        # GPU 메모리 비우기 및 가비지 컬렉션
        torch.cuda.empty_cache()
        gc.collect()
        return trainer, train_result
    
    
def stop_training(task_id):
    print('check')
    if task_id in trainers:
        print(trainers)
        trainer = trainers[task_id]
        trainer.state.is_training = False  # 학습 중지
        del trainers[task_id]
        torch.cuda.empty_cache()