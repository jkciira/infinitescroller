window.addEventListener('load', () => {
    runLoader();
    runInfiniteSlider();
});

function runLoader() {
    const loader = document.querySelector('.loader');
    const loaderTimeout = +getComputedStyle(loader).getPropertyValue('--timing');

    loader.classList.add('hideLoader');

    setTimeout(() => {
        loader.style.display = 'none';
    }, loaderTimeout);
}

function runInfiniteSlider() {
    const sliders = document.querySelectorAll('.slider');

    if (sliders.length > 0) {
        sliders.forEach(slider => {
            sliderInit(slider);
        });
        return;
    }

    function sliderInit(element) {
        const slider = element;
        const sliderWrapper = slider.querySelector('.slider-ul--wrapper');

        let items = sliderWrapper.querySelectorAll('.slider-li--item');

        let itemCount = items.length;

        if (itemCount === 0) return;

        const maxCount = 600;

        let maxCounter = 0;
        let cloneItems = [], clickable = true, focusIndex = null, clonePrefix, cloneSufix;

        let itemsOnScreen = +getComputedStyle(sliderWrapper).getPropertyValue('--screen-items');

        let itemMoveDist = () => {
            const itemWidth = items[0].offsetWidth;
            const itemMarginRight = parseInt(getComputedStyle(items[0]).getPropertyValue('margin-right'));

            return itemWidth + itemMarginRight;
        };

        const transitionTime = 500;
        const transitionType = 'ease-in-out';
        const sliderTransition = `transform ${transitionTime}ms ${transitionType}`;

        const sliderBtns = slider.querySelectorAll('.slider-button');

        prepPrefixArray = () => {
            clonePrefix = [];

            const triggerIndex = itemCount - itemsOnScreen;

            cloneItems.forEach((item, idx) => {
                if (idx >= triggerIndex) {
                    let itemClone = item.cloneNode(true);

                    itemClone.classList.add('pre');

                    clonePrefix.push(itemClone);
                }
            });
        };

        prepSuffixArray = () => {
            cloneSufix = [];
            const triggerIndex = itemsOnScreen - 1;

            cloneItems.forEach((item, idx) => {
                if (idx <= triggerIndex) {
                    const itemClone = item.cloneNode(true);

                    itemClone.classList.add('suf');

                    cloneSufix.push(itemClone);
                }
            });
        };

        cloneSliderItems = () => {
            items.forEach(item => {
                const itemClone = item.cloneNode(true);

                cloneItems.push(itemClone);
            });
        };

        removeSliderItems = () => {
            items.forEach(item => {
                item.remove();
            });
        };

        addPrefixItems = () => {
            clonePrefix.forEach((item, idx) => {
                this.removeTriggers(item);

                if (idx == 0) {
                    item.setAttribute('trigger-to-last', '');
                }

                sliderWrapper.append(item);
            });

            clonePrefix = [];
        };

        removeTriggers = (item) => {
            if (item.hasAttribute('first-trigger')) {
                item.removeAttribute('first-trigger');
            }

            if (item.hasAttribute('last-trigger')) {
                item.removeAttribute('last-trigger');
            }
        };

        normItems = () => {
            const lastTrigger = itemCount - itemsOnScreen;

            cloneItems.forEach((item, idx) => {
                this.removeTriggers(item);

                if (idx == 0) {
                    item.setAttribute('first-trigger', '');
                }

                if (idx == lastTrigger) {
                    item.setAttribute('last-trigger', '');
                }

                sliderWrapper.append(item);
            });
        };

        addSufixItems = () => {
            cloneSufix.forEach((item, idx) => {
                this.removeTriggers(item);

                if (idx == 0) {
                    item.setAttribute('trigger-to-first', '');
                }

                sliderWrapper.append(item);
            });

            cloneSufix = [];
        };

        setFocus = () => {
            const index = focusIndex == null ? itemsOnScreen : focusIndex;

            items = sliderWrapper.querySelectorAll('.slider-li--item');

            items.forEach(item => {
                item.classList.remove('focus');
            });

            if (index < 0) {
                items[this.getResetTriggerIndex() - 1].classList.add('focus');
                return;
            }

            items[index].classList.add('focus');
        };

        initialTranslateToFocus = () => {
            const index = focusIndex == null ? itemsOnScreen : focusIndex;

            sliderWrapper.style.transition = 'none';
            sliderWrapper.style.transform = `translateX(${-itemMoveDist() * index}px)`;
        };

        addPreparedItems = () => {
            this.addPrefixItems();
            this.normItems();
            this.addSufixItems();
            this.setFocus();
            this.initialTranslateToFocus();
        };

        matchItemsToScreenItems = () => {
            const itemDiff = (itemsOnScreen - itemCount) + 1;
            let itemIndex = 0;

            for (count = 0; count <= itemDiff; count++) {
                if (itemIndex > itemCount - 1) itemIndex = 0;

                let cloneItem = items[itemIndex].cloneNode(true);

                itemIndex++;

                sliderWrapper.append(cloneItem);
            }

            items = sliderWrapper.querySelectorAll('.slider-li--item');
            itemCount = items.length;
        };

        sliderItemsCountCheck = () => {
            if (itemCount < itemsOnScreen) {
                this.matchItemsToScreenItems();
            }
        };

        autoPlay = () => {
            maxCounter++;

            if (maxCounter <= maxCount) {
                if (maxCounter == maxCount) {
                    maxCounter = 0;

                    this.showNextItem();
                }

                requestAnimationFrame(autoPlay);
            }
        };

        prepItems = () => {
            this.sliderItemsCountCheck();
            this.cloneSliderItems();
            this.prepPrefixArray();
            this.prepSuffixArray();
            this.removeSliderItems();
            this.addPreparedItems();
            this.autoPlay();
        };

        resetItemPosition = () => {
            window.addEventListener('resize', () => {
                let previousScreenItems = itemsOnScreen;
                maxCounter = 0;

                itemsOnScreen = +getComputedStyle(sliderWrapper).getPropertyValue('--screen-items');

                if (previousScreenItems > itemsOnScreen) {
                    focusIndex = this.getCurrentFocusIndex() - (previousScreenItems - itemsOnScreen);
                } else if (previousScreenItems < itemsOnScreen) {
                    focusIndex = this.getCurrentFocusIndex() + (itemsOnScreen - previousScreenItems);
                } else {
                    focusIndex = this.getCurrentFocusIndex();
                }

                this.prepPrefixArray();
                this.prepSuffixArray();
                this.removeSliderItems();

                this.addPrefixItems();
                this.normItems();
                this.addSufixItems();
                this.setFocus();

                this.initialTranslateToFocus();
            });
        };

        runFunction = () => {
            this.prepItems();
            this.resetItemPosition();
            this.sliderBtnsClicked();
        };

        getCurrentFocusIndex = () => {
            let focusItem = sliderWrapper.querySelector('.focus');

            return [...sliderWrapper.children].indexOf(focusItem);
        };

        animateSlider = (modifier) => {
            const sliderComputed = getComputedStyle(sliderWrapper);
            const sliderTx = new WebKitCSSMatrix(sliderComputed.transform).m41;
            const moveDist = sliderTx + (-modifier * itemMoveDist());


            sliderWrapper.style.transition = sliderTransition;
            sliderWrapper.style.transform = `translateX(${moveDist}px)`;
        };

        shiftFocus = (nextIndex) => {
            items.forEach(item => {
                item.classList.remove('focus');
            });

            items[nextIndex].classList.add('focus');
        };

        getResetTriggerIndex = (trigger = 'last-trigger') => {

            for (count = 0; count < items.length; count++) {
                const item = items[count];

                if (item.hasAttribute(trigger)) {
                    return count;
                }
            }
        };

        resetToLastTrigger = (reset) => {
            sliderWrapper.addEventListener('transitionend', () => {
                if (!reset) return;
                const lastTriggerIndex = this.getResetTriggerIndex();

                sliderWrapper.style.transition = 'none';
                sliderWrapper.style.transform = `translateX(${-itemMoveDist() * lastTriggerIndex}px)`;

                this.shiftFocus(lastTriggerIndex);

                reset = false;
            });
        };

        resetToFirstTrigger = (reset) => {
            sliderWrapper.addEventListener('transitionend', () => {
                if (!reset) return;
                const lastTriggerIndex = this.getResetTriggerIndex('first-trigger');

                sliderWrapper.style.transition = 'none';
                sliderWrapper.style.transform = `translateX(${-itemMoveDist() * lastTriggerIndex}px)`;

                this.shiftFocus(lastTriggerIndex);

                reset = false;
            });
        };

        triggerCheck = (nextIndex) => {
            const nextItem = items[nextIndex];

            this.shiftFocus(nextIndex);

            if (nextItem.hasAttribute('trigger-to-last')) {
                this.resetToLastTrigger(true);
                return;
            }

            if (nextItem.hasAttribute('trigger-to-first')) {
                this.resetToFirstTrigger(true);
                return;
            }
        };

        showNextItem = (modifier = 1) => {
            focusIndex = this.getCurrentFocusIndex();

            let nextIndex = focusIndex + modifier;

            this.triggerCheck(nextIndex);
            this.animateSlider(modifier);
            clickable = false;

            setTimeout(() => {
                clickable = true;
            }, transitionTime);
        };

        sliderBtnsClicked = () => {
            sliderBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (!clickable) return;
                    const modifier = +e.target.getAttribute('modifier');

                    maxCounter = 0;
                    this.showNextItem(modifier);
                });
            });
        };

        this.runFunction();
    }
}