<template>
    <button
        :class="buttonClasses"
        v-bind="$attrs"
        :type="type"
    >
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: "Button",
    inheritAttrs: false,

    props: {
        type: {
            type: String,
            default: "submit",
            validator: (v) => ['submit', 'button'].includes(v)
        },
        appearance: {
            type: String,
            default: "neutral",
            validator: (v) => ['neutral', 'positive', 'negative'].includes(v)
        }
    },

    computed: {
        buttonClasses() {
            let classes = {
                neutral: 'bg-btn-neutral',
                positive: 'bg-palette-positive',
                negative: 'bg-palette-negative'
            };
            let ret = `${this.$attrs.class ? this.$attrs.class + " " : ""}${classes[this.appearance]} overflow-hidden rounded-12 font-medium min-h-36 h-36 text-center flex justify-center items-center px-12 transition duration-300`;

            if (!this.$attrs.disabled) {
                ret += ' active:scale-95';
            }

            return ret;
        }
    }
};
</script>

<style scoped>
    a,
    button {
        outline: none;
        cursor: pointer;
    }

    a[disabled],
    button[disabled] {
        cursor: not-allowed;
        opacity: .5;
    }
</style>