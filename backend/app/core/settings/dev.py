from app.core.settings.base import Config

class DevConfig(Config):
    def __init__(self, yaml_file_path="app/core/settings/config/dev.yaml"):
        super().__init__(yaml_file_path)