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
                // Populate student details
                document.getElementById('idno-view').value = data.idno;
                document.getElementById('lastname-view').value = data.lastname;
                document.getElementById('firstname-view').value = data.firstname;
                document.getElementById('course-view').value = data.course;
                document.getElementById('level-view').value = data.level;

                // Update the student image
                const imageElement = document.getElementById('image-view');
                imageElement.src = data.image ? data.image : '/static/images/default.png';

                // Update the QR code image and download link
                const qrElement = document.getElementById('qr-view');
                const hiddenDownloadLink = document.getElementById('hidden-download-link');
                
                if (data.qr_code) {
                    qrElement.src = data.qr_code; // Set QR code source
                    hiddenDownloadLink.href = data.qr_code; // Update download link href
                } else {
                    qrElement.src = '/static/images/qrcode/default.png'; // Default QR code
                    hiddenDownloadLink.href = '/static/images/qrcode/default.png'; // Default download link
                }

                // Show the modal
                document.getElementById('viewModal').style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('Error fetching student data:', error);
            alert('An error occurred while fetching student data.');
        });
}

// Function to close the modal
function closeModal() {
    document.getElementById('viewModal').style.display = 'none';
}

// Add click event for QR code download
document.getElementById('qr-view').addEventListener('click', function () {
    document.getElementById('hidden-download-link').click();
});

function closeViewModal() {
document.getElementById('viewModal').style.display = 'none';
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
    const modal = document.getElementById('editModal');
    modal.style.display = 'flex';

    console.log('Modal should be shown:', modal.style.display); // Debugging line
}
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}
