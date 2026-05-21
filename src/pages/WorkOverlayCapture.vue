<template>
    <div class="capture-container">
        <div class="capture-label">
            Захваченная область
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                area: null
            }
        },

        methods: {
            async loadArea() {
                this.area = await window.electronAPI.getWorkOverlayArea()
            }
        },

        mounted() {
            this.loadArea()

            setTimeout(() => {
                console.log('[Capture] Window size:', {
                    windowInner: { width: window.innerWidth, height: window.innerHeight },
                    element: this.$el.getBoundingClientRect(),
                    area: this.area
                })
            }, 100)
        },

        beforeUnmount() {
        }
    }
</script>

<style scoped>
    html, body, #app {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    * {
        box-sizing: border-box;
    }



    /* Убираем все отступы и padding */
    .capture-container {
        width: 100%;
        height: 100%;
        position: relative;
        border: 2px solid rgba(48, 48, 48, 0.5);
        border-radius: 12px;
        box-sizing: border-box;
    }

    .capture-label {
        position: absolute;
        bottom: 8px;
        left: 8px;
        background: rgba(48, 48, 48, 0.5);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: white;
        pointer-events: none;
    }

    /* Гарантируем что корневые элементы занимают всё пространство */
    :deep(html),
    :deep(body),
    :deep(#app) {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }
</style>