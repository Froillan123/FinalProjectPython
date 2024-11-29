#dbhelper.py
from sqlite3 import connect, Row
import sqlite3
import base64

database = 'studentinfo.db'

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
def get_student_by_id(idno: int) -> dict:
    sql = 'SELECT * FROM students WHERE idno = ?'
    student = getprocess(sql, (idno,))
    return student[0] if student else None

def get_user(idno):
    sample_data = {
        "idno": idno,
        "lastname": "Doe",
        "firstname": "John",
        "course": "BSIT",
        "level": "3"
    }
    return sample_data

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

def getall_records(table: str) -> list:
    sql = f'SELECT * FROM `{table}`'
    return getprocess(sql)

def get_user_by_credentials(username: str, password: str) -> dict:
    sql = 'SELECT * FROM users WHERE username = ? AND password = ?'
    user = getprocess(sql, (username, password))
    return user[0] if user else None

def getone_record(table: str, **kwargs) -> bool:
    keys = list(kwargs.keys())
    values = list(kwargs.values())
    sql = f"SELECT * FROM `{table}` WHERE `{keys[0]}` = ?"
    return getprocess(sql, (values[0],))

def add_record(table: str, **kwargs) -> bool:
    keys = list(kwargs.keys())
    values = list(kwargs.values())
    fields = "`, `".join(keys)
    placeholders = ", ".join("?" * len(values))
    sql = f"INSERT INTO `{table}` (`{fields}`) VALUES ({placeholders})"
    return postprocess(sql, values)

def update_record(table: str, **kwargs) -> bool:
    # Extract the keys and values from kwargs
    keys = list(kwargs.keys())
    values = list(kwargs.values())
    fields = ", ".join([f"`{key}` = ?" for key in keys[1:]])  
    sql = f"UPDATE `{table}` SET {fields} WHERE `{keys[0]}` = ?"
    return postprocess(sql, values[1:] + [values[0]])  


def delete_record(table: str, **kwargs) -> bool:
    keys = list(kwargs.keys())
    values = list(kwargs.values())
    sql = f"DELETE FROM `{table}` WHERE `{keys[0]}` = ?"
    return postprocess(sql, (values[0],))
