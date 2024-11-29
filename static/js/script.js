document.addEventListener('DOMContentLoaded', () => {
    // Flash message handling
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach((flashMessage) => {
        setTimeout(() => {
            flashMessage.classList.add('fade-out');
        }, 2500);
        flashMessage.addEventListener('animationend', () => {
            flashMessage.remove();
        });
    });

    // Navbar active class handling based on current URL
    const navLinks = document.querySelectorAll('.navbar a');
    const setActiveClass = () => {
        const currentPath = window.location.pathname;
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    };
    setActiveClass();
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Menu icon toggle for mobile
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');
    if (menuIcon && navbar) {
        menuIcon.onclick = () => {
            navbar.classList.toggle('active');
            menuIcon.classList.toggle('rotated');
            menuIcon.classList.toggle('rotated-reverse');
        };
    }

    // Scroll event for sticky navbar and active section highlighting
    let sections = document.querySelectorAll('section');
    let navLinksForScroll = document.querySelectorAll('header nav a');
    window.onscroll = () => {
        sections.forEach(sec => {
            let top = window.scrollY;
            let offset = sec.offsetTop - 150;
            let height = sec.offsetHeight;
            let id = sec.getAttribute('id');
            if (top >= offset && top < offset + height) {
                navLinksForScroll.forEach(link => {
                    link.classList.remove('active');
                    const activeLink = document.querySelector(`header nav a[href*="${id}"]`);
                    if (activeLink) activeLink.classList.add('active');
                });
            }
        });

        const header = document.querySelector('header');
        if (header) {
            header.classList.toggle('sticky', window.scrollY > 100);
        }

        if (menuIcon && navbar) {
            menuIcon.classList.remove('bx-x');
            navbar.classList.remove('active');
        }
    };

    // Search bar functionality
    const searchBar = document.getElementById('search-bar');
    const searchButton = document.getElementById('search-button');
    const table = document.getElementById('table');
    const noResultsMessage = document.createElement('tr');
    noResultsMessage.innerHTML = `<td colspan="6" class="w3-center">No student existed</td>`;
    noResultsMessage.style.display = 'none';
    table.querySelector('tbody').appendChild(noResultsMessage);

    if (table) {
        const rows = Array.from(table.querySelectorAll('tbody tr')).filter(row => !row.contains(noResultsMessage));
        const filterByIdno = () => {
            const searchValue = searchBar.value.toLowerCase();
            let matches = 0;
            rows.forEach(row => {
                const idnoCell = row.querySelector('[data-cell="IDNO:"]');
                const idnoValue = idnoCell ? idnoCell.textContent.toLowerCase() : '';
                row.style.display = (searchValue === '' || idnoValue.includes(searchValue)) ? '' : 'none';
                if (row.style.display === '') matches++;
            });
            noResultsMessage.style.display = matches === 0 ? '' : 'none';
        };

        const validateSearch = () => {
            const searchValue = searchBar.value.trim();
            if (searchValue === '' || isNaN(searchValue)) {
                alert('Only IDno can be searched. Please enter a valid ID number.');
                searchBar.value = '';
                return false;
            }
            return true;
        };

        searchButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (validateSearch()) filterByIdno();
        });
        searchBar.addEventListener('keyup', (event) => {
            if (event.key === 'Enter' && validateSearch()) filterByIdno();
            if (searchBar.value === '') {
                rows.forEach(row => (row.style.display = ''));
                noResultsMessage.style.display = 'none';
            }
        });
    } else {
        console.error('Table element not found');
    }

    // Cursor effect
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        document.addEventListener('mousemove', e => {
            cursor.style.top = `${e.pageY - 10}px`;
            cursor.style.left = `${e.pageX - 10}px`;
        });

        document.addEventListener('click', e => {
            cursor.classList.add("expand");
            setTimeout(() => cursor.classList.remove("expand"), 500);

            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            const size = 50;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.pageX - size / 2}px`;
            ripple.style.top = `${e.pageY - size / 2}px`;
            document.body.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    }
});
