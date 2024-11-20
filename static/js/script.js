window.addEventListener('DOMContentLoaded', (event) => {
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach((flashMessage) => {
        setTimeout(() => {
            flashMessage.classList.add('fade-out');
        }, 2500);

        flashMessage.addEventListener('animationend', () => {
            flashMessage.remove();
        });
    });
});







