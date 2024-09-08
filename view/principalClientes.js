document.addEventListener('DOMContentLoaded', function() {
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    const carouselImages = document.querySelector('.carousel-images');
    let index = 0;
    const images = carouselImages.children.length;

    function updateCarousel() {
        const offset = -index * 100;
        carouselImages.style.transform = `translateX(${offset}%)`;
    }

    nextButton.addEventListener('click', function() {
        index = (index + 1) % images;
        updateCarousel();
    });

    prevButton.addEventListener('click', function() {
        index = (index - 1 + images) % images;
        updateCarousel();
    });
});
