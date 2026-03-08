from fastapi import APIRouter, HTTPException
from db.supabase_client import get_supabase

router = APIRouter()


@router.get("/scenarios")
def list_scenarios(category: str | None = None):
    """List all built-in scenarios, optionally filtered by category."""
    db = get_supabase()
    query = db.table("scenarios").select("*").eq("is_custom", False)
    if category:
        query = query.eq("category", category)
    result = query.order("title").execute()
    return result.data or []


@router.get("/scenarios/{scenario_id}")
def get_scenario(scenario_id: str):
    """Get a single scenario by ID."""
    db = get_supabase()
    result = db.table("scenarios").select("*").eq("id", scenario_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return result.data
