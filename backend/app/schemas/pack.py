"""
Pydantic schemas for pack system in EVG Ultimate Team.

Defines request/response schemas for pack-related API endpoints.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


_TIER_PATTERN = "^(bronze|silver|gold|ultimate)$"
_RARITY_PATTERN = "^(common|rare|epic|legendary)$"


# =============================================================================
# Pack Inventory Schemas
# =============================================================================

class PackInventoryResponse(BaseModel):
    """Response schema for pack inventory."""

    bronze: int = Field(ge=0, description="Number of bronze packs")
    silver: int = Field(ge=0, description="Number of silver packs")
    gold: int = Field(ge=0, description="Number of gold packs")
    ultimate: int = Field(ge=0, description="Number of ultimate packs")

    model_config = {
        "json_schema_extra": {
            "example": {
                "bronze": 3,
                "silver": 1,
                "gold": 0,
                "ultimate": 0
            }
        }
    }


# =============================================================================
# Pack Reward Schemas
# =============================================================================

class PackRewardResponse(BaseModel):
    """Response schema for a pack reward."""

    id: int
    name: str
    description: str
    type: str
    rarity: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "name": "Shot offert",
                "description": "Profite d'un shot gratuit!",
                "type": "shot",
                "rarity": "common"
            }
        }
    }


# =============================================================================
# Pack Reward Admin (CRUD) Schemas
# =============================================================================

class PackRewardAdminResponse(BaseModel):
    """Full reward representation for the admin catalogue (includes tier/state)."""

    id: int
    tier: str
    name: str
    description: str
    type: str
    rarity: str
    is_active: bool

    model_config = {"from_attributes": True}


class PackRewardCreate(BaseModel):
    """Request schema to create a pack reward."""

    tier: str = Field(..., pattern=_TIER_PATTERN, description="Pack tier")
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=500)
    type: str = Field(..., min_length=1, max_length=50, description="shot/immunity/power/wildcard")
    rarity: str = Field(..., pattern=_RARITY_PATTERN, description="common/rare/epic/legendary")
    is_active: bool = True


class PackRewardUpdate(BaseModel):
    """Request schema to update a pack reward (all fields optional)."""

    tier: Optional[str] = Field(None, pattern=_TIER_PATTERN)
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    rarity: Optional[str] = Field(None, pattern=_RARITY_PATTERN)
    is_active: Optional[bool] = None


# =============================================================================
# Pack Opening Schemas
# =============================================================================

class PackOpenRequest(BaseModel):
    """Request schema for opening a pack."""

    tier: str = Field(..., pattern="^(bronze|silver|gold|ultimate)$", description="Pack tier to open")

    model_config = {
        "json_schema_extra": {
            "example": {
                "tier": "bronze"
            }
        }
    }


class PackOpenResponse(BaseModel):
    """Response schema for pack opening result."""

    success: bool
    reward: PackRewardResponse
    new_inventory: PackInventoryResponse
    animation_data: dict
    applied_effect: Optional[str] = Field(None, description="Description of applied in-app effect, if any")

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "reward": {
                    "id": 1,
                    "name": "Shot offert",
                    "description": "Profite d'un shot gratuit!",
                    "type": "shot",
                    "rarity": "common"
                },
                "new_inventory": {
                    "bronze": 2,
                    "silver": 1,
                    "gold": 0,
                    "ultimate": 0
                },
                "animation_data": {
                    "duration": 7,
                    "rarity": "common",
                    "effects": ["pulse", "particles"]
                }
            }
        }
    }


# =============================================================================
# Pack History Schemas
# =============================================================================

class PackHistoryItem(BaseModel):
    """Response schema for a pack opening history item."""

    id: int
    pack_tier: str
    reward_name: str
    reward_description: Optional[str] = None
    opened_at: datetime
    points_spent: int

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "pack_tier": "bronze",
                "reward_name": "Shot offert",
                "reward_description": "Profite d'un shot gratuit!",
                "opened_at": "2026-06-05T10:30:00Z",
                "points_spent": 0
            }
        }
    }


# =============================================================================
# Pack Costs Schema
# =============================================================================

class PackCostsResponse(BaseModel):
    """Response schema for pack costs."""

    bronze: int
    silver: int
    gold: int
    ultimate: int

    model_config = {
        "json_schema_extra": {
            "example": {
                "bronze": 100,
                "silver": 200,
                "gold": 300,
                "ultimate": 500
            }
        }
    }
