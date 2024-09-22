from transformers import BitsAndBytesConfig

def apply_quantization(model, quantization_type):
    if quantization_type:
        quantization_config = BitsAndBytesConfig(
            load_in_8bit=(quantization_type == "8bit"),
            load_in_4bit=(quantization_type == "4bit"),
            llm_int8_threshold=6.0 if quantization_type == "8bit" else None,
            llm_int8_has_fp16_weight=False,
            bnb_8bit_use_double_quant=False,
            bnb_8bit_quant_type="nf4" if quantization_type == "8bit" else None,
        )
        model = model.quantize(quantization_config)
    return model