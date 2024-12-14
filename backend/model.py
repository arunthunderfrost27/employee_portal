from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
import logger


class EmployeeCreate(BaseModel):
    name: str = Field(..., min_length=3)
    age: int = Field(..., gt=0, lt=100)
    gender: str = Field(..., min_length=1)
    dob: str = Field(..., min_length=1)
    department: str = Field(..., min_length=2)

    def dict(self, **kwargs):
        try:
            base_dict = super().dict(**kwargs)
            return base_dict
        except Exception as e:
            logger.error(f"Error converting to dictionary: {e}")
            raise

class Employee(EmployeeCreate):
    id: str
    created_at: datetime

    @classmethod
    def from_mongo(cls, mongo_obj):
        return cls(
            id=str(mongo_obj["_id"]),
            name=mongo_obj["name"],
            age=mongo_obj["age"],
            dob=mongo_obj["dob"],
            gender=mongo_obj["gender"],
            department=mongo_obj["department"],
            created_at=mongo_obj["created_at"]
        )

    class Config:
        json_encoders = {
            ObjectId: str
        }