from peft import prepare_model_for_kbit_training, LoraConfig, get_peft_model

def apply_peft(model, r_value=8, lora_alpha=16, lora_dropout=0.1, bias="none"):
    # 입력 텐서에 requires_grad를 활성화
    model.enable_input_require_grads()
    
    # K-bit 훈련을 위해 모델 준비
    model = prepare_model_for_kbit_training(model)
    
    # task_type에 따른 target_modules 설정
    # if task_type == "CAUSAL_LM":
    #     target_modules = ["q_proj", "v_proj", "k_proj", "o_proj"]
    # elif task_type == "SEQ2SEQ_LM":
    #     target_modules = [
    #         "q_proj", "v_proj", "k_proj", "o_proj", 
    #         "encoder_attn.q_proj", "encoder_attn.k_proj"
    #     ]
    # elif task_type == "REGRESSION":
    #     target_modules = ["classifier.dense", "classifier.out_proj"]
    # elif task_type == "TOKEN_CLASSIFICATION":
    #     target_modules = ["classifier.dense", "classifier.out_proj"]
    # elif task_type == "QUESTION_ANSWERING":
    #     target_modules = ["qa_outputs.dense", "qa_outputs.out_proj"]
    # elif task_type == "TEXT_CLASSIFICATION":
    #     target_modules = ["classifier.dense", "classifier.out_proj"]
    # elif task_type == "NER":
    #     target_modules = ["classifier.dense", "classifier.out_proj"]
    # elif task_type == "MULTIPLE_CHOICE":
    #     target_modules = ["classifier.dense", "classifier.out_proj"]
    # else:
    #     # 기본값 또는 task_type에 따른 기본 target_modules
    #     target_modules = ["q_proj", "v_proj", "k_proj", "o_proj"]

    target_modules = ["q_proj", "v_proj", "k_proj", "o_proj"]
    task_type = "CAUSAL_LM"
    # LoRA 구성 설정
    peft_config = LoraConfig(
        r=r_value,  
        lora_alpha=lora_alpha, 
        target_modules=target_modules,
        lora_dropout=lora_dropout, 
        bias=bias, 
        task_type=task_type
    )

    # PEFT 모델 적용
    model = get_peft_model(model, peft_config)
    
    return model