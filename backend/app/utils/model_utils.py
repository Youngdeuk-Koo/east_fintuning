from app.utils.cuda_utils import get_device
from app.utils.peft_utils import apply_peft
from app.utils.quantization_utils import apply_quantization


def load_model(
    model, 
    quantization_type=None, 
    use_peft=True, 
    r_value=8, 
    lora_alpha=16, 
    lora_dropout=0.1, 
    bias="none"
    ):

    if quantization_type:
        print(f"학습 모델에 {quantization_type} 양자화가 적용 됩니다")
        model = apply_quantization(model, quantization_type)

    if use_peft:
        print(f"학습 모델에 PEFT가 적용 됩니다")
        model = apply_peft(model, r_value, lora_alpha, lora_dropout, bias)

        
    model = model.to(get_device())
    
    return model