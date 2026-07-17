import Slider from './Slider.js';

export default function initReviewsSlider() {
    const reviewsElement = document.querySelector('[data-slider="reviews"]');

    if (!reviewsElement) {
        return;
    }

    new Slider(reviewsElement, {
        createPagination: true,
        loop: false,
    });
}