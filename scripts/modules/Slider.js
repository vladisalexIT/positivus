export default class Slider {
    constructor(rootElement, options = {}) {
        this.rootElement = rootElement;

        this.options = {
            trackSelector: '[data-slider-track]',
            slideSelector: '[data-slider-slide]',
            prevButtonSelector: '[data-slider-prev]',
            nextButtonSelector: '[data-slider-next]',
            paginationSelector: '[data-slider-pagination]',
            paginationButtonClass: 'pagination__button',
            paginationButtonCurrentClass: 'is-current',
            paginationItemClass: 'pagination__item',
            disabledClass: 'is-disabled',
            activeClass: 'is-active',
            createPagination: true,
            loop: false,
            enabled: true,
            ...options,
        };

        this.trackElement = this.rootElement.querySelector(this.options.trackSelector);
        this.slideElements = Array.from(
            this.rootElement.querySelectorAll(this.options.slideSelector)
        );

        this.prevButtonElement = this.rootElement.querySelector(this.options.prevButtonSelector);
        this.nextButtonElement = this.rootElement.querySelector(this.options.nextButtonSelector);
        this.paginationElement = this.rootElement.querySelector(this.options.paginationSelector);

        this.paginationButtonElements = [];

        this.currentSlideIndex = 0;
        this.resizeObserver = null;
        this.isEnabled = false;

        this.onPrevButtonClick = this.onPrevButtonClick.bind(this);
        this.onNextButtonClick = this.onNextButtonClick.bind(this);
        this.onTrackScroll = this.onTrackScroll.bind(this);
        this.onResize = this.onResize.bind(this);

        if (this.options.enabled) {
            this.init();
        }
    }

    init() {
        if (!this.rootElement || !this.trackElement || !this.slideElements.length) {
            return;
        }

        if (this.isEnabled) {
            return;
        }

        this.isEnabled = true;
        this.rootElement.classList.add('is-slider-initialized');

        if (this.options.createPagination && this.paginationElement) {
            this.createPagination();
        }

        this.bindEvents();
        this.update();
    }

    destroy() {
        if (!this.isEnabled) {
            return;
        }

        this.isEnabled = false;
        this.rootElement.classList.remove('is-slider-initialized');

        this.unbindEvents();

        if (this.paginationElement && this.options.createPagination) {
            this.paginationElement.innerHTML = '';
        }

        this.paginationButtonElements = [];

        if (this.prevButtonElement) {
            this.prevButtonElement.disabled = false;
        }

        if (this.nextButtonElement) {
            this.nextButtonElement.disabled = false;
        }
    }

    bindEvents() {
        this.prevButtonElement?.addEventListener('click', this.onPrevButtonClick);
        this.nextButtonElement?.addEventListener('click', this.onNextButtonClick);
        this.trackElement.addEventListener('scroll', this.onTrackScroll, { passive: true });
        window.addEventListener('resize', this.onResize);

        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(this.onResize);
            this.resizeObserver.observe(this.trackElement);
        }
    }

    unbindEvents() {
        this.prevButtonElement?.removeEventListener('click', this.onPrevButtonClick);
        this.nextButtonElement?.removeEventListener('click', this.onNextButtonClick);
        this.trackElement.removeEventListener('scroll', this.onTrackScroll);
        window.removeEventListener('resize', this.onResize);

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }

    createPagination() {
        this.paginationElement.innerHTML = '';

        const listElement = this.paginationElement.tagName.toLowerCase() === 'ul'
            ? this.paginationElement
            : document.createElement('ul');

        if (listElement !== this.paginationElement) {
            listElement.className = 'pagination__list';
            this.paginationElement.append(listElement);
        }

        this.slideElements.forEach((_, index) => {
            const itemElement = document.createElement('li');
            const buttonElement = document.createElement('button');

            itemElement.className = this.options.paginationItemClass;

            buttonElement.className = this.options.paginationButtonClass;
            buttonElement.type = 'button';
            buttonElement.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);

            buttonElement.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M7.0099 2.05941L14 0L11.9604 7.0099L14 14L7.0099 11.9604L0 14L2.05941 7.0099L0 0L7.0099 2.05941Z" fill="white" />
                </svg>
            `;

            buttonElement.addEventListener('click', () => {
                this.goToSlide(index);
            });

            itemElement.append(buttonElement);
            listElement.append(itemElement);

            this.paginationButtonElements.push(buttonElement);
        });
    }

    onPrevButtonClick() {
        this.goToSlide(this.currentSlideIndex - 1);
    }

    onNextButtonClick() {
        this.goToSlide(this.currentSlideIndex + 1);
    }

    onTrackScroll() {
        window.requestAnimationFrame(() => {
            const newSlideIndex = this.getCurrentSlideIndex();

            if (newSlideIndex !== this.currentSlideIndex) {
                this.currentSlideIndex = newSlideIndex;
                this.update();
            }
        });
    }

    onResize() {
        this.currentSlideIndex = this.getCurrentSlideIndex();
        this.update();
    }

    getCurrentSlideIndex() {
        const trackRect = this.trackElement.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;

        let closestSlideIndex = 0;
        let closestDistance = Infinity;

        this.slideElements.forEach((slideElement, index) => {
            const slideRect = slideElement.getBoundingClientRect();
            const slideCenter = slideRect.left + slideRect.width / 2;
            const distance = Math.abs(trackCenter - slideCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestSlideIndex = index;
            }
        });

        return closestSlideIndex;
    }

    goToSlide(index) {
        let nextIndex = index;

        if (this.options.loop) {
            if (nextIndex < 0) {
                nextIndex = this.slideElements.length - 1;
            }

            if (nextIndex > this.slideElements.length - 1) {
                nextIndex = 0;
            }
        } else {
            nextIndex = Math.max(0, Math.min(nextIndex, this.slideElements.length - 1));
        }

        const slideElement = this.slideElements[nextIndex];

        if (!slideElement) {
            return;
        }

        slideElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
        });

        this.currentSlideIndex = nextIndex;
        this.update();
    }

    update() {
        this.updateSlides();
        this.updateButtons();
        this.updatePagination();
    }

    updateSlides() {
        this.slideElements.forEach((slideElement, index) => {
            slideElement.classList.toggle(
                this.options.activeClass,
                index === this.currentSlideIndex
            );
        });
    }

    updateButtons() {
        if (this.options.loop) {
            if (this.prevButtonElement) {
                this.prevButtonElement.disabled = false;
            }

            if (this.nextButtonElement) {
                this.nextButtonElement.disabled = false;
            }

            return;
        }

        if (this.prevButtonElement) {
            this.prevButtonElement.disabled = this.currentSlideIndex === 0;
        }

        if (this.nextButtonElement) {
            this.nextButtonElement.disabled =
                this.currentSlideIndex === this.slideElements.length - 1;
        }
    }

    updatePagination() {
        this.paginationButtonElements.forEach((buttonElement, index) => {
            const isCurrent = index === this.currentSlideIndex;

            buttonElement.classList.toggle(
                this.options.paginationButtonCurrentClass,
                isCurrent
            );

            if (isCurrent) {
                buttonElement.setAttribute('aria-current', 'true');
            } else {
                buttonElement.removeAttribute('aria-current');
            }
        });
    }
}