export default class ScrollSliderTrack extends HTMLElement {
    
    get slides() {
        return [...this.children];
    }

    getNextSlide() {
        const currentScroll = this.scrollLeft;
        return this.slides.find((slide)=> slide.offsetLeft > currentScroll);
    }

    getNextSlideWidth() {
        const nextSlide = this.getNextSlide();

        if(nextSlide) {
            return nextSlide.offsetLeft - this.scrollLeft;
        }

        return 0;
    }

    getPrevSlide() {
        const currentScroll = this.scrollLeft
        return this.slides
        .reverse()
        .find((slide) => slide.offsetLeft < currentScroll);
    }

    getPrevSlideWidth() {
        const prevSlide = this.getPrevSlide();

        if(prevSlide) {
            return this.scrollLeft - prevSlide.offsetLeft;
        }

        return 0;
    }

    scrollByAmount(amount) {
        this.scrollBy({left: amount, behavior: "smooth"});
    }

    scrollToNext () {
        this.scrollByAmount(this.getNextSlideWidth());
    }

    scrollToPrev () {
        this.scrollByAmount(-this.getPrevSlideWidth());
    }
}

customElements.define("scroll-slider-track", ScrollSliderTrack);