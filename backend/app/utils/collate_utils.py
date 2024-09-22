import torch


def tensorize_batch(features, key: str) -> torch.Tensor:
    tensors = [torch.tensor(f[key], dtype=torch.long) for f in features]
    return torch.nn.utils.rnn.pad_sequence(tensors, batch_first=True, padding_value=0)


def get_data_collator(features):
    input_ids = tensorize_batch(features, "input_ids")
    attention_mask = tensorize_batch(features, "attention_mask")
    labels = tensorize_batch(features, "labels")
    labels[labels == 0] = -100  # Padding을 -100으로 설정

    return {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "labels": labels
    }
