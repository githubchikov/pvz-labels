<template>
    <div class="flex flex-col gap-4">
        <div class="font-medium" v-if="name">{{ name }}</div>

        <select
            :value="modelValue"
            v-bind="extraProps"
            @change="handleChange"
            class="outline-0 font-[inherit]! rounded-16 bg-btn-neutral px-12 min-h-36 h-36 w-full transition-all duration-300"
            :disabled="disabled"
        >
            <option
                v-for="p in values"
                :key="p.value"
                :value="p.value"
            >
                {{ p.label }}
            </option>
        </select>

        <div class="text-secondary" v-if="desc">
            {{ desc }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'Select',
    inheritAttrs: false,

    emits: ['update:modelValue', 'change'],

    props: {
        values: {
            type: Array,
            required: true
        },

        modelValue: {
            type: [String, Number],
            default: ''
        },

        name: String,
        desc: String,

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
        handleChange(event) {
            const value = event.target.value
            this.$emit('update:modelValue', value)
            this.$emit('change', value)
        }
    }
}
</script>

<style>
    select[disabled] {
        cursor: not-allowed;
        opacity: .5;
    }
</style>