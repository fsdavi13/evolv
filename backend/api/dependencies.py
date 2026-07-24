from backend.services.academia_service import AcademiaService
from backend.services.corrida_service import CorridaService
from backend.services.dashboard_service import DashboardService
from backend.services.dieta_service import DietaService


def obter_academia_service() -> AcademiaService:
    return AcademiaService()


def obter_corrida_service() -> CorridaService:
    return CorridaService()


def obter_dieta_service() -> DietaService:
    return DietaService()


def obter_dashboard_service() -> DashboardService:
    return DashboardService()