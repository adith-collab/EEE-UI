document.addEventListener("DOMContentLoaded", function() {
    var swiper = new Swiper(".swiper", {
        effect: "cards",
        grabCursor: true,
        initialSlide: 2,
        speed: 500,
        loop: true,
        mousewheel: {
            invert: false,
        },
    });
});
