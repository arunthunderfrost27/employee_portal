from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from bson import ObjectId
import uvicorn
import logging
from datetime import datetime
import re
from database import get_database
from model import Employee, EmployeeCreate
from pydantic import ValidationError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600, 
)

def validate_employee_data(employee_data):
    if 'name' not in employee_data or not employee_data['name']:
        raise HTTPException(status_code=400, detail="Name is required")
    
    name = employee_data['name'].strip()
    if len(name) < 3:
        raise HTTPException(status_code=400, detail="Name must be at least 3 characters long")
    if not re.match(r'^[A-Za-z\s]+$', name):
        raise HTTPException(status_code=400, detail="Name must contain only letters and spaces")

    if 'age' not in employee_data:
        raise HTTPException(status_code=400, detail="Age is required")
    
    try:
        age = int(employee_data['age'])
        if age <= 10 or age >=60:
            raise HTTPException(status_code=400, detail="Age must be between 18 and 60")
    except ValueError:
        raise HTTPException(status_code=400, detail="Age must be a valid integer")

    if 'dob' not in employee_data or not employee_data['dob']:
        raise HTTPException(status_code=400, detail="Date of Birth is required")
    
    try:
        dob = datetime.strptime(employee_data['dob'], '%d-%m-%Y')
        today = datetime.now()
        calculated_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        
        if calculated_age != age:
            raise HTTPException(status_code=400, detail=f"Age doesn't match date of birth. Calculated age is {calculated_age}")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use DD-MM-YY")

    if 'gender' not in employee_data or not employee_data['gender']:
        raise HTTPException(status_code=400, detail="Gender is required")
    
    gender = employee_data['gender'].lower()
    if gender not in ['male', 'female', 'other']:
        raise HTTPException(status_code=400, detail="Gender must be 'male', 'female', or 'other'")

    if 'department' not in employee_data or not employee_data['department']:
        raise HTTPException(status_code=400, detail="Department is required")
    
    department = employee_data['department'].strip()
    if len(department) < 2:
        raise HTTPException(status_code=400, detail="Department must be at least 2 characters long")

    return {
        'name': name,
        'age': age,
        'dob': employee_data['dob'],
        'gender': gender,
        'department': department
    }

@app.post("/employees", response_model=Employee, status_code=201)
async def create_employee_endpoint(request: Request):
    try:
        body = await request.json()
        logger.info(f"Raw received data: {body}")

        if not body:
            logger.error("No data received in request body")
            raise HTTPException(status_code=400, detail="No employee data provided")

        try:
            employee = EmployeeCreate(**body)
        except ValidationError as e:
            logger.error(f"Validation error: {e}")
            raise HTTPException(status_code=422, detail=e.errors())
        
        collection = await get_database()
        
        validated_data = validate_employee_data(employee.dict())
        
        validated_data['created_at'] = datetime.utcnow()
        
        logger.info(f"Validated and cleaned data: {validated_data}")
        
        result = await collection.insert_one(validated_data)
        logger.info(f"Insertion result: {result.inserted_id}")
        
        created_employee = await collection.find_one({"_id": result.inserted_id})
        
        if not created_employee:
            raise HTTPException(status_code=500, detail="Failed to create employee")
        
        return Employee.from_mongo(created_employee)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Comprehensive error in employee creation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create employee: {str(e)}")

@app.get("/employees", response_model=List[Employee])
async def list_employees(skip: int = 0, limit: int = 100):
    try:
        collection = await get_database()
        employees = await collection.find().skip(skip).limit(limit).to_list(length=limit)
        return [Employee.from_mongo(employee) for employee in employees]
    except Exception as e:
        logger.error(f"Error listing employees: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve employees")

@app.get("/employees/{employee_id}", response_model=Employee)
async def get_employee(employee_id: str):
    try:
        collection = await get_database()
        employee = await collection.find_one({"_id": ObjectId(employee_id)})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return Employee.from_mongo(employee)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid employee ID")
    except Exception as e:
        logger.error(f"Error retrieving employee: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve employee")
    
@app.put("/employees/{employee_id}", response_model=Employee)
async def update_employee(employee_id: str, employee: EmployeeCreate):
    try:
        collection = await get_database()
        
        validated_data = validate_employee_data(employee.dict())

        object_id = ObjectId(employee_id)

        result = await collection.find_one_and_update(
            {"_id": object_id},
            {"$set": validated_data},
            return_document=True
        )

        if not result:
            raise HTTPException(status_code=404, detail="Employee not found")

        return Employee.from_mongo(result)

    except Exception as e:
        logger.error(f"Error updating employee: {e}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Failed to update employee: {str(e)}")

@app.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str):
    try:
        collection = await get_database()
        object_id = ObjectId(employee_id)

        result = await collection.delete_one({"_id": object_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")

        return {"message": "Employee successfully deleted"}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid employee ID")
    except Exception as e:
        logger.error(f"Error deleting employee: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete employee")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
