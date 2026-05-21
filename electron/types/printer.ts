export type Result = | {
    success: true
} | {
    success: false
    error: string
}

export type LabelConfig = {
    width: number
    height: number
    offsetX: number
    offsetY: number
}