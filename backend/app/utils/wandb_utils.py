import wandb
from transformers import TrainerCallback

class CustomWandbCallback(TrainerCallback):
    def __init__(self):
        self.current_step = 0

    def on_log(self, args, state, control, logs=None, **kwargs):
        if state.is_world_process_zero and logs is not None:
            self.current_step += 1
            for k, v in logs.items():
                if isinstance(v, (int, float)):
                    wandb.log({k: v}, step=self.current_step)

def init_wandb(project_name, run_name):
    wandb.init(project=project_name, name=run_name)

def log_summary(summary):
    wandb.log(summary)

def finish_wandb():
    wandb.finish()
    
def login_to_wandb(token):
    wandb.login(key=token)