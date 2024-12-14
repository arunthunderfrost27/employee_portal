import logging
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

MONGO_DETAILS = "mongodb+srv://arunbalsen27:employeedb2003@cluster0.zrzcj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

async def get_database():
    try:
        client = AsyncIOMotorClient(MONGO_DETAILS)
        database = client.cluster0  
        collection = database.employee_data 
        
        employee = await collection.find_one({})
        if employee:
            logger.info(f"Connected to database, found employee: {employee}")
        else:
            logger.info("Connected to database, but no employees found.")

        return collection
        
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise
