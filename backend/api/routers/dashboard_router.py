from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from backend.api.dependencies import (
    obter_dashboard_service,
)
from backend.api.schemas.dashboard_schema import (
    DashboardResposta,
)
from backend.services.dashboard_service import (
    DashboardService,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


DashboardServiceDependencia = Annotated[
    DashboardService,
    Depends(obter_dashboard_service),
]


@router.get(
    "",
    response_model=DashboardResposta,
)
def obter_dashboard(
    service: DashboardServiceDependencia,
    data_referencia: date | None = Query(
        default=None,
        alias="data",
    ),
):
    return service.obter_resumo(data_referencia)