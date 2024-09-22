from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.router.api import recruit_api_router
from app.core.settings import config
from app.utils.errorhandler import ErrorHandler 

error_handler = ErrorHandler()

def add_exception_handlers(app: FastAPI):
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        detail = exc.detail if isinstance(exc.detail, dict) else {"error": "Error", "message": str(exc.detail)}
        timestamp = datetime.utcnow().isoformat()
        method = request.method
        path = request.url.path
        exc_value = str(exc)

        alert = detail.get("alert", False)
        
        if exc.status_code == 400:
            detail["status"] = exc.status_code
            detail["code"] = exc.status_code
            # await error_handler.handle_error(exc, "400: http_exception_handler", exc_value, request, alert)
            return JSONResponse(
                status_code=exc.status_code,
                content={"timestamp": timestamp, "method": method, "path": path, **detail}
            )

        elif exc.status_code == 401:
            if 'autho' in detail.get("error", "").lower():
                detail["status"] = 401
                detail["code"] = 401
            else:
                detail["status"] = 402
                detail["code"] = 402
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"timestamp": timestamp, "method": method, "path": path, **detail}
            )
        elif exc.status_code == 403:
            detail["status"] = 403
            detail["code"] = 403
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                # content={"timestamp": timestamp, "method": method, "path": path, **detail}
            )
        elif exc.status_code == 404:
            detail["status"] = exc.status_code
            detail["code"] = exc.status_code
            # await error_handler.handle_error(exc, "404: http_exception_handler", exc_value, request, alert)
            return JSONResponse(
                status_code=exc.status_code,
                content={"timestamp": timestamp, "method": method, "path": path, **detail}
            )
        else:
            detail["status"] = exc.status_code
            detail["code"] = exc.status_code
            # await error_handler.handle_error(exc, "500: http_exception_handler", exc_value, request, alert)
            return JSONResponse(
                status_code=exc.status_code,
                content={"timestamp": timestamp, "method": method, "path": path, **detail}
            )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        exc_value = str(exc)
        # await error_handler.handle_error(exc, "422: validation_exception_handler", exc_value, request, True)

        timestamp = datetime.utcnow().isoformat()
        method = request.method
        path = request.url.path
        validation_errors = exc.errors()
        messages = " ".join([f"{'.'.join(map(str, error['loc'][1:]))}: {error['msg']}" for error in validation_errors])

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "timestamp": timestamp,
                "method": method,
                "path": path,
                "status": 422,
                "code": 422,
                "error": "Request Validation Error",
                "message": messages
            }
        )

    from h11 import LocalProtocolError

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        try:
            exc_message = str(exc)

            # LocalProtocolError일 경우 처리하지 않음
            if isinstance(exc, LocalProtocolError):
                pass
            else:
                # await error_handler.handle_error(exc, "500: general_exception_handler", exc_message, request, True)
                error = "An internal server error occurred."
                message = "알수없는 에러가 발생했습니다. 자세한 사항은 errorlog 참고"

            timestamp = datetime.utcnow().isoformat()
            method = request.method
            path = request.url.path

            response_content = {
                "timestamp": timestamp,
                "method": method,
                "path": path,
                "status": 500,
                "code": 500,
                "error": error,
                "message": message
            }

            return JSONResponse(
                status_code=500,
                content=response_content
            )
        except Exception as internal_exc:
            # 내부 오류를 로그로 기록하고 기본 응답을 보냅니다.
            internal_exc_message = str(internal_exc)
            # await error_handler.handle_error(internal_exc, "500: general_HTTP_exception_handler", internal_exc_message, request, False)

            timestamp = datetime.utcnow().isoformat()
            method = request.method
            path = request.url.path

            response_content = {
                "timestamp": timestamp,
                "method": method,
                "path": path,
                "status": 500,
                "code": 500,
                "error": "An internal server error occurred.",
                "message": "알수없는 에러가 발생했습니다. 자세한 사항은 채널톡으로 문의주세요."
            }

            return JSONResponse(
                status_code=500,
                content=response_content
            )

def create_app():
    # V1 애플리케이션 설정
    app_v1 = FastAPI(
        title="Grabber HR AI API V1", 
        version="1.0.0", 
        description="This is the API documentation for V1",
        servers=[
            {"url": "http://localhost:8000/api/v1", "description": "로컬 환경 서버"},
            {"url": "https://dev-ai.grabberhr.com/api/v1", "description": "개발 환경 서버"},
            {"url": "https://api.grabberhr.com/api/v1", "description": "운영 환경 서버"},
        ]
    )
    app_v1.include_router(recruit_api_router)
    
    app = FastAPI()
    app.mount("/api/v1", app_v1)

    @app.get("/healths")
    def health_check():
        return {"status": "ok"}

    allowed_origins = config.get('cors_origins')
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app

app = create_app()

