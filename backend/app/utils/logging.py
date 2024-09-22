import logging

# 로거 설정
logger = logging.getLogger("GrabberHRLogger")
logger.setLevel(logging.INFO)

# 포맷 설정
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

logger