<template>
    <div class="h-screen bg-body flex flex-col gap-8 p-12 overflow-y-auto">

        <transition name="modal">
            <div class="modal" v-if="errorText">
                <div class="modal-container">
                    <div class="flex gap-8 items-center justify-center w-full">
                        <font-awesome-icon
                            icon="fa-solid fa-circle-exclamation"
                            class="text-32 text-palette-negative"
                        />
                        <b class="text-20">Ошибка</b>
                    </div>

                    <div class="text-center" v-html="errorText" />

                    <ui-button v-if="canCloseError" @click="errorText = null">
                        Закрыть
                    </ui-button>
                </div>
            </div>
        </transition>


        <div class="flex justify-between items-center w-full">
            <b class="text-40">PVZ Labels</b>
            <div class="font-medium text-20">v1.1.0</div>
        </div>

        <div class="text-center text-secondary font-medium text-20">
            Автоматическая печать номеров ячеек для ПВЗ
        </div>

        <common-container :border="getBorderStyle(isEnabled)">
            <template #header>
                <b class="flex-1 text-20">Статус</b>
                <b class="text-20 text-palette-positive" v-if="isEnabled">В работе</b>
                <b class="text-20" v-else>Выключено</b>
            </template>

            <template #content>
                <common-animated-content>
                    <ui-button appearance="negative" @click="stopCapture()" v-if="isEnabled">
                        Остановить
                    </ui-button>
                    <ui-button appearance="positive" @click="startRecognition()" v-else>
                        Начать распознавание
                    </ui-button>
                </common-animated-content>
            </template>
        </common-container>


        <common-container :border="getBorderStyle(areaCorrected, true)">
            <template #header>
                <font-awesome-icon
                    icon="fa-solid fa-circle-exclamation"
                    class="text-24 text-palette-negative"
                    v-if="!areaCorrected"
                />
                <font-awesome-icon
                    icon="fa-solid fa-circle-check"
                    class="text-24 text-palette-positive"
                    v-else
                />
                <b class="flex-1 text-20">Область захвата</b>
                <div class="font-medium text-palette-negative" v-if="!areaCorrected">Область не выбрана</div>
            </template>

            <template #content>
                <div class="text-secondary">
                    Область, в которой должно происходить распознавание номера ячейки. После выбора области не рекомендуется изменять размер браузера
                </div>
                <div class="flex gap-8">
                    <ui-button class="flex-1" @click="editArea()" :disabled="isEnabled">
                        Изменить область
                    </ui-button>
                    <ui-button class="flex-1" @click="openPreviewWindow()">
                        Предпросмотр
                    </ui-button>
                </div>
            </template>
        </common-container>


        <common-container :border="getBorderStyle(printerCorrected, true)">
            <template #header>
                <font-awesome-icon
                    icon="fa-solid fa-circle-exclamation"
                    class="text-24 text-palette-negative"
                    v-if="!printerCorrected"
                />
                <font-awesome-icon
                    icon="fa-solid fa-circle-check"
                    class="text-24 text-palette-positive"
                    v-else
                />
                <b class="flex-1 text-20">Принтер</b>
                <div class="font-medium text-palette-negative" v-if="!printerCorrected">Принтер не выбран</div>
            </template>

            <template #content>
                <div class="text-secondary">
                    Программа работает преимущественно с принтерами этикеток. При выборе обычного принтера печать может происходить с ошибками
                </div>

                <ui-select
                    v-model="printer.selected"
                    :values="printer.list"
                    :disabled="isEnabled"
                />

                <div class="flex gap-8">
                    <ui-button class="flex-1" @click="openPrinterSettings()">
                        Свойства принтера
                    </ui-button>
                    <ui-button class="flex-1" @click="testPrint()">
                        Пробная печать
                    </ui-button>
                </div>
                <ui-button class="flex-1" @click="getPrinters()">
                    Обновить список принтеров
                </ui-button>
            </template>
        </common-container>


        <common-container>
            <template #header>
                <b class="flex-1 text-20">Размер этикетки</b>
            </template>

            <template #content>
                <div class="text-secondary">
                    Расположение и размер текста автоматически подстроится под размер этикетки
                </div>
                <div class="flex gap-8">
                    <ui-input
                        class="flex-1"
                        type="number"
                        name="Ширина, мм"
                        v-model="label.width"
                        :extraProps="{
                            'min': 1,
                            'max': 99
                        }"
                        :disabled="isEnabled"
                    />
                    <ui-input
                        class="flex-1"
                        type="number"
                        name="Высота, мм"
                        v-model="label.height"
                        :extraProps="{
                            'min': 1,
                            'max': 99
                        }"
                        :disabled="isEnabled"
                    />
                </div>
                <ui-input
                    class="flex-1"
                    type="number"
                    name="Смещение по горизонтали, мм"
                    desc="Укажите смещение по горизонтали, если текст находится левее/правее центра этикетки"
                    v-model="label.offsetX"
                    :extraProps="{
                        'min': -99,
                        'max': 99
                    }"
                    :disabled="isEnabled"
                />
                <ui-input
                    class="flex-1"
                    type="number"
                    name="Смещение по вертикали, мм"
                    desc="Укажите смещение по вертикали, если текст находится выше/ниже центра этикетки"
                    v-model="label.offsetY"
                    :extraProps="{
                        'min': -99,
                        'max': 99
                    }"
                    :disabled="isEnabled"
                />
            </template>
        </common-container>

        <common-container>
            <template #header>
                <b class="flex-1 text-20">Параметры печати</b>
            </template>

            <template #content>
                <ui-input
                    type="text"
                    name="Разрешенные символы"
                    desc="Символы, которые будут распознаваться. Указываются без пробела, стандартные символы: 0123456789-"
                    v-model="params.symbols"
                    :disabled="isEnabled"
                />
                <ui-input
                    type="number"
                    name="Минимальное количество символов"
                    desc="Количество символов, от которых будет начинаться печать. Рекомендуется указывать минимум 2"
                    v-model="params.min_symbols"
                    :extraProps="{
                        'min': 1,
                        'max': 99
                    }"
                    :disabled="isEnabled"
                />
                <ui-input
                    type="number"
                    name="Интервал опроса экрана, мс"
                    desc="Интервал обновления распознавания экрана в миллисекундах. Чем меньше значение, тем чаще выполняется распознавание и тем выше нагрузка на процессор. Рекомендуемое значение — 300 мс."
                    v-model="params.interval"
                    :extraProps="{
                        'min': 1,
                        'max': 9999
                    }"
                    :disabled="isEnabled"
                />
            </template>
        </common-container>

        <common-container>
            <template #header>
                <b class="flex-1 text-20">История печати</b>
            </template>

            <template #content>
                <div class="text-secondary" v-if="history.length === 0">История пуста</div>
                <template v-else>
                    <ui-button appearance="negative" @click="history = []">
                        Очистить историю
                    </ui-button>
                    <div v-for="i in history">
                        {{ i.time }} — {{ i.text }}
                    </div>
                </template>
            </template>
        </common-container>

        <common-container>
            <template #header>
                <b class="flex-1 text-20">История консоли</b>
            </template>

            <template #content>
                <ui-button @click="showLogs = !showLogs">
                    {{ showLogs ? 'Скрыть историю' : 'Получить историю консоли' }}
                </ui-button>

                <div
                    v-for="(log, index) in logs"
                    :key="index"
                    class="log-item"
                    :class="'log-' + log.type"
                    v-if="showLogs"
                >
                    <div class="font-medium">
                        [{{ log.time }}] {{ log.type.toUpperCase() }}
                    </div>
                    <pre>{{ log.message }}</pre>
                </div>
            </template>
        </common-container>

        <div class="text-center text-secondary font-medium">
            Разработчик — TG: @vopper0
        </div>
    </div>
</template>

<script>
    import Tesseract from 'tesseract.js';
    import UiButton from "@/components/ui/Button.vue";
    // import {ipcRenderer} from "electron";

    export default {
        name: 'Main',
        components: {UiButton},

        data() {
            return {
                isProcessing: false,
                isEnabled: false,
                area: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                },
                printer: {
                    list: [],
                    selected: null
                },
                label: {
                    width: 5,
                    height: 5,
                    offsetX: 0,
                    offsetY: 0
                },
                params: {
                    symbols: '0123456789-',
                    min_symbols: 2,
                    interval: 300
                },
                history: [],
                logs: [],
                showLogs: false,
                errorText: null,
                canCloseError: false,

                lastPrintedText: null,
                recognitionInterval: null,
                stream: null,
                videoElement: null,

                lastFrameCanvas: null,
                captureCanvas: null,
                captureCtx: null
            }
        },

        computed: {
            areaCorrected() {
                return this.area.width > 0 && this.area.height > 0
            },

            printerCorrected() {
                return this.printer.selected !== null
            }
        },

        methods: {
            async editArea() {
                await window.electronAPI.openAreaSelector()

                window.electronAPI.onAreaSelectedOnce((area) => {
                    this.area = area

                    localStorage.setItem(
                        'selectedArea',
                        JSON.stringify(area)
                    )
                })
            },

            async openPrinterSettings() {
                if (!this.printer.selected) {
                    return this.showError("Принтер не выбран", true);
                }
                window.electronAPI.openPrinterSettings(this.printer.selected);
            },

            async testPrint() {
                if (!this.printer.selected) {
                    return this.showError("Выберите принтер", true);
                }

                const result = await window.electronAPI.print(
                    this.printer.selected,
                    this.label.width, this.label.height,
                    this.label.offsetX, this.label.offsetY,
                    "123"
                )
                if (!result) {
                    return this.showError("Ошибка печати", true);
                }
            },

            getBorderStyle(value, onlyNegative = false) {
                if (value && !onlyNegative) {
                    return 'positive'
                } else if (!value) {
                    return 'negative'
                }
            },

            async getPrinters() {
                try {
                    const printers = await window.electronAPI.getPrinters()

                    this.printer.list = printers.map(p => ({
                        value: p.name,
                        label: p.displayName || p.name,
                        isDefault: p.isDefault
                    }))

                    const defaultPrinter = this.printer.list.find(p => p.isDefault)
                    if (defaultPrinter) {
                        this.printer.selected = defaultPrinter.value
                    } else if (this.printer.list.length > 0) {
                        this.printer.selected = this.printer.list[0].value
                    }
                } catch (error) {
                    console.error('Failed to load printers:', error)
                    return this.showError("Не удалось загрузить список принтеров, перезапустите программу.<br>При повторном возникновении ошибки обратитесь к разработчику");
                }
            },

            async startRecognition() {
                if (this.isProcessing) return;

                if (!this.areaCorrected)
                    return this.showError("Выберите область захвата", true);

                if (!this.printerCorrected)
                    return this.showError("Выберите принтер", true);

                if (this.label.width < 5 || this.label.width > 99)
                    return this.showError("Неверная ширина этикетки (5...99)", true);

                if (this.label.height < 5 || this.label.height > 99)
                    return this.showError("Неверная высота этикетки (5...99)", true);

                if (this.label.offsetX < -99 || this.label.offsetX > 99)
                    return this.showError("Неверное смещение текста этикетки по горизонтали (-99...99)", true);

                if (this.label.offsetY < -99 || this.label.offsetY > 99)
                    return this.showError("Неверное смещение текста этикетки по вертикали (-99...99)", true);

                if (!this.params.symbols)
                    return this.showError("Не указаны допустимые символы", true);

                if (this.params.min_symbols < 1 || this.params.min_symbols > 99)
                    return this.showError("Указано недопустимое минимальное количество символов (1...99)", true);

                if (this.params.interval < 1 || this.params.interval > 9999)
                    return this.showError("Указано недопустимый интервал опроса экрана (1...9999)", true);


                this.isEnabled = true;
                this.lastPrintedText = null;
                window.electronAPI.showBannerOverlay()
                await this.initCapture();
            },

            showError(text, canClose = false) {
                this.canCloseError = canClose;
                this.errorText = text;
            },

            async initCapture() {
                try {
                    const { sourceId } = await window.electronAPI.startScreenCapture();

                    this.stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: sourceId,
                            }
                        }
                    });

                    this.videoElement = document.createElement('video');
                    this.videoElement.srcObject = this.stream;
                    await this.videoElement.play();
                    this.isProcessing = false;

                    this.runOCRLoop();

                } catch (err) {
                    console.error("Error starting capture:", err);
                    this.showError(`Не удалось запустить захват экрана.<br>${err.message}`, true);
                    this.isProcessing = false;
                }
            },

            async stopCapture() {
                this.isEnabled = false;
                this.isProcessing = false;
                window.electronAPI.hideBannerOverlay()

                if (this.recognitionInterval) {
                    clearTimeout(this.recognitionInterval);
                    this.recognitionInterval = null;
                }

                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                    this.stream = null;
                }

                if (this.videoElement) {
                    this.videoElement.pause();
                    this.videoElement.srcObject = null;
                    this.videoElement = null;
                }
            },

            async runOCRLoop() {
                if (!this.isEnabled || !this.videoElement) return;
                await new Promise(r => setTimeout(r, 100));

                try {
                    const canvas = this.captureCanvas;
                    const ctx = this.captureCtx;

                    const { x, y, width, height } = this.area;
                    canvas.width = width;
                    canvas.height = height;

                    this.lastFrameCanvas = canvas;
                    ctx.filter = 'grayscale(1) contrast(3) brightness(1.2)';
                    ctx.drawImage(
                        this.videoElement,
                        x,
                        y,
                        width,
                        height,
                        0,
                        0,
                        width,
                        height
                    );
                    ctx.filter = 'none';

                    const { data: { text } } = await this.worker.recognize(canvas);

                    const allowed = this.params.symbols
                    const escaped = allowed.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
                    const cleanText = text
                        .replace(new RegExp(`[^${escaped}]`, 'g'), '')
                        .trim()

                    if (cleanText.length >= this.params.min_symbols) {
                        console.log(`[OCR] Found: ${cleanText} | Last: ${this.lastPrintedText}`);

                        if (cleanText !== this.lastPrintedText) {
                            console.log(`[OCR] Printing new label ${cleanText}`);
                            await this.printLabel(cleanText);
                            this.lastPrintedText = cleanText;

                            this.history.unshift({
                                text: cleanText,
                                time: new Date().toLocaleTimeString()
                            });
                            if (this.history.length > 100) this.history.pop();
                        }
                    }

                } catch (e) {
                    console.error('[OCR] Error:', e);
                } finally {
                    if (this.isEnabled) {
                        this.recognitionInterval = setTimeout(() => this.runOCRLoop(), this.params.interval);
                    }
                }
            },

            async printLabel(text) {
                const result = await window.electronAPI.print(
                    this.printer.selected,
                    this.label.width, this.label.height,
                    this.label.offsetX, this.label.offsetY,
                    text
                );

                if (!result || !result.success) {
                    console.error('[Printer] Print failed:', result?.error);
                }
            },

            async openPreviewWindow() {
                if (!this.lastFrameCanvas || !this.isEnabled) {
                    return this.showError("Захват экрана не начат", true);
                }

                const base64 = this.lastFrameCanvas.toDataURL('image/png');
                window.electronAPI.openPreviewWindow(base64);
            },

            addLog(type, ...args) {
                const message = args.map(arg => {
                    if (typeof arg === 'object') {
                        try {
                            return JSON.stringify(arg, null, 2)
                        } catch {
                            return '[object ' + arg + ']'
                        }
                    }

                    return String(arg)
                }).join(' ')

                this.logs.unshift({
                    type,
                    message,
                    time: new Date().toLocaleTimeString()
                })

                if (this.logs.length > 500) {
                    this.logs.pop()
                }
            }
        },

        async mounted() {
            const originalLog = console.log
            const originalError = console.error
            const originalWarn = console.warn

            console.log = (...args) => {
                this.addLog('log', ...args)
                originalLog(...args)
            }

            console.error = (...args) => {
                this.addLog('error', ...args)
                originalError(...args)
            }

            console.warn = (...args) => {
                this.addLog('warn', ...args)
                originalWarn(...args)
            }

            if (!window.electronAPI) {
                console.error('Electron API not available')
                return this.showError("Не удалось загрузить API, перезапустите программу<br>При повторном возникновении ошибки обратитесь к разработчику")
            }

            await this.getPrinters()

            const savedArea = localStorage.getItem('selectedArea')
            if (savedArea) {
                try {
                    this.area = JSON.parse(savedArea)
                } catch(e) {
                    console.error('Failed to load saved area', e)
                    localStorage.removeItem('selectedArea')
                }
            }

            const savedLabel = localStorage.getItem('labelSize')
            if (savedLabel) {
                try {
                    const parsedLabel = JSON.parse(savedLabel)
                    this.label = { ...this.label, ...parsedLabel }
                } catch(e) {
                    console.error('Failed to load saved label size', e)
                    localStorage.removeItem('labelSize')
                }
            }

            const savedParams = localStorage.getItem('printParams')
            if (savedParams) {
                try {
                    const parsedParams = JSON.parse(savedParams)
                    this.params = { ...this.params, ...parsedParams }
                } catch(e) {
                    console.error('Failed to load saved params', e)
                    localStorage.removeItem('printParams')
                }
            }

            this.captureCanvas = document.createElement('canvas');
            this.captureCtx = this.captureCanvas.getContext('2d');
            if (!this.captureCtx) {
                return this.showError("Не удалось создать canvas context<br>При повторном возникновении ошибки обратитесь к разработчику");
            }

            this.worker = await Tesseract.createWorker('eng');
            await this.worker.setParameters({
                tessedit_char_whitelist: this.params.symbols,
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE
            });
        },

        async beforeUnmount() {
            await this.stopCapture();

            if (this.worker) {
                await this.worker.terminate();
            }
        },

        watch: {
            'label': {
                deep: true,
                handler(newVal) {
                    localStorage.setItem('labelSize', JSON.stringify(newVal))
                }
            },

            'params': {
                deep: true,
                handler(newVal) {
                    localStorage.setItem(
                        'printParams',
                        JSON.stringify(newVal)
                    )
                }
            },

            'params.symbols': async function(newVal) {
                if (this.worker) {
                    await this.worker.setParameters({
                        tessedit_char_whitelist: newVal
                    });
                }
            }
        },
    }
</script>

<style scoped>
    .modal-enter-active,
    .modal-leave-active,
    .modal-enter-to,
    .modal-leave-from {
        transition: all .3s ease;
    }

    .modal-enter-from,
    .modal-leave-to {
        opacity: 0;
        backdrop-filter: blur(0px);
    }

    .modal-enter-to,
    .modal-leave-from {
        opacity: 1;
        backdrop-filter: blur(8px);
    }

    .modal-enter-from .modal-container,
    .modal-leave-to .modal-container {
        transition: all .3s ease;
        opacity: 0;
        transform: scale(0.7);
    }

    .modal-enter-to .modal-container,
    .modal-leave-from .modal-container {
        transition: all .3s ease;
        opacity: 1;
        transform: scale(1);
    }

    .modal {
        z-index: 99;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, .7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-container {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border-radius: 32px;
        background: var(--color-bg-secondary);
        max-height: 90vh;
        overflow: hidden;
        width: 400px;
    }

    .log-item {
        padding: 8px;
        border-radius: 12px;

        font-size: 14px;
        overflow-x: auto;
    }

    .log-item pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
    }

    .log-log {
        background: rgba(255,255,255,.05);
    }

    .log-warn {
        background: rgba(255,180,0,.1);
    }

    .log-error {
        background: rgba(255,0,0,.1);
    }
</style>