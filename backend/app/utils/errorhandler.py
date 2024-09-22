import httpx
import json
import os
import traceback
from starlette import status
from fastapi import HTTPException, Request

from app.utils.logging import logger
from app.core.settings import config

# from app.models.orm.error_log  import ErrorLog
# from app.core.db.postgre import User_SessionLocal

from datetime import datetime

ENVIRONMENT = os.getenv("PYTHON_PROFILES_ACTIVE", "dev")

slack_token = os.getenv('SLACK_TOKEN')
slack_channel = os.getenv('SLACK_CHANNEL')
slack_project = os.getenv('SLACK_PROJECT')

class SlackNotifier:
    def __init__(self, token: str, channel: str, project: str):
        self.token = token
        self.channel = channel
        self.project = project
        self.base_url = "https://slack.com/api"
        self.post_send_url = "/chat.postMessage"

    async def send_message(self, message: str):
        url = self.base_url + self.post_send_url
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }

        body = {
            "channel": self.channel,
            "text": message
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, data=json.dumps(body))
            response.raise_for_status()  # Raise an error for bad responses
            return response.json()

class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


class ErrorHandler(metaclass=SingletonMeta):
    def __init__(self):
        self.slack_notifier = SlackNotifier(slack_token, slack_channel, slack_project)

    async def log_error(self, error_type: str, message: str, trace: str, detail_message: str = None):
        log_msg = f"{error_type}: {message}\n{trace}"
        if detail_message:
            log_msg += f"\nDetail: {detail_message}"
        logger.error(log_msg)

    # async def save_to_db(self, error_type: str, message: str, trace: str, api_source: str, function_name: str, detail_message: str = None):
    #     db = User_SessionLocal()
    #     try:
    #         db_error = ErrorLog(
    #             api_source=api_source,
    #             function_name=function_name, 
    #             error_type=error_type, 
    #             error_message=message,
    #             error_top_message=detail_message,
    #             error_trace=f"{message}\n{trace}",
    #         )
    #         db.add(db_error)
    #         db.commit()
    #     except Exception as e:
    #         logger.error(f"Failed to save to DB: {e}")
    #     finally:
    #         db.close()

    async def send_slack_notification(self, error_type: str, message: str, detail_message: str, request: Request = None, error_url: str = None):
        timestamp = datetime.utcnow().isoformat()
        path = request.url.path if request else "N/A"
        method = request.method if request else "N/A"
        request_id = request.headers.get("X-Request-ID", "N/A") if request else "N/A"

        slack_message = (
            "==========================================\n"
            f"[grabberhr-ai-{ENVIRONMENT}]\n"
            f"timestamp : {timestamp}\n"
            f"path : {method} {path}\n"
            f"requestId : {request_id}\n"
            f"url : {error_url}\n"
            f"message : {message}\n"
            f"detail_message : {detail_message}\n"
            "=========================================="
        )

        await self.slack_notifier.send_message(slack_message)

    def classify_error(self, error):
        return type(error).__name__

    async def handle_error(self, error, api_source: str, detail_message: str = None, request: Request = None, alert: bool = False, error_url: str = None):
        error_type = self.classify_error(error)
        message = str(error)
        trace = traceback.format_exc()

        # Extract function name from traceback
        tb = traceback.extract_tb(error.__traceback__)
        function_name = tb[-1].name if tb else "Unknown"

        # Log, save to DB, and notify Slack asynchronously
        await self.log_error(error_type, message, trace, detail_message)
        # await self.save_to_db(error_type, message, trace, api_source, function_name, detail_message)
        
        if alert:
            await self.send_slack_notification(error_type, message, detail_message, request, error_url)



def get_error_handler():
    return ErrorHandler()