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