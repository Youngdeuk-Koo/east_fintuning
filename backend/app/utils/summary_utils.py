# import json
# import torch
# from datetime import timedelta, datetime

# from transformers import EarlyStoppingCallback
# from sqlalchemy import update

# from app.core.db.postgres import SessionLocal
# from app.core.table.training_summary import TrainingSummary


# session = SessionLocal()

# # 최신 버전을 조회하는 함수
# def get_latest_version(main_project, sub_project, model_name):
#     latest = session.query(TrainingSummary).filter_by(
#         main_project=main_project,
#         sub_project=sub_project,
#         model_name=model_name
#     ).order_by(TrainingSummary.version.desc()).first()
    
#     return latest.version if latest else 1.0


# def get_next_version(main_project, sub_project, model_name):
    
#     try:
#         latest_version = get_latest_version(main_project, sub_project, model_name)
#         new_version = latest_version + 0.1
#         return round(new_version, 1)  # 소수점 첫째 자리까지만 유지
#     except Exception as e:
#         print(f"Error getting next version: {str(e)}")
#         return 1.0  # 오류 발생 시 기본값 반환
#     finally:
#         session.close()


# def generate_summary(
#     task_type,
#     model_name,
#     train_result, 
#     trainer, 
#     train_dataset, 
#     eval_dataset, 
#     start_time, 
#     end_time, 
#     training_args, 
#     main_project, 
#     sub_project, 
#     worker,
#     version,
#     initial_allocated_memory,
#     during_allocated_memory,
#     final_allocated_memory,
#     use_fp16,
#     use_quantization,
#     use_peft,
#     model_path,
#     deepspeed_config=None,
#     error_traceback=None,
# ):
#     total_tokens = sum(len(example['input_ids']) for example in train_dataset) if train_dataset else 0
#     avg_tokens = total_tokens / len(train_dataset) if train_dataset and len(train_dataset) > 0 else 0
    
#     # DeepSpeed 단계 추출
#     deepspeed_stage = None
#     if deepspeed_config:
#         try:
#             with open(deepspeed_config, 'r') as ds_file:
#                 ds_config = json.load(ds_file)
#                 deepspeed_stage = ds_config.get('zero_optimization', {}).get('stage', 'Unknown')
#         except Exception as e:
#             print(f"DeepSpeed config 파일을 읽는 중 오류 발생: {str(e)}")

#     summary = {
#         "Model_Name": model_name if model_name else None,
#         "Task_Type": task_type if task_type else None,
#         "GPU": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "N/A",
#         "Total_Time": str(timedelta(seconds=int(end_time - start_time))) if end_time and start_time else "N/A",
#         "GPU_Memory_Usage_Initial": f"{initial_allocated_memory:.2f} GB" if initial_allocated_memory is not None else "N/A",
#         "GPU_Memory_Usage_During": f"{during_allocated_memory:.2f} GB" if during_allocated_memory is not None else "N/A",
#         "GPU_Memory_Usage_Final": f"{final_allocated_memory:.2f} GB" if final_allocated_memory is not None else "N/A",
#         "Dataset_Size": (len(train_dataset) if train_dataset else 0) + (len(eval_dataset) if eval_dataset else 0),
#         "Train_Dataset_Size": len(train_dataset) if train_dataset else 0,
#         "Eval_Dataset_Size": len(eval_dataset) if eval_dataset else 0,
#         "Avg_Tokens_Per_Sample": f"{avg_tokens:.2f}",
#         "Total_Tokens": total_tokens,
#         "Epochs": training_args.num_train_epochs if training_args else None,
#         "Batch_Size": training_args.per_device_train_batch_size if training_args else None,
#         "Learning_Rate": training_args.learning_rate if training_args else None,
#         "Final_Train_Loss": train_result.training_loss if train_result else None,
#         "Best_Eval_Loss": trainer.state.best_metric if trainer and trainer.state else None,
#         "Total_Steps": train_result.global_step if train_result else None,
#         "FP16_Used": use_fp16,
#         "Quantization_Used": use_quantization if use_quantization else None,
#         "PEFT_LoRA_R_Value": f'r{str(use_peft)}' if use_peft else None,
#         "DeepSpeed_Used": deepspeed_config is not None,
#         "DeepSpeed_Stage": deepspeed_stage,
#         "DeepSpeed_Config": deepspeed_config if deepspeed_config else None,
#         "Gradient_Checkpointing": training_args.gradient_checkpointing if training_args else None,
#         "Gradient_Accumulation_Steps": training_args.gradient_accumulation_steps if training_args else None,
#         "Model_Save_Path": model_path if model_path else None,
#         "Early_Stopping_Used": any(isinstance(cb, EarlyStoppingCallback) for cb in trainer.callback_handler.callbacks) if trainer and trainer.callback_handler else None,
#         "Error_Traceback": error_traceback
#     }
    
#     # 데이터베이스에 저장
#     try:
#         training_summary_id = save_to_database(summary, main_project, sub_project, worker, version)
        
#     except Exception as e:
#         print(f"데이터베이스 저장 중 오류 발생: {str(e)}")
    
#     return training_summary_id, summary



# def save_to_database(summary, main_project, sub_project, worker, version):
#     session = SessionLocal()
#     try:
#         # TrainingSummary 객체 생성 및 저장
#         training_summary = TrainingSummary(
#             main_project=main_project,
#             sub_project=sub_project,
#             version=version,
#             worker=worker,
#             gpu=summary["GPU"],
#             model_name=summary["Model_Name"],
#             task_type=summary["Task_Type"],  # Task Type 저장
#             total_time=summary["Total_Time"],
#             gpu_memory_usage_initial=summary["GPU_Memory_Usage_Initial"],
#             gpu_memory_usage_during=summary["GPU_Memory_Usage_During"],
#             gpu_memory_usage_final=summary["GPU_Memory_Usage_Final"],
#             dataset_size=summary["Dataset_Size"],
#             train_dataset_size=summary["Train_Dataset_Size"],
#             eval_dataset_size=summary["Eval_Dataset_Size"],
#             avg_tokens_per_sample=float(summary["Avg_Tokens_Per_Sample"]),
#             total_tokens=summary["Total_Tokens"],
#             epochs=summary["Epochs"],
#             batch_size=summary["Batch_Size"],
#             learning_rate=summary["Learning_Rate"],
#             final_train_loss=summary["Final_Train_Loss"],
#             best_eval_loss=summary["Best_Eval_Loss"],
#             total_steps=summary["Total_Steps"],
#             fp16_used=summary["FP16_Used"],
#             quantization_used=summary["Quantization_Used"],  # 양자화 사용 여부 및 타입 저장
#             peft_used=summary["PEFT_LoRA_R_Value"] is not None,  # PEFT 사용 여부
#             peft_lora_r_value=float(summary["PEFT_LoRA_R_Value"].lstrip('r')) if summary["PEFT_LoRA_R_Value"] else None,  # LoRA의 r 값
#             deepspeed_used=summary["DeepSpeed_Used"],
#             deepspeed_stage=summary["DeepSpeed_Stage"],
#             gradient_checkpointing=summary["Gradient_Checkpointing"],
#             gradient_accumulation_steps=summary["Gradient_Accumulation_Steps"],
#             model_save_path=summary["Model_Save_Path"],
#             early_stopping_used=summary["Early_Stopping_Used"],
#             error_traceback=summary["Error_Traceback"],
#             created_at=datetime.now(),
#             updated_at=datetime.now()
#         )
        
#         session.add(training_summary)
#         session.commit()
        
#         return training_summary.id  # DB ID 반환

#     except Exception as e:
#         session.rollback()
#         print(f"Error saving training summary to database: {str(e)}")
#         return None
#     finally:
#         session.close()


# def update_cleared_memory(db_id, cleared_allocated_memory):
#     if db_id is None:
#         print("Warning: No valid database ID provided. Skipping cleared memory update.")
#         return
    
#     session = SessionLocal()
#     try:
#         stmt = update(TrainingSummary).where(TrainingSummary.id == db_id).values(
#             gpu_memory_usage_cleared=f"{cleared_allocated_memory:.2f} GB",
#             updated_at=datetime.now()
#         )
        
#         session.execute(stmt)
#         session.commit()
#         print(f"Cleared memory updated for training summary ID: {db_id}")
#     except Exception as e:
#         session.rollback()
#         print(f"Error updating cleared memory: {str(e)}")
#     finally:
#         session.close()


# def print_summary(summary):
#     print("\n===== 학습 요약 =====")
#     for key, value in summary.items():
#         print(f"{key}: {value}")