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

        <b class="text-20 text-center">
            Программа работает всегда в фоне и получает данные от расширения в браузере
        </b>


        <div class="flex gap-8">
            <div class="w-1/2 flex flex-col gap-8">
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
                        />
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
                        />

                        <div class="flex gap-8">
                            <ui-button class="flex-1" @click="openPrinterSettings()">
                                Свойства принтера
                            </ui-button>
                            <ui-button class="flex-1" @click="print('123.')">
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
                        <b class="flex-1 text-20">Печать шаблонов</b>
                    </template>

                    <template #content>
                        <div class="text-secondary">
                            Вы можете создавать новые и печатать существующие шаблоны этикеток
                        </div>
                        <ui-button appearance="positive" @click="addLabelTemplate()">
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
                templates: {
                    modal: false,
                    newText: null,
                    list: ["П.П.", "В.П."]
                },
                logs: [],
                showLogs: false,
                errorText: null,
                canCloseError: false,
            }
        },

        computed: {
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


            addLabelTemplate() {
                this.templates.newText = null;
                this.templates.modal = true;
            },

            saveTemplate() {
                this.templates.list.push(this.templates.newText);
                this.templates.modal = false;
            },

            loadSaved() {
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
        },

        watch: {
            'label': {
                deep: true,
                async handler(newVal) {
                    localStorage.setItem(
                        'labelSize',
                        JSON.stringify(newVal)
                    )
                    await window.electronAPI.updatePrinterConfig(
                        this.printer.selected,
                        JSON.parse(JSON.stringify(this.label))
                    )
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