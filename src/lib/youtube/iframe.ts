/**
 * Minimal typings + loader for the official YouTube IFrame Player API.
 * The SDK is loaded lazily from https://www.youtube.com/iframe_api.
 */

declare global {
  interface Window {
    YT?: YtPlayerApi
    onYouTubeIframeAPIReady?: () => void
  }
}

export interface YtPlayerEvent {
  target: YtPlayer
  data?: number
}

export interface YtPlayerApi {
  Player: new (
    elementId: string | HTMLElement,
    options: YtPlayerOptions
  ) => YtPlayer
  PlayerState: {
    UNSTARTED: number
    ENDED: number
    PLAYING: number
    PAUSED: number
    BUFFERING: number
    CUED: number
  }
}

export interface YtPlayerOptions {
  videoId?: string
  width?: string | number
  height?: string | number
  playerVars?: {
    autoplay?: 0 | 1
    controls?: 0 | 1
    rel?: 0 | 1
    modestbranding?: 0 | 1
    playsinline?: 0 | 1
    origin?: string
    iv_load_policy?: number
    enablejsapi?: number
  }
  events?: {
    onReady?: (event: YtPlayerEvent) => void
    onStateChange?: (event: YtPlayerEvent) => void
    onError?: (event: YtPlayerEvent) => void
    onPlaybackRateChange?: (event: YtPlayerEvent) => void
    onPlaybackQualityChange?: (event: YtPlayerEvent) => void
  }
}

export interface YtPlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  setVolume: (volume: number) => void
  getVolume: () => number
  getDuration: () => number
  getCurrentTime: () => number
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  loadVideoById: (videoId: string) => void
  cueVideoById: (videoId: string) => void
  destroy: () => void
  getPlayerState: () => number | undefined
  setPlaybackRate: (rate: number) => void
  getPlaybackRate: () => number
}

export type { YtPlayer as IFramePlayer }

let apiPromise: Promise<YtPlayerApi> | null = null
let globalApi: YtPlayerApi | null = null
const pendingQueue: Array<(api: YtPlayerApi) => void> = []

function resolveQueue() {
  if (!globalApi) return
  for (const resolve of pendingQueue.splice(0)) resolve(globalApi)
}

/**
 * Loads the IFrame Player API exactly once and resolves with the global YT
 * namespace. Multiple callers share the same promise.
 */
export function loadYouTubePlayerApi(): Promise<YtPlayerApi> {
  if (globalApi) return Promise.resolve(globalApi)
  if (apiPromise) return apiPromise

  apiPromise = new Promise<YtPlayerApi>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IFrame Player API is only available in the browser.'))
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    )
    if (existingScript) {
      if (window.YT) {
        globalApi = window.YT
        resolve(globalApi)
        return
      }
      pendingQueue.push(resolve)
      return
    }

    const priorHandler = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      priorHandler?.()
      globalApi = window.YT ?? null
      if (globalApi) {
        resolve(globalApi)
        resolveQueue()
      } else {
        reject(new Error('YouTube IFrame API loaded but YT is missing.'))
      }
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => {
      reject(new Error('Failed to load the YouTube IFrame Player API.'))
    }
    document.body.appendChild(script)
  })

  return apiPromise
}

export const PLAYER_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const