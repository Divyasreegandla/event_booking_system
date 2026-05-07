from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.translation_service import TranslationService
from app.schemas.translation import LanguageRequest, SupportedLanguagesResponse

router = APIRouter()


@router.get("/supported-languages")
async def get_supported_languages(
    db: Session = Depends(get_db)
):
    """Get list of supported languages"""
    translation_service = TranslationService(db)
    return {"languages": translation_service.get_supported_languages()}


@router.get("/translations/{language_code}")
async def get_translations(
    language_code: str,
    db: Session = Depends(get_db)
):
    """Get all translations for a language"""
    translation_service = TranslationService(db)
    translations = translation_service.get_translations(language_code)
    return {"language": language_code, "translations": translations}


@router.post("/set-language")
async def set_user_language(
    request: LanguageRequest,
    db: Session = Depends(get_db)
):
    """Set user's preferred language (stored in session/localStorage, not backend)"""
    # This just validates the language - frontend will store preference
    translation_service = TranslationService(db)
    languages = [l["code"] for l in translation_service.get_supported_languages()]
    
    if request.language not in languages:
        return {"valid": False, "message": "Language not supported"}
    
    return {"valid": True, "language": request.language}