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
        };
    }
    menuIcon.onclick = () => {
        menuIcon.classList.toggle('bx-x');
        navbar.classList.toggle('active');
    
        if (menuIcon.classList.contains('rotated')) {
            menuIcon.classList.remove('rotated');
            menuIcon.classList.add('rotated-reverse');
        } else {
            menuIcon.classList.remove('rotated-reverse');
            menuIcon.classList.add('rotated');
        }
    };
    // Scroll event for sticky navbar and active section highlighting
    let sections = document.querySelectorAll('section');
    let navLinksForScroll = document.querySelectorAll('header nav a');
    
    window.onscroll = () => {
        // Handle active link based on scroll position
        sections.forEach(sec => {
            let top = window.scrollY;
            let offset = sec.offsetTop - 150;
            let height = sec.offsetHeight;
            let id = sec.getAttribute('id');

            if (top >= offset && top < offset + height) {
                navLinksForScroll.forEach(link => {
                    link.classList.remove('active');
                    document.querySelector('header nav a[href*="' + id + '"]').classList.add('active');
                });
            }
        });

        let header = document.querySelector('header');
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

    if (table) {
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        const noResultsMessage = document.createElement('div');
        noResultsMessage.id = 'no-results';
        noResultsMessage.style.display = 'none';
        noResultsMessage.textContent = 'No student found';
        table.parentNode.insertBefore(noResultsMessage, table.nextSibling);

        function calculateCloseness(a, b) {
            if (a.length === 0) return b.length;
            if (b.length === 0) return a.length;

            let matrix = [];
            for (let i = 0; i <= b.length; i++) {
                matrix[i] = [i];
            }

            for (let j = 0; j <= a.length; j++) {
                matrix[0][j] = j;
            }

            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                    }
                }
            }

            return matrix[b.length][a.length];
        }

        function filterTable() {
            const searchValue = searchBar.value.toLowerCase();
            let matches = 0;
            let rowArray = Array.from(rows);

            // Calculate closeness for each row and prioritize exact matches
            let closenessArray = rowArray.map(row => {
                const cellValue = row.cells[0].textContent.toLowerCase();
                const isExactMatch = cellValue === searchValue;
                const closeness = calculateCloseness(searchValue, cellValue);
                return {
                    row: row,
                    isExactMatch: isExactMatch,
                    closeness: closeness
                };
            });

            // Sort rows by exact match first, then by closeness
            closenessArray.sort((a, b) => {
                if (a.isExactMatch && !b.isExactMatch) return -1;
                if (!a.isExactMatch && b.isExactMatch) return 1;
                return a.closeness - b.closeness;
            });

            for (let i = 0; i < closenessArray.length; i++) {
                const row = closenessArray[i].row;
                const cells = row.getElementsByTagName('td');
                let matchFound = false;

                for (let j = 0; j < cells.length; j++) {
                    const cell = cells[j];
                    if (cell.textContent.toLowerCase().includes(searchValue)) {
                        matchFound = true;
                        break;
                    }
                }

                if (matchFound) {
                    row.style.display = '';
                    matches++;
                } else {
                    row.style.display = 'none';
                }
            }

            if (matches === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
            }
        }

        // Handle search button click
        searchButton.addEventListener('click', function (event) {
            event.preventDefault();
            filterTable();
        });

        // Handle Enter key press in search bar
        searchBar.addEventListener('keyup', function (event) {
            if (event.key === 'Enter') {
                filterTable();
            }
            if (searchBar.value === '') {
                for (let i = 0; i < rows.length; i++) {
                    rows[i].style.display = '';
                }
                noResultsMessage.style.display = 'none';
            }
        });
    } else {
        console.error('Table element not found');
    }
});
