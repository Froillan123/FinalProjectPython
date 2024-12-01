from sqlite3 import connect, Row
from datetime import datetime

# Define the database file location
database: str = 'studentinfo.db'

# Function to handle database operations (Insert, Update, Delete)
def postprocess(sql: str, params=()) -> bool:
    db = connect(database)
    cursor = db.cursor()
    try:
        cursor.execute(sql, params)
        db.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        cursor.close()
        db.close()

# Function to fetch one record
def getprocess(sql: str, params=()) -> list:
    db = connect(database)
    cursor = db.cursor()
    cursor.row_factory = Row
    try:
        cursor.execute(sql, params)
        data = cursor.fetchall()
        return data
    finally:
        cursor.close()
        db.close()

# Function to get all records from a table
def getall_records(table: str) -> list:
    sql = f'SELECT * FROM `{table}`'
    return getprocess(sql)

# Function to fetch student by ID (integer or string)
def get_student_by_id(idno: str) -> dict:
    sql = 'SELECT * FROM students WHERE idno = ?'
    student = getprocess(sql, (idno,))
    return student[0] if student else None

# Function to get user by credentials (username and password)
def get_user_by_credentials(username: str, password: str) -> dict:
    sql = 'SELECT * FROM users WHERE username = ? AND password = ?'
    user = getprocess(sql, (username, password))
    return user[0] if user else None

# Function to add a new record to a table
def add_record(table: str, **kwargs) -> bool:
    keys = list(kwargs.keys())
    values = list(kwargs.values())
    fields = "`, `".join(keys)
    placeholders = ", ".join("?" * len(values))
    sql = f"INSERT INTO `{table}` (`{fields}`) VALUES ({placeholders})"
    return postprocess(sql, values)

# Function to update an existing record in a table
def update_record(table: str, **kwargs) -> bool:
    keys = list(kwargs.keys())
    values = list(kwargs.values())
    set_clause = ", ".join([f"`{key}` = ?" for key in keys[1:]])  # Exclude the first key (idno)
    sql = f"UPDATE `{table}` SET {set_clause} WHERE `{keys[0]}` = ?"
    result = postprocess(sql, values[1:] + [values[0]])  # Pass values excluding the idno in the set clause

    if result and table == "students":  # Update the attendance table too
        update_attendance(kwargs)
    
    return result

# Function to delete a record from a table
def delete_record(table: str, **kwargs) -> bool:
    keys = list(kwargs.keys())
    values = list(kwargs.values())
    sql = f"DELETE FROM `{table}` WHERE `{keys[0]}` = ?"
    return postprocess(sql, (values[0],))

def insert_attendance(student):
    try:
        query = """
            INSERT INTO attendance (idno, firstname, lastname, course, level, time_attended)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        return postprocess(query, (student['idno'], student['firstname'], student['lastname'], student['course'], student['level'], current_time))
    except Exception as e:
        print(f"Error inserting attendance: {e}")
        return False

def update_attendance(student_info):
    query = """
        UPDATE attendance
        SET firstname = ?, lastname = ?, course = ?, level = ?
        WHERE idno = ?
    """
    return postprocess(query, (student_info['firstname'], student_info['lastname'], student_info['course'], student_info['level'], student_info['idno']))


def create_update_trigger():
    trigger_sql = """
    CREATE TRIGGER IF NOT EXISTS update_attendance_on_student_update
    AFTER UPDATE ON students
    FOR EACH ROW
    BEGIN
        UPDATE attendance
        SET
            firstname = NEW.firstname,
            lastname = NEW.lastname,
            course = NEW.course,
            level = NEW.level
        WHERE idno = NEW.idno;
    END;
    """
    db = connect(database)
    cursor = db.cursor()
    try:
        cursor.execute(trigger_sql)
        db.commit()
    except Exception as e:
        print(f"Error creating trigger: {e}")
    finally:
        cursor.close()
        db.close()

def get_user(idno: str) -> object:
    return get_student_by_id(idno)

