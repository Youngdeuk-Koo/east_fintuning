import yaml

class Config:
    _instance = None

    def __init__(self, common_config_path, env_config_path):
        if Config._instance is not None:
            raise Exception("This class is a singleton!")
        else:
            self.config = self.load_yaml_config(common_config_path)
            env_config = self.load_yaml_config(env_config_path)
            self.config.update(env_config)

    @staticmethod
    def load_yaml_config(path):
        with open(path, 'r') as file:
            return yaml.safe_load(file)

    @staticmethod
    def get_instance():
        if Config._instance is None:
            raise Exception("Config class has not been initialized yet")
        return Config._instance

    def get(self, key):
        return self.config.get(key, None)

    @classmethod
    def initialize(cls, common_config_path, env_config_path):
        if cls._instance is None:
            cls._instance = cls(common_config_path, env_config_path)
        return cls._instance