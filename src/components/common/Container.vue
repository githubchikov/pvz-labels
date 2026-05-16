<template>
    <div
        class="flex flex-col gap-8 rounded-28 p-12 bg-secondary"
        :class="{
            'border-2 border-palette-positive': border === 'positive',
            'border-2 border-palette-negative': border === 'negative'
        }"
    >

        <div class="flex gap-8 items-center">
            <slot name="header"></slot>
        </div>
        <slot name="content"></slot>

    </div>
</template>

<script>
    export default {
        name: 'Container',
        inheritAttrs: false,

        props: {
            border: {
                type: String,
                default: null,
                validator: (v) => !v || ['positive', 'negative'].includes(v)
            }
        },
    };
</script>