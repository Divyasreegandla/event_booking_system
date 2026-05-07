from pydantic import BaseModel
from typing import Dict, Optional


class TranslationResponse(BaseModel):
    translations: Dict[str, str]
    language: str


class LanguageRequest(BaseModel):
    language: str  # en, hi, ta, te, bn


class SupportedLanguagesResponse(BaseModel):
    languages: list