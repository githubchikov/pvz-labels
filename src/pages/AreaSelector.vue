<template>
    <div
        class="fixed inset-0 bg-[rgba(0,0,0,.3)] cursor-crosshair"
        @mousedown="startSelection"
        @mousemove="updateSelection"
        @mouseup="finishSelection"
    >

        <div class="absolute top-60 left-1/2 -translate-x-1/2 text-center select-none">
            Выберите область распознавания с помощью мышки<br>Для выхода нажмите ESC
        </div>

        <div
            v-if="isSelecting"
            class="absolute border-2 border-white bg-[rgba(255,255,255,.15)]"
            :style="selectionStyle"
        />

    </div>
</template>

<script>
    export default {
        data() {
            return {
                startX: 0,
                startY: 0,

                currentX: 0,
                currentY: 0,

                isSelecting: false,

                minSize: 1
            }
        },

        computed: {
            selectionStyle() {
                const x = Math.min(this.startX, this.currentX)
                const y = Math.min(this.startY, this.currentY)

                const width = Math.abs(this.currentX - this.startX)
                const height = Math.abs(this.currentY - this.startY)

                return {
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${width}px`,
                    height: `${height}px`
                }
            }
        },

        methods: {
            startSelection(e) {
                this.isSelecting = true

                this.startX = e.clientX
                this.startY = e.clientY
                this.currentX = e.clientX + this.minSize
                this.currentY = e.clientY + this.minSize
            },

            updateSelection(e) {
                if (!this.isSelecting) return

                const rawX = e.clientX
                const rawY = e.clientY

                this.currentX = Math.max(this.startX + this.minSize, rawX)
                this.currentY = Math.max(this.startY + this.minSize, rawY)
            },

            finishSelection() {
                if (!this.isSelecting) return

                this.isSelecting = false

                const scale = window.devicePixelRatio || 1

                const x = this.startX * scale
                const y = this.startY * scale

                const width = Math.max(this.minSize, (this.currentX - this.startX)) * scale
                const height = Math.max(this.minSize, (this.currentY - this.startY)) * scale

                requestAnimationFrame(() => {
                    window.electronAPI.sendSelectedArea({
                        x: Math.round(x),
                        y: Math.round(y),
                        width: Math.round(width),
                        height: Math.round(height)
                    })
                })
            },

            handleKeydown(e) {
                if (e.key === 'Escape') {
                    window.electronAPI.closeAreaSelector()
                }
            }
        },

        mounted() {
            window.addEventListener('keydown', this.handleKeydown)
        },

        beforeUnmount() {
            window.removeEventListener('keydown', this.handleKeydown)
        }
    }
</script>