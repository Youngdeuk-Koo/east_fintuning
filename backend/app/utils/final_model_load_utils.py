from peft import PeftModel


def merge_peft_model(model):
    if isinstance(model, PeftModel):
        try:
            print("PEFT 모델을 병합합니다.")
            merged_model = model.merge_and_unload()
            print("모델 병합 성공")
            return merged_model
        except Exception as e:
            print(f"모델 병합 중 오류 발생: {e}")
            print("병합되지 않은 원본 모델을 반환합니다.")
    return model


def load_best_model(trainer):
    best_model_path = trainer.state.best_model_checkpoint
    
    try:
        if best_model_path:
            print(f"최고 성능 모델 체크포인트를 로드합니다: {best_model_path}")
            if isinstance(trainer.model, PeftModel):
                base_model = trainer.model.get_base_model()
                # 기존 PEFT 설정 제거
                if hasattr(base_model, 'peft_config'):
                    print("기존 PEFT 설정을 제거합니다.")
                    delattr(base_model, 'peft_config')
                model = PeftModel.from_pretrained(base_model, best_model_path)
            else:
                model = type(trainer.model).from_pretrained(best_model_path)
            
            tokenizer = trainer.tokenizer.from_pretrained(best_model_path)
            print(f"최고 성능 모델과 토크나이저가 로드되었습니다: {best_model_path}")
        else:
            print("최고 성능 모델 체크포인트를 찾을 수 없습니다. Trainer의 현재 모델을 사용합니다.")
            model = trainer.model
            tokenizer = trainer.tokenizer

        model = merge_peft_model(model)
        return model, tokenizer

    except Exception as e:
        print(f"모델 로드 중 오류 발생: {e}")
        print("Trainer의 현재 모델을 사용합니다.")
        model = merge_peft_model(trainer.model)
        return model, trainer.tokenizer