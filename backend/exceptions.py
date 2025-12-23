from fastapi import status

class SAMException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code

class UnauthorizedException(SAMException):
    def __init__(self):
        super().__init__("로그인이 필요합니다.", status.HTTP_401_UNAUTHORIZED)

class BojApiError(SAMException):
    def __init__(self):
        super().__init__("백준 정보를 가져오지 못했습니다.", status.HTTP_502_BAD_GATEWAY)

class InvalidUniversityEmailError(SAMException):
    def __init__(self):
        super().__init__("세종대학교 계정(.ac.kr)만 이용 가능합니다.", status.HTTP_403_FORBIDDEN)