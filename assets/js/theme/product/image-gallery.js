import $ from 'jquery';
import 'easyzoom';
import _ from 'lodash';

export default class ImageGallery {
    constructor($gallery) {
        this.$mainImage = $gallery.find('[data-image-gallery-main]');
        this.$mainVideo = $gallery.find('[data-img-video-gallery-main]');
        this.$selectableImages = $gallery.find('[data-image-gallery-item]');
        this.currentImage = {};
    }

    init() {
        this.bindEvents();
        this.setImageZoom();
    }

    setMainImage(imgObj) {
        this.currentImage = _.clone(imgObj);

        this.setActiveThumb();
        this.swapMainImage();
    }

    setMainVideo(videoObj) {
        this.currentImage = _.clone(videoObj);

        this.setActiveThumb();
        this.swapMainVideo();
    }

    setAlternateImage(imgObj) {
        if (!this.savedImage) {
            this.savedImage = {
                mainImageUrl: this.$mainImage.find('img').attr('src'),
                zoomImageUrl: this.$mainImage.attr('data-zoom-image'),
                $selectedThumb: this.currentImage.$selectedThumb,
            };
        }
        this.setMainImage(imgObj);
    }

    restoreImage() {
        if (this.savedImage) {
            this.setMainImage(this.savedImage);
            delete this.savedImage;
        }
    }

    selectNewImage(e) {
        e.preventDefault();

        const $target = $(e.currentTarget);
        if ($target.find("img").attr("alt").includes("youtube")) {
            const imgVideoObj = {
                mainVideoUrl: $target.find("img").attr("alt"),                
                $selectedThumb: $target,
            };
    
            this.setMainVideo(imgVideoObj);
        } else {
            const imgObj = {
                mainImageUrl: $target.attr('data-image-gallery-new-image-url'),
                zoomImageUrl: $target.attr('data-image-gallery-zoom-image-url'),
                $selectedThumb: $target,
            };
    
            this.setMainImage(imgObj);
        }
    }

    setActiveThumb() {
        this.$selectableImages.removeClass('is-active');
        if (this.currentImage.$selectedThumb) {
            this.currentImage.$selectedThumb.addClass('is-active');
        }
    }

    getParameterFromYoutube(name, url) {
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    swapMainVideo() {
        let id = this.getParameterFromYoutube('v', this.currentImage.mainVideoUrl);
        this.$mainVideo.attr({
            'src': `https://www.youtube.co/embed/${id}?controls=1`
        })
        this.$mainVideo.show();
        this.$mainImage.hide();
    }

    swapMainImage() {
        this.easyzoom.data('easyZoom').swap(this.currentImage.mainImageUrl, this.currentImage.zoomImageUrl);

        this.$mainImage.attr({
            'data-zoom-image': this.currentImage.zoomImageUrl,
        });

        this.$mainVideo.attr({
            'src': ""
        })
        this.$mainVideo.hide();
        this.$mainImage.show();
    }

    setImageZoom() {
        this.easyzoom = this.$mainImage.easyZoom({ errorNotice: '', loadingNotice: '' });
    }

    bindEvents() {
        this.$selectableImages.on('click', this.selectNewImage.bind(this));
    }
}
