import torch


def get_device():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("사용 중인 디바이스:", device)
    return device