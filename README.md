Clone the repository using https://github.com/arunthunderfrost27/Employee-portal.git

To run the Application =>

cd backend ->  python main.py =>Starts the FastAPI Application and connects with mongoDB server

cd frontend -> npm start ->select any port =>starts the frontend application

Objective:

To Build a employee portal to upload,update and delete the employee details.

Backend:

FastAPI API Endpoints and their CRUD operations:

Create => (POST /employees): Adds a new employee after validating the input.

Read   => (GET /employees/{employee_id}): Retrieves a specific employee by ID.

Update => (PUT /employees/{employee_id}): Updates an employee's data by ID.

Delete => (DELETE /employees/{employee_id}): Deletes an employee by ID.


MongoDB Schema and Collection :

Database : cluster0
Collection : employee_data
Documents:  
1.name, 2.age ,3.dob ,4.gender ,5.department


Frontend :

employee_form.js => 

Handles formdata with name,gender,age,dob,department state variables
using useState and useEffect as hooks
Handles Data validation of Date Of birth and Age.

employee_list.js =>


Handles loading,selectedemployee,Openingdialogbox,error data state variables 
using useState and useEffect as hooks
Handles HTTP requests for fetching,Updating and deleting employee data using Axios

home.js =>


Handles API Calls to fetch, add, and delete employees using Axios.
Builds dialogbox for adding or editing employees using the EmployeeForm component.
Handling Errors for API request failures.


Well defined unit test cases for the functionalities  =>

TestCase 1 : Adding a Valid data inputs

Input : 

name="Yamuna"
dob="01-10-2000"
age=24
gender="Female"
department="Machinelearning"

Expected output : "Employee added successfully !"

TestCase 2 : Missing Fields

Input :

name="Aarthi"
dob="05-10-2003"
age=21
gender="Female"
department=

Expected output : "All fields are required."

TestCase 3 : Name with numbers

Input :

name:"Akash21"
dob="05-01-2003"
age=21
gender="Male"
department="HR"

Expected Output : "Name must contain only letters and spaces"

TestCase 4 : Editing employees

Input:

name="Akash"
dob="05-10-2003"
age=21
gender="Male"
department="HR"

Expected Output : "Employee updated Successfully!"

TestCase 5 : Invalid Date of birth

name="Kavin"
dob="23-05-2024"
age=0
gender="Male"
department="Med"

Expected Output : "Age must be between 18 and 60"







