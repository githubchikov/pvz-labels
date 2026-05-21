<template>
    <div class="h-screen bg-body flex flex-col gap-8 p-12 overflow-y-auto">


        <transition name="modal">
            <div class="modal" v-if="errorText">
                <div class="modal-container">
                    <div class="flex flex-col gap-8 items-center justify-center w-full">
                        <font-awesome-icon
                            icon="fa-solid fa-circle-exclamation"
                            class="text-60 text-palette-negative"
                        />
                        <b class="text-24">Ошибка</b>
                    </div>

                    <div class="text-center" v-html="errorText" />

                    <ui-button v-if="canCloseError" @click="errorText = null">
                        Закрыть
                    </ui-button>
                </div>
            </div>

            <div class="modal" v-else-if="templates.modal">
                <div class="modal-container">
                    <b class="text-center text-24">Добавление шаблона</b>

                    <ui-input
                        v-model="templates.newText"
                        name="Текст шаблона"
                    />

                    <div class="flex flex-col gap-8">
                        <ui-button appearance="positive" @click="saveTemplate()">
                            Сохранить
                        </ui-button>
                        <ui-button @click="templates.modal = false">
                            Закрыть
                        </ui-button>
                    </div>
                </div>
            </div>
        </transition>


        <div class="flex items-center w-full gap-8">
            <b class="text-40">PVZ Labels</b>
            <div class="font-medium text-20 text-secondary">v2.0.0</div>
            <div class="flex-1 text-right font-medium text-20">
                Автоматическая печать номеров ячеек для ПВЗ
            </div>
        </div>


        <common-container :border="getBorderStyle(ocr.isEnabled)">
            <template #header>
                <b class="flex-1 text-32">Статус</b>
                <b class="text-32 text-palette-positive" v-if="ocr.isEnabled">В работе</b>
                <b class="text-32" v-else>Выключено</b>
            </template>

            <template #content>
                <common-animated-content>
                    <ui-button appearance="negative" @click="stopRecognition()" v-if="ocr.isEnabled">
                        Остановить
                    </ui-button>
                    <ui-button appearance="positive" @click="startRecognition()" v-else>
                        Начать распознавание
                    </ui-button>
                </common-animated-content>
            </template>
        </common-container>


        <div class="flex gap-8">
            <div class="w-1/2 flex flex-col gap-8">
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
                            Область, в которой должно происходить распознавание номера ячейки. После выбора области не рекомендуется изменять масштаб браузера
                        </div>
                        <div class="flex gap-8">
                            <ui-button class="flex-1" @click="editArea()" :disabled="ocr.isEnabled">
                                Изменить область
                            </ui-button>
                            <ui-button class="flex-1" @click="openPreviewWindow()">
                                Предпросмотр
                            </ui-button>
                        </div>
                    </template>
                </common-container>


                <common-container>
                    <template #header>
                        <b class="flex-1 text-20">Размер этикетки</b>
                    </template>

                    <template #content>
                        <div class="text-secondary">
                            Расположение и размер текста автоматически подстроятся под размер этикетки
                        </div>
                        <div class="flex gap-8">
                            <ui-input
                                class="flex-1"
                                type="number"
                                name="Ширина, мм"
                                v-model="label.width"
                                :extraProps="{
                                    'min': 10,
                                    'max': 99
                                }"
                            />
                            <ui-input
                                class="flex-1"
                                type="number"
                                name="Высота, мм"
                                v-model="label.height"
                                :extraProps="{
                                    'min': 10,
                                    'max': 99
                                }"
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
                            :disabled="ocr.isEnabled"
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
                            :disabled="ocr.isEnabled"
                        />
                    </template>
                </common-container>


                <common-container>
                    <template #header>
                        <b class="flex-1 text-20">Печать шаблонов</b>
                    </template>

                    <template #content>
                        <div class="text-secondary">
                            Вы можете создавать новые и печатать существующие шаблоны этикеток
                        </div>
                        <ui-button appearance="positive" @click="addTicketTemplate()">
                            Создать шаблон
                        </ui-button>

                        <ui-button
                            v-for="template in templates.list"
                            @click="print(template)"
                        >
                            {{ template }}
                        </ui-button>
                    </template>
                </common-container>


                <common-container>
                    <template #header>
                        <b class="flex-1 text-20">Консоль</b>
                    </template>

                    <template #content>
                        <ui-button @click="showLogs = !showLogs">
                            {{ showLogs ? 'Скрыть' : 'Показать' }}
                        </ui-button>

                        <div
                            v-for="(log, index) in logs"
                            :key="index"
                            class="flex flex-col gap-4 p-8 rounded-12"
                            :class="'log-' + log.type"
                            v-if="showLogs"
                        >
                            <div class="flex justify-between ">
                                <div class="font-medium">{{ log.type.toUpperCase() }}</div>
                                <div class="font-medium">{{ log.time }}</div>
                            </div>
                            <pre v-html="log.message" />
                        </div>
                    </template>
                </common-container>
            </div>


            <div class="w-1/2 flex flex-col gap-8">
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
                            Рекомендуется использовать термопринтер для более быстрой печати
                        </div>

                        <ui-select
                            v-model="printer.selected"
                            :values="printer.list"
                            :disabled="ocr.isEnabled"
                        />

                        <div class="flex gap-8">
                            <ui-button class="flex-1" @click="openPrinterSettings()">
                                Свойства принтера
                            </ui-button>
                            <ui-button class="flex-1" @click="print('123')">
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
                        <b class="flex-1 text-20">Параметры печати</b>
                    </template>

                    <template #content>
                        <ui-input
                            type="text"
                            name="Разрешенные символы"
                            desc="Символы, которые будут распознаваться. Указываются без пробела, стандартные символы: 0123456789-"
                            v-model="params.symbols"
                            :disabled="ocr.isEnabled"
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
                        />
                        <ui-input
                            type="number"
                            name="Интервал опроса экрана, мс"
                            desc="Интервал обновления распознавания экрана в миллисекундах. Чем меньше значение, тем чаще выполняется распознавание и тем выше нагрузка на процессор. Рекомендуемое значение — 300 мс"
                            v-model="params.interval"
                            :extraProps="{
                                'min': 1,
                                'max': 9999
                            }"
                        />
                    </template>
                </common-container>


                <common-container>
                    <template #header>
                        <b class="flex-1 text-20">История распознавания</b>
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
            </div>
        </div>
    </div>
</template>

<script>
    import Tesseract from 'tesseract.js';

    export default {
        name: 'Main',

        data() {
            return {
                ocr: {
                    isProcessing: false,
                    isEnabled: false,
                    captureCanvas: null,
                    captureCtx: null,
                    videoElement: null,
                    stream: null,
                    recognitionInterval: null,
                    previousImageData: null,
                    lastFrameCanvas: null,
                    lastPrintedText: null,
                },

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
                    width: 10,
                    height: 10,
                    offsetX: 0,
                    offsetY: 0
                },
                params: {
                    symbols: '0123456789-',
                    min_symbols: 2,
                    interval: 300
                },
                templates: {
                    modal: false,
                    newText: null,
                    list: ["П.П.", "В.П."]
                },
                history: [],
                logs: [],
                showLogs: false,
                errorText: null,
                canCloseError: false,
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
            getBorderStyle(value, onlyNegative = false) {
                if (value && !onlyNegative) {
                    return 'positive'
                } else if (!value) {
                    return 'negative'
                }
            },

            showError(text, canClose = false) {
                this.canCloseError = canClose;
                this.errorText = text;
            },

            addLog(type, ...args) {
                const message = args.map(arg => {
                    if (typeof arg === 'object') {
                        try {
                            return JSON.stringify(arg, null, 2)
                        } catch {
                            return '[object]'
                        }
                    }

                    return String(arg)
                }).join(' ')

                this.logs.unshift({
                    type,
                    message,
                    time: new Date().toLocaleTimeString()
                })

                if (this.logs.length > 100) {
                    this.logs.pop()
                }
            },


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


            async getPrinters() {
                try {
                    const printers = await window.electronAPI.getPrinters()
                    this.printer.list = printers.map(p => ({
                        value: p.name,
                        label: p.displayName || p.name,
                        isDefault: p.isDefault
                    }))

                    const savedPrinter = localStorage.getItem('selectedPrinter')

                    if (savedPrinter) {
                        try {
                            const parsedPrinter = JSON.parse(savedPrinter)
                            const printerExists = this.printer.list.some(
                                printer => printer.value === parsedPrinter
                            )

                            if (printerExists) {
                                this.printer.selected = parsedPrinter
                                return
                            }

                            localStorage.removeItem('selectedPrinter')
                        } catch (e) {
                            console.error(
                                '[Printers] Failed to parse saved printer:',
                                e
                            )
                            localStorage.removeItem('selectedPrinter')
                        }
                    }

                    const defaultPrinter = this.printer.list.find(
                        printer => printer.isDefault
                    )

                    if (defaultPrinter) {
                        this.printer.selected = defaultPrinter.value
                    } else if (this.printer.list.length > 0) {
                        this.printer.selected = this.printer.list[0].value
                    }
                } catch (error) {
                    console.error('[Printers] Failed to get printers:', error)
                    return this.showError(
                        'Не удалось загрузить список принтеров, попробуйте перезапустить программу.<br>При повторном возникновении ошибки обратитесь к разработчику'
                    )
                }
            },

            async openPrinterSettings() {
                if (!this.printer.selected) {
                    return this.showError("Принтер не выбран", true);
                }

                await window.electronAPI.openPrinterSettings(this.printer.selected);
            },

            async print(text) {
                if (!this.printer.selected) {
                    await this.stopRecognition();
                    return this.showError("Принтер не выбран", true);
                }

                const result = await window.electronAPI.print(
                    this.printer.selected,
                    { ...this.label },
                    text
                );

                if (!result) {
                    await this.stopRecognition();
                    console.error('[PRINTER] Ошибка печати:', result?.error || 'неизвестная ошибка');
                    return this.showError("Ошибка печати, подробности в консоли", true);
                }
            },


            async startRecognition() {
                if (this.ocr.isProcessing) return;

                if (!this.areaCorrected)
                    return this.showError("Выберите область захвата", true);

                if (!this.printerCorrected)
                    return this.showError("Выберите принтер", true);

                if (this.label.width < 10 || this.label.width > 99)
                    return this.showError("Неверная ширина этикетки (10...99)", true);

                if (this.label.height < 10 || this.label.height > 99)
                    return this.showError("Неверная высота этикетки (10...99)", true);

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


                this.ocr.isEnabled = true;
                this.ocr.lastPrintedText = null;

                window.electronAPI.showWorkOverlayWindow({ ...this.area })

                await this.initCapture();
            },

            async initCapture() {
                this.ocr.isProcessing = true;

                try {
                    const { sourceId } = await window.electronAPI.getScreenRecognitionSource();

                    this.ocr.stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: sourceId,
                            }
                        }
                    });

                    this.ocr.videoElement = document.createElement('video');
                    this.ocr.videoElement.srcObject = this.ocr.stream;
                    await this.ocr.videoElement.play();

                    this.ocr.isProcessing = false;
                    await this.runOCRLoop();
                } catch (err) {
                    console.error("Error starting capture:", err);
                    this.showError(`Не удалось запустить захват экрана.<br>${err.message}`, true);
                    this.ocr.isProcessing = false;
                }
            },

            async runOCRLoop() {
                if (!this.ocr.isEnabled || !this.ocr.videoElement) {
                    return
                }

                try {
                    const canvas = this.ocr.captureCanvas
                    const ctx = this.ocr.captureCtx

                    const { x, y, width, height } = this.area

                    const scale = 2

                    if (
                        canvas.width !== width * scale ||
                        canvas.height !== height * scale
                    ) {
                        canvas.width = width * scale
                        canvas.height = height * scale
                    }

                    ctx.clearRect(0, 0, canvas.width, canvas.height)

                    ctx.drawImage(
                        this.ocr.videoElement,
                        x,
                        y,
                        width,
                        height,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    )

                    const imageData = ctx.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    )

                    const data = imageData.data

                    for (let i = 0; i < data.length; i += 4) {
                        const gray =
                            data[i] * 0.299 +
                            data[i + 1] * 0.587 +
                            data[i + 2] * 0.114

                        const value = gray > 140 ? 255 : 0

                        data[i] = value
                        data[i + 1] = value
                        data[i + 2] = value
                    }

                    ctx.putImageData(imageData, 0, 0)

                    this.ocr.lastFrameCanvas = canvas

                    if (
                        this.ocr.previousImageData &&
                        this.framesAreEqual(
                            imageData,
                            this.ocr.previousImageData
                        )
                    ) {
                        return
                    }

                    this.ocr.previousImageData = imageData

                    const {
                        data: { text }
                    } = await this.ocr.worker.recognize(canvas)

                    const allowed = this.params.symbols

                    const escaped = allowed.replace(
                        /[-[\]/{}()*+?.\\^$|]/g,
                        '\\$&'
                    )

                    const cleanText = text
                        .replace(new RegExp(`[^${escaped}]`, 'g'), '')
                        .trim()

                    const isValidText =
                        cleanText.length >= this.params.min_symbols

                    const isNewText =
                        cleanText !== this.ocr.lastPrintedText

                    if (isValidText && isNewText) {
                        console.log(
                            '[OCR] New text detected:',
                            cleanText
                        )

                        await this.print(cleanText + ".")

                        this.ocr.lastPrintedText = cleanText
                        window.electronAPI.updateWorkOverlayText(text)

                        this.history.unshift({
                            text: cleanText,
                            time: new Date().toLocaleTimeString()
                        })

                        if (this.history.length > 100) {
                            this.history.pop()
                        }
                    }

                } catch (e) {
                    console.error('[OCR] Recognition error:', e)
                } finally {
                    this.scheduleNextOCR()
                }
            },

            scheduleNextOCR() {
                if (!this.ocr.isEnabled) return
                this.ocr.recognitionInterval = setTimeout( () => this.runOCRLoop(), this.params.interval )
            },

            framesAreEqual(current, previous) {
                if (!previous) return false

                const currentData = current.data
                const previousData = previous.data

                const step = 32

                for (let i = 0; i < currentData.length; i += step) {
                    if (currentData[i] !== previousData[i]) {
                        return false
                    }
                }

                return true
            },

            async stopRecognition() {
                if (!this.ocr.isEnabled && !this.ocr.isProcessing) return;

                this.ocr.isEnabled = false;
                this.ocr.isProcessing = false;

                window.electronAPI.hideWorkOverlayWindow()

                if (this.ocr.recognitionInterval) {
                    clearTimeout(this.ocr.recognitionInterval);
                    this.ocr.recognitionInterval = null;
                }

                if (this.ocr.stream) {
                    this.ocr.stream.getTracks().forEach(track => track.stop());
                    this.ocr.stream = null;
                }

                if (this.ocr.videoElement) {
                    this.ocr.videoElement.pause();
                    this.ocr.videoElement.srcObject = null;
                    this.ocr.videoElement = null;
                }
            },


            async openPreviewWindow() {
                if (!this.ocr.lastFrameCanvas || !this.ocr.isEnabled) {
                    return this.showError("Предпросмотр доступен только во время распознавания текста", true);
                }

                const base64 = this.ocr.lastFrameCanvas.toDataURL('image/png');
                window.electronAPI.openPreviewWindow(base64);
            },


            addTicketTemplate() {
                this.templates.newText = null;
                this.templates.modal = true;
            },

            saveTemplate() {
                this.templates.list.push(this.templates.newText);
                this.templates.modal = false;
            },

            loadSaved() {
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

                const savedPrinter = localStorage.getItem('selectedPrinter')

                if (savedPrinter) {
                    try {
                        const parsedPrinter = JSON.parse(savedPrinter)
                        const printerExists = this.printer.list.some(
                            printer => printer.value === parsedPrinter
                        )

                        if (printerExists) {
                            this.printer.selected = parsedPrinter
                        } else {
                            console.warn(
                                `[PRINTER] Saved printer not found: ${parsedPrinter}`
                            )
                            localStorage.removeItem('selectedPrinter')
                        }
                    } catch (e) {
                        console.error('Failed to load saved printer', e)
                        localStorage.removeItem('selectedPrinter')
                    }
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
                return this.showError("Не удалось загрузить API, попробуйте перезапустить программу<br>При повторном возникновении ошибки обратитесь к разработчику")
            }

            await this.getPrinters();
            this.loadSaved();

            if (window.electronAPI.onStopRecognition) {
                window.electronAPI.onStopRecognition(() => {
                    this.stopRecognition();
                });
            }

            this.ocr.captureCanvas = document.createElement('canvas');
            this.ocr.captureCtx = this.ocr.captureCanvas.getContext('2d', {
                willReadFrequently: true
            })
            if (!this.ocr.captureCtx) {
                return this.showError("Не удалось создать canvas context<br>При повторном возникновении ошибки обратитесь к разработчику");
            }

            this.ocr.worker = await Tesseract.createWorker('eng', Tesseract.OEM.LSTM_ONLY, {
                load_system_dawg: '0',
                load_freq_dawg: '0',
            });
            await this.ocr.worker.setParameters({
                tessedit_char_whitelist: this.params.symbols,
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
                preserve_interword_spaces: '1',
                user_defined_dpi: '300',
            });
        },

        async beforeUnmount() {
            await this.stopRecognition();

            if (this.ocr.worker) {
                await this.ocr.worker.terminate();
            }
        },

        watch: {
            'label': {
                deep: true,
                handler(newVal) {
                    localStorage.setItem(
                        'labelSize',
                        JSON.stringify(newVal)
                    )
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
                if (this.ocr.worker) {
                    await this.ocr.worker.setParameters({
                        tessedit_char_whitelist: newVal
                    });
                }
            },

            'printer.selected'(newValue) {
                localStorage.setItem(
                    'selectedPrinter',
                    JSON.stringify(newValue)
                )
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
        padding: 16px;
        border-radius: 32px;
        background: var(--color-bg-secondary);
        max-height: 90vh;
        overflow: hidden;
        width: 400px;
    }

    .log-log {
        background: var(--color-bg-tertiary);
    }

    .log-warn {
        background: rgba(244, 244, 35, .5);
    }

    .log-error {
        background: rgba(240, 49, 49, .5);
    }
</style>