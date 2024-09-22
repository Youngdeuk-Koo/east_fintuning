from app.core.settings.base import Config

class ProdConfig(Config):
    def __init__(self, yaml_file_path="app/core/settings/config/prod.yaml"):
        super().__init__(yaml_file_path)