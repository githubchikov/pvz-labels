<template>
    <transition
        mode="out-in"
        @before-enter="heightAnimationBeforeEnter"
        @enter="heightAnimationEnter"
        @leave="heightAnimationLeave"
        @after-enter="removeHeight"
        @after-leave="removeHeight"
        appear
        v-if="!isGroup"
    >
        <slot></slot>
    </transition>

    <transition-group
        @before-enter="heightAnimationBeforeEnter"
        @enter="heightAnimationEnter"
        @leave="heightAnimationLeave"
        @after-enter="removeHeight"
        @after-leave="removeHeight"
        appear
        v-else
    >
        <slot></slot>
    </transition-group>
</template>

<script>
export default {
    name: 'AnimatedContent',

    props: {
        mt: {
            type: Number,
            default: 0
        },
        isGroup: {
            type: Boolean,
            default: false
        }
    },

    methods: {
        heightAnimationBeforeEnter(el) {
            el._originalPaddingTop = el.style.paddingTop || getComputedStyle(el).paddingTop;
            el._originalPaddingBottom = el.style.paddingBottom || getComputedStyle(el).paddingBottom;

            el.style.height = '0px';
            el.style.opacity = '0';
            el.style.paddingTop = '0';
            el.style.paddingBottom = '0';
            el.style.marginTop = '0';
            el.style.filter = 'blur(8px)';
            el.style.transform = 'scale(.8)';
            el.style.overflow = 'hidden';
        },

        heightAnimationEnter(el, done) {
            this.$nextTick(() => {
                const fullHeight = el.scrollHeight;
                el.offsetHeight;

                el.style.transition = `height .3s ease, opacity .3s ease, transform .3s ease, filter .3s ease`;
                el.style.height = fullHeight + 'px';
                el.style.opacity = '1';
                el.style.paddingTop = el._originalPaddingTop;
                el.style.paddingBottom = el._originalPaddingBottom;
                el.style.marginTop = this.mt + 'px';
                el.style.filter = 'blur(0)';
                el.style.transform = 'scale(1)';

                el.addEventListener('transitionend', done, { once: true });
            });
        },

        heightAnimationLeave(el, done) {
            el._originalPaddingTop = el.style.paddingTop || getComputedStyle(el).paddingTop;
            el._originalPaddingBottom = el.style.paddingBottom || getComputedStyle(el).paddingBottom;

            el.style.height = el.scrollHeight + 'px';
            el.offsetHeight;
            el.style.transition = `height .3s ease, opacity .3s ease, transform .3s ease, filter .3s ease`
            el.style.height = '0px';
            el.style.opacity = '0';
            el.style.paddingTop = '0';
            el.style.paddingBottom = '0';
            el.style.marginTop = '0';
            el.style.transform = 'scale(.8)';
            el.style.filter = 'blur(8px)';
            el.addEventListener('transitionend', done, { once: true });
        },

        removeHeight(el) {
            el.style.height = '';
            el.style.opacity = '1';
            el.style.paddingTop = '';
            el.style.paddingBottom = '';
            el.style.transition = ``;
        }
    }
}
</script>