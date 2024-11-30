function openCustomAlert(idno) {
    document.getElementById('deleteIdNo').value = idno;
    document.getElementById('customAlert').style.display = 'flex'; 
}

function closeAlert() {
    document.getElementById('customAlert').style.display = 'none';
}

(function () {
    if (window.history && window.history.pushState) {
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = function () {
            window.history.pushState(null, null, window.location.href);
        };
    }
})();

function viewStudent(idno) {
fetch(`/get_student/${idno}`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            document.getElementById('idno-view').value = data.idno;
            document.getElementById('lastname-view').value = data.lastname;
            document.getElementById('firstname-view').value = data.firstname;
            document.getElementById('course-view').value = data.course;
            document.getElementById('level-view').value = data.level;

            const imageElement = document.getElementById('image-view');
            if (data.image) {
                imageElement.src = data.image;
            } else {
                imageElement.src = '/static/images/default.png';
            }
            const qrElement = document.getElementById('qr-view');
            if (data.qr_code) {
                qrElement.src = data.qr_code;
            } else {
                qrElement.src = '/static/images/qrcode/default.png'; 
            }

            document.getElementById('viewModal').style.display = 'flex';
        }
    })
    .catch(error => {
        console.error('Error fetching student data:', error);
        alert('An error occurred while fetching student data.');
    });
}

function closeViewModal() {
document.getElementById('viewModal').style.display = 'none';
}

function openEditModal(idno) {
    // Fetch the student data based on the idno (you can either pass it to your server or fetch from a JavaScript variable)
    const student = getStudentData(idno); // This function will need to be implemented or replaced with AJAX call.

    // Open the modal
    document.getElementById('viewModal').style.display = 'block';

    // Populate the modal fields with the student's data
    document.getElementById('idno-view').value = student.idno;
    document.getElementById('lastname-view').value = student.lastname;
    document.getElementById('firstname-view').value = student.firstname;
    document.getElementById('course-view').value = student.course;
    document.getElementById('level-view').value = student.level;
    
    // Optionally set a hidden input field to indicate it's an edit operation
    document.getElementById('flag').value = 1; // Set flag to '1' to indicate editing
}

function getStudentData(idno) {
    // Example function to simulate getting the data from the server
    // This should ideally be an AJAX call to fetch the data from the backend
    return {
        idno: idno,
        lastname: 'Doe',
        firstname: 'John',
        course: 'Computer Science',
        level: '3'
    };
}


function openEditModal(idno, lastname, firstname, course, level) {
    // Pre-fill the modal fields
    document.getElementById('edit-idno-view').value = idno;
    document.getElementById('edit-lastname-view').value = lastname;
    document.getElementById('edit-firstname-view').value = firstname;

    // Set the current course in the dropdown
    const courseDropdown = document.getElementById('edit-course-view');
    for (let i = 0; i < courseDropdown.options.length; i++) {
        if (courseDropdown.options[i].value === course) {
            courseDropdown.selectedIndex = i;
            break;
        }
    }

    // Set the current level in the dropdown
    const levelDropdown = document.getElementById('edit-level-view');
    for (let i = 0; i < levelDropdown.options.length; i++) {
        if (levelDropdown.options[i].value === level) {
            levelDropdown.selectedIndex = i;
            break;
        }
    }

    // Show the modal
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}
