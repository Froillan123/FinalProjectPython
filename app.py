from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from dbhelper import *
import base64
import qrcode
import os
import redis
from flask_caching import Cache
from datetime import datetime



app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_FILE_DIR'] = os.path.join(app.instance_path, 'sessions')
app.config['SECRET_KEY'] = 'Kimperor123'
app.config['SESSION_REDIS'] = redis.StrictRedis(host='localhost', port=6379, db=0)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
cache = Cache(app, config={'CACHE_TYPE': 'redis', 'CACHE_REDIS_URL': 'redis://localhost:6379/0'})
REGISTER_DIR = 'static/images/Register'
QRCODE_DIR = 'static/images/qrcode'

@app.after_request
def after_request(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    
    if hasattr(session, 'username') and 'username' not in session:
        response.headers['Cache-Control'] = 'no-store'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
    return response

@app.route('/')
def index():
    pagetitle = "Attendance Checker"
    return render_template('index.html', pagetitle=pagetitle)

@app.route('/login', methods=['POST', 'GET'])
def login():
    pagetitle = "Login"
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if not username or not password:
            flash("Username and Password are required", 'error')
            return redirect(url_for('login'))

        user = get_user_by_credentials(username, password)

        if user:
            session['username'] = username
            flash("User Login successfully!", 'success')
            return redirect(url_for('student_list'))
        else:
            flash("Invalid username or password", 'error')
            return redirect(url_for('login'))

    return render_template('login.html', pagetitle=pagetitle)


@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('You have been logged out.', 'info')
    response = redirect(url_for('login'))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

@app.route('/students')
def student_list():
    if 'username' in session:
        pagetitle = "Student List"
        users = get_users() 
        students = getall_records('students')  
        return render_template('studentlist.html', data=students, pagetitle=pagetitle, users=users)
    else:
        flash("Please log in first!", "warning")
        return redirect(url_for('login'))



@app.route('/viewstudent')
def viewstudent():
    if 'username' in session:
        pagetitle = "Attendance"
        attendance_records = getall_records('attendance')  # Get all attendance records
        return render_template('viewattendance.html', data=attendance_records, pagetitle=pagetitle)
    else:
        flash("Please log in first!", "warning")
        return redirect(url_for('login'))


@app.route('/generate_qr', methods=['POST'])
def generate_qr():
    try:
        data = request.get_json()
        idno = data.get('idno')
        qr_data = idno
        qr_path = os.path.join(QRCODE_DIR, f"{idno}.png")
        if not os.path.exists(qr_path):
            qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
            qr.add_data(qr_data)
            qr.make(fit=True)
            img = qr.make_image(fill='black', back_color='white')
            img.save(qr_path)
        
        return jsonify({"qr_path": qr_path, "qr_data": qr_data})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get_student/<idno>', methods=['GET'])
def get_student(idno):
    try:
        student = get_user(idno)
        if isinstance(student, list):
            student = student[0] if student else None
        if not student:
            return jsonify({"error": "Student not found"}), 404
        student_dict = dict(student)
        image_path = os.path.join(REGISTER_DIR, f'{student_dict["idno"]}.png')
        qr_image_path = os.path.join(QRCODE_DIR, f'{student_dict["idno"]}.png')
        student_dict['image'] = url_for('static', filename=f'images/Register/{student_dict["idno"]}.png') if os.path.exists(image_path) else url_for('static', filename='images/default.png')
        student_dict['qr_code'] = url_for('static', filename=f'images/qrcode/{student_dict["idno"]}.png') if os.path.exists(qr_image_path) else url_for('static', filename='images/qrcode/default.png')
        return jsonify(student_dict)
    except Exception as e:
        print(f"Error retrieving student data: {e}")
        return jsonify({"error": "An error occurred while retrieving the student data"}), 500
    

@app.route('/get_student_info', methods=['POST'])
def get_student_info():
    data = request.get_json()
    idno = data.get('idno')
    student = get_user(idno)
    if isinstance(student, list):
        student = student[0] if student else None

    if student:
        insert_attendance(student)
        image_path = os.path.join('static', 'images', 'Register', f"{student['idno']}.png")
        if os.path.exists(image_path):
            student_info = {
                'lastname': student['lastname'],
                'firstname': student['firstname'],
                'course': student['course'],
                'level': student['level'],
                'image': url_for('static', filename=f'images/Register/{student["idno"]}.png')
            }
        else:
            student_info = {
                'lastname': student['lastname'],
                'firstname': student['firstname'],
                'course': student['course'],
                'level': student['level'],
                'image': url_for('static', filename='images/default.png')
            }

        return jsonify(student_info)

    else:
        flash('Student not found.', 'error')
        return jsonify({'flash': True}), 404
    
    
@app.route('/edit_student', methods=['POST'])
def edit_student():
    if 'username' in session:
        idno = request.form.get('idno')
        lastname = request.form.get('lastname')
        firstname = request.form.get('firstname')
        course = request.form.get('course')
        level = request.form.get('level')
        if not all([idno, lastname, firstname, course, level]):
            flash('All fields are required.', 'error')
            return redirect(url_for('student_list'))

        updated = update_record('students', idno=idno, lastname=lastname, firstname=firstname, course=course, level=level)

        if updated:
            flash('Student updated successfully!', 'success')
        else:
            flash('Error updating student information.', 'error')

        return redirect(url_for('student_list'))
    else:
        flash('Please log in first!', 'warning')
        return redirect(url_for('login'))




@app.route('/delete_qr', methods=['POST'])
def delete_qr():
    try:
        data = request.get_json()
        idno = data.get('idno')
        qr_path = os.path.join(QRCODE_DIR, f"{idno}.png")
        if os.path.exists(qr_path):
            os.remove(qr_path)
            print(f"QR code for ID {idno} deleted successfully.")
            return jsonify({"success": True})
        else:
            return jsonify({"error": "QR code not found"}), 404
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/addstudent', methods=['GET', 'POST'])
def add_student():
    if 'username' not in session:
        flash("Please log in first!", "warning")
        return redirect(url_for('login'))

    pagetitle = "Add Student"
    qr_path = None 

    if request.method == 'POST':
        idno = request.form.get('idno')
        lastname = request.form.get('lastname')
        firstname = request.form.get('firstname')
        course = request.form.get('course')
        level = request.form.get('level')

        student_image_data = request.form.get('image_data')

        if not (idno and lastname and firstname and course and level):
            flash("All fields are required!", 'error')
            return redirect(url_for('add_student'))

        existing_student = get_user(idno)
        if existing_student:
            flash(f"Student with ID {idno} already exists!", 'warning')
            return redirect(url_for('add_student'))

        try:
            if student_image_data:
                image_data = student_image_data.split(',')[1]
                image_path = os.path.join(REGISTER_DIR, f"{idno}.png")
                with open(image_path, 'wb') as img_file:
                    img_file.write(base64.b64decode(image_data))

            qr_data = idno
            qr_data_str = str(qr_data)

            qr_path = os.path.join(QRCODE_DIR, f"{idno}.png")
            qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
            qr.add_data(qr_data_str)
            qr.make(fit=True)
            img = qr.make_image(fill='black', back_color='white')
            img.save(qr_path)

            success = add_record(
                'students',
                idno=idno,
                lastname=lastname,
                firstname=firstname,
                course=course,
                level=level,
                image=image_path,
                qrcode=qr_path 
            )

            if success:
                flash(f"Student added successfully", 'success')
                return redirect(url_for('student_list'))
            else:
                flash("There was an error saving the student details", 'error')

        except Exception as e:
            flash(f"An error occurred: {e}", 'error')
            print(f"Exception: {e}")

    return render_template('addstudent.html', pagetitle=pagetitle, qr_path=qr_path)

@app.route('/delete_user', methods=['POST'])
def delete_user():
    idno = request.form['idno']  
    student = get_user(idno)[0]
    imagename = student['image']
    qrcode_path = student['qrcode']

    ok = delete_record('students', idno=idno)  

    if ok:
        flash("User deleted successfully!", 'delete-success')  
    else:
        flash("Deleting User: Something went wrong", 'error')  

    try:
        if os.path.exists(imagename):  
            os.remove(imagename)
        if os.path.exists(qrcode_path):  
            os.remove(qrcode_path)
    except Exception as e:
        flash("Error within '/delete_user': File path error", 'error')
        print(e)

    return redirect(url_for('student_list'))  


def get_users() -> object:
    return getall_records('students')

def get_user(idno: str) -> object:
    return getone_record('students', idno=idno)

if __name__ == '__main__':
    app.run(debug=True)
