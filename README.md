# FinalProjectPython



def get_users() -> object:
    return getall_records('students')

def get_user(idno: str) -> object:
    return getone_record('students', idno=idno)