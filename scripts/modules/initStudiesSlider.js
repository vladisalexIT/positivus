import Slider from './Slider.js';

const mobileMediaQuery = window.matchMedia('(max-width: 767.98px)');

export default function initStudiesSlider() {
    const studiesElement = document.querySelector('[data-slider="studies"]');

    if (!studiesElement) {
        return;
    }

    let studiesSlider = null;

    const enableSlider = () => {
        if (studiesSlider) {
            return;
        }

        studiesSlider = new Slider(studiesElement, {
            createPagination: false,
            loop: false,
        });
    };

    const disableSlider = () => {
        if (!studiesSlider) {
            return;
        }

        studiesSlider.destroy();
        studiesSlider = null;
    };

    const handleMediaQueryChange = () => {
        if (mobileMediaQuery.matches) {
            enableSlider();
        } else {
            disableSlider();
        }
    };

    handleMediaQueryChange();

    mobileMediaQuery.addEventListener('change', handleMediaQueryChange);
}