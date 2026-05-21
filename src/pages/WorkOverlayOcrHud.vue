<template>
    <div class="flex gap-20" style="-webkit-app-region: drag;">
        <div class="bg-body flex flex-col gap-12 p-20 rounded-32 shadow-[0_0_0_1px_#EE4848_inset]">
            <div class="flex flex-col items-center text-center">
                <b class="text-32">PVZ LABELS</b>
                <div class="font-medium text-20">Идет распознавание текста</div>
            </div>
            <ui-button
                appearance="negative"
                @click="stop()"
                style="-webkit-app-region: no-drag;"
            >
                Остановить
            </ui-button>
        </div>

        <div class="bg-body w-320 flex flex-col items-center justify-center gap-12 rounded-32 shadow-[0_0_0_1px_#828282_inset] overflow-hidden text-center">
            <div class="font-medium text-20">Последний раcпознанный<br>элемент:</div>
            <b class="text-40 w-full text-ellipsis whitespace-nowrap overflow-hidden px-8">{{ lastText || '-' }}</b>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                lastText: null
            }
        },

        methods: {
            stop() {
                if (window.electronAPI && window.electronAPI.stopRecognition) {
                    window.electronAPI.stopRecognition();
                } else {
                    console.error('[OcrHud] stopRecognition not available');
                }
            }
        },

        mounted() {
            if (window.electronAPI && window.electronAPI.onWorkOverlayUpdateText) {
                window.electronAPI.onWorkOverlayUpdateText((text) => {
                    this.lastText = text;
                });
            } else {
                console.error('[OcrHud] electronAPI or onWorkOverlayUpdateText not available');
                alert('ElectronAPI не загрузился. Попробуйте перезапустить распознавание')
            }
        },

        beforeUnmount() {
        }
    }
</script>