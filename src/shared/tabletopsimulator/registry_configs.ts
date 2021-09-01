
export interface ConfigGame {
    Portaits: boolean
    Scripting: boolean
    Snapping: boolean

    ConfigCamera: {
        LookSpeed: number //float
        InvertVertical: boolean
        InvertHorizontal: boolean
        MovementSpeed: number //float
        FOV: number
    },
    ConfigMods: {
        Caching: boolean
        RawCaching: boolean
        Location: boolean
        Threading: boolean
    },
}