<template>
    <div class="h-screen bg-body flex flex-col gap-8 p-12 overflow-y-auto">
        <div class="z-2 flex items-center justify-center absolute inset-0 bg-[rgba(0,0,0,.7)] backdrop-blur-[8px]" v-if="errorText">
            <div class="flex flex-col gap-8 items-center w-400 rounded-32 bg-secondary p-12">
                <div class="flex gap-8 items-center">
                    <font-awesome-icon
                        icon="fa-solid fa-circle-exclamation"
                        class="text-32 text-palette-negative"
                    />
                    <b class="text-20">Ошибка</b>
                </div>

                <div class="text-center" v-html="errorText" />

                <ui-button v-if="canCloseError" @click="errorText = null" class="w-full">
                    Закрыть
                </ui-button>
            </div>
        </div>


        <div class="flex justify-between items-center w-full">
            <b class="text-40">
                PVZ Labels
            </b>
            <div class="font-medium text-20">
                v1.0.0
            </div>
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
                <ui-button appearance="negative" @click="stopCapture()" v-if="isEnabled">
                    Остановить
                </ui-button>
                <ui-button appearance="positive" @click="startRecognition()" v-else>
                    Начать распознавание
                </ui-button>
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
                            'max': 999
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
                            'max': 999
                        }"
                        :disabled="isEnabled"
                    />
                </div>
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

        <div class="text-center text-secondary font-medium">
            Разработчик — TG: @vopper0
        </div>
    </div>
</template>

<script>
    import Tesseract from 'tesseract.js';
    import UiButton from "@/components/ui/Button.vue";

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
                    height: 5
                },
                params: {
                    symbols: '0123456789-',
                    min_symbols: 2,
                    interval: 300
                },
                history: [],
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

                window.electronAPI.onAreaSelected((area) => {
                    this.area = area

                    localStorage.setItem(
                        'selectedArea',
                        JSON.stringify(area)
                    )
                })
            },

            async openPrinterSettings() {
                if (!this.printer.selected) {
                    this.errorText = "Принтер не выбран";
                    this.canCloseError = true;
                    return;
                }
                window.electronAPI.openPrinterSettings(this.printer.selected);
            },

            async testPrint() {
                if (!this.printer.selected) {
                    this.errorText = "Выберите принтер"
                    this.canCloseError = true
                    return
                }

                const result = await window.electronAPI.print(this.printer.selected, this.label.width, this.label.height, "123")
                if (!result) {
                    this.errorText = "Ошибка печати"
                    this.canCloseError = true
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
                    console.log(printers)

                    const filtered = printers.filter(p => {
                        const name = (p.name || '').toLowerCase()
                        return !name.includes('pdf') &&
                            !name.includes('microsoft print') &&
                            !name.includes('xps')
                    })

                    this.printer.list = filtered.map(p => ({
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
                    this.errorText = "Не удалось загрузить список принтеров, перезапустите программу.<br>При повторном возникновении ошибки обратитесь к разработчику"
                    this.canCloseError = false
                }
            },


            async startRecognition() {
                if (this.isProcessing) return;

                if (!this.areaCorrected) {
                    this.errorText = "Выберите область захвата"
                    this.canCloseError = true
                    return;
                }

                if (!this.printerCorrected) {
                    this.errorText = "Выберите принтер"
                    this.canCloseError = true
                    return
                }

                if (!this.label.width || this.label.width <= 5 || this.label.width > 999) {
                    this.errorText = "Неверная ширина этикетки (5...999)"
                    this.canCloseError = true
                    return
                }

                if (!this.label.height || this.label.height <= 5 || this.label.height > 999) {
                    this.errorText = "Неверная высота этикетки (5...999)"
                    this.canCloseError = true
                    return
                }

                if (!this.params.symbols) {
                    this.errorText = "Не указаны допустимые символы"
                    this.canCloseError = true
                    return
                }

                if (this.params.min_symbols <= 0 || this.params.min_symbols > 99) {
                    this.errorText = "Указано недопустимое минимальное количество символов (1...99)"
                    this.canCloseError = true
                    return
                }

                if (this.params.interval <= 0 || this.params.interval > 9999) {
                    this.errorText = "Указано недопустимый интервал опроса экрана (1...9999)"
                    this.canCloseError = true
                    return
                }

                this.isEnabled = true;
                this.lastPrintedText = null;
                window.electronAPI.showBannerOverlay()
                await this.initCapture();
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

                    this.errorText = `Не удалось запустить захват экрана.<br>${err.message}`;

                    this.canCloseError = true;
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
                const w = Number(this.label.width);
                const h = Number(this.label.height);

                const result = await window.electronAPI.print(
                    this.printer.selected, w, h, text
                );

                if (!result || !result.success) {
                    console.error('[Printer] Print failed:', result?.error);
                }
            },

            async openPreviewWindow() {
                if (!this.lastFrameCanvas || !this.isEnabled) {
                    this.errorText = "Захват экрана не начат";
                    this.canCloseError = true;
                    return;
                }

                const base64 = this.lastFrameCanvas.toDataURL('image/png');
                window.electronAPI.openPreviewWindow(base64);
            }
        },

        async mounted() {
            if (!window.electronAPI) {
                console.error('Electron API not available')
                this.errorText = "Не удалось загрузить API, перезапустите программу<br>При повторном возникновении ошибки обратитесь к разработчику"
                this.canCloseError = false
                return
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

            this.captureCanvas = document.createElement('canvas');
            this.captureCtx = this.captureCanvas.getContext('2d');

            this.worker = await Tesseract.createWorker('eng');
            await this.worker.setParameters({
                tessedit_char_whitelist: this.params.symbols,
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
            }
        },
    }
</script>