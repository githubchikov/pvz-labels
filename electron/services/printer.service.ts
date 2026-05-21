import {LabelConfig} from '../types/printer'


export function getLabelHtml(label: LabelConfig, text: string): string {
    const isRotated = label.width < label.height;

    const rotateCss = isRotated
        ? 'rotate(-90deg)'
        : 'none'

    const escapedText = text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });

    return `
        <!DOCTYPE html>
        <html lang="ru">
            <head>
                <style>
                    @page {
                        size: ${label.width}mm ${label.height}mm;
                        margin: 0;
                    }
                    html,
                    body {
                        margin: 0;
                        padding: 0;
                        width: ${label.width}mm;
                        height: ${label.height}mm;
                        background: white;
                        overflow: hidden;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .label-text {
                        font-family: Arial, sans-serif;
                        font-weight: bold;
                        color: black;
                        text-align: center;
                        line-height: 1;
                        transform: ${rotateCss};
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="label-text">${escapedText}</div>

                <script>
                    window.onload = () => {
                        const text = document.querySelector('.label-text');
                        const container = document.body;
                
                        let fontSize = 120;
                
                        function applySize(size) {
                            text.style.fontSize = size + 'px';
                        }
                
                        function fits() {
                            return (
                                text.scrollWidth <= container.clientWidth - 4 &&
                                text.scrollHeight <= container.clientHeight - 4
                            );
                        }
                
                        applySize(fontSize);
                
                        while (!fits() && fontSize > 4) {
                            fontSize -= 1;
                            applySize(fontSize);
                        }
                    };
                </script>
            </body>
        </html>
    `;
}

export function getPageSize(label: LabelConfig) {
    return {
        width: (Number(label.width) + Number(label.offsetX)) * 1000,
        height: (Number(label.height) + Number(label.offsetY)) * 1000
    }
}