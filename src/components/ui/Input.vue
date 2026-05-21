<template>
    <div class="flex-1 flex flex-col gap-4">
        <div class="font-medium" v-if="name">{{ name }}</div>

        <input
            @input="handleInput"
            @blur="$emit('blur', $event)"
            @change="$emit('change', $event)"
            :placeholder="placeholder"
            :value="modelValue"
            :required="required"
            :disabled="disabled"
            :type="type"
            v-bind="extraProps"
            class="outline-0 font-[inherit]! border-none! rounded-12 bg-btn-neutral px-12 min-h-36 h-36 w-full transition-all duration-300"
            maxlength="255"
        />

        <div class="text-secondary" v-if="desc">
            {{ desc }}
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Input',
        inheritAttrs: false,
        emits: ['update:modelValue', 'blur', 'change'],

        props: {
            modelValue: {
                type: [String, Number],
                default: ''
            },

            name: String,
            desc: String,
            type: {
                type: String,
                default: 'text'
            },

            placeholder: String,
            required: Boolean,

            value: {
                type: [String, Number],
                default: null
            },

            disabled: {
                type: Boolean,
                default: false
            },

            extraProps: {
                type: Object,
                default: () => ({})
            }
        },

        methods: {
            handleInput(event) {
                this.$emit('update:modelValue', event.target.value)
            }
        }
    }
</script>

<style>
    input[disabled] {
        cursor: not-allowed;
        opacity: .5;
    }
</style>