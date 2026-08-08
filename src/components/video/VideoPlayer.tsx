'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Tv,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { loadYouTubePlayerApi, PLAYER_STATES, type YtPlayer } from '@/lib/youtube/iframe'
import { usePlayback } from '@/context/PlaybackContext'
import { formatDuration } from '@/lib/utils'
import type { Video } from '@/lib/youtube/types'

const AUTOPLAY_KEY = 'ytCloneAutoplay'
const RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

function loadAutoplayPreference(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem(AUTOPLAY_KEY) !== 'off'
  } catch {
    return true
  }
}

/**
 * Real playback via the official YouTube IFrame Player API:
 * - timeline with click/drag seek, speed menu, theater mode, fullscreen
 * - ambient backdrop tinted by the thumbnail's dominant color
 * - resume from the locally saved position (Continue watching)
 */
export default function VideoPlayer({
  video,
  relatedVideos,
  autoplayChannels,
  playerKey,
  theater,
  onTheaterChange,
}: {
  video: Video
  relatedVideos: Video[]
  autoplayChannels?: Set<string>
  playerKey?: string
  theater?: boolean
  onTheaterChange?: (theater: boolean) => void
}) {
  void playerKey
  void autoplayChannels
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YtPlayer | null>(null)
  const endedRef = useRef(false)
  const startedRef = useRef(false)
  const seekingRef = useRef(false)
  const lastSavedRef = useRef(0)
  const nowRef = useRef(0)
  const durationRef = useRef(0)

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoplay, setAutoplay] = useState(() => loadAutoplayPreference())
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRate] = useState(1)
  const [rateMenuOpen, setRateMenuOpen] = useState(false)
  const [resumeSeconds, setResumeSeconds] = useState<number | null>(null)
  const [backdropColor, setBackdropColor] = useState<string | null>(null)

  const { getPosition, setPosition } = usePlayback()

  const autoplayRef = useRef(autoplay)
  useEffect(() => {
    autoplayRef.current = autoplay
  }, [autoplay])

  // ---------------------------------------------------------------- ambient

  useEffect(() => {
    if (!video.thumbnail) {
      return
    }
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = video.thumbnail
    img.onerror = () => {
      if (!cancelled) setBackdropColor(null)
    }
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 36
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      try {
        ctx.drawImage(img, 0, 0, 64, 36)
        const data = ctx.getImageData(0, 0, 64, 36).data
        let r = 0
        let g = 0
        let b = 0
        let count = 0
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          count++
        }
        if (!cancelled && count > 0) {
          setBackdropColor(
            `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`
          )
        }
      } catch {
        // Canvas tainted — skip the ambient effect.
      }
    }
    return () => {
      cancelled = true
    }
  }, [video.thumbnail])

  // ------------------------------------------------------------ resume state

  const nextVideo = useMemo(() => {
    return relatedVideos.find((candidate) => candidate.id !== video.id) ?? null
  }, [relatedVideos, video.id])

  const goNext = useCallback(() => {
    if (nextVideo) router.push(`/watch/${nextVideo.id}`)
  }, [nextVideo, router])

  // ------------------------------------------------------------------- setup
  useEffect(() => {
    let disposed = false
    let player: YtPlayer | null = null

    const saved = getPosition(video.id)
    endedRef.current = false
    startedRef.current = false
    lastSavedRef.current = 0
    nowRef.current = 0
    durationRef.current = 0

    loadYouTubePlayerApi()
      .then((YT) => {
        if (disposed || !containerRef.current) return
        player = new YT.Player(containerRef.current, {
          videoId: video.id,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            iv_load_policy: 3,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (disposed) return
              playerRef.current = player
              setStatus('ready')
              setIsMuted(player!.isMuted())
              setVolume(player!.getVolume())
              setDuration(player!.getDuration() || 0)
              durationRef.current = player!.getDuration() || 0
              if (saved > 10 && (!durationRef.current || saved < durationRef.current * 0.9)) {
                setResumeSeconds(saved)
              }
            },
            onStateChange: (event) => {
              const state = event.data
              setIsPlaying(state === PLAYER_STATES.PLAYING)
              if (state === PLAYER_STATES.PLAYING) {
                startedRef.current = true
                endedRef.current = false
                setResumeSeconds(null)
              }
              if (state === PLAYER_STATES.ENDED) {
                endedRef.current = true
                setPosition(video.id, 0)
                if (autoplayRef.current && nextVideo) {
                  router.push(`/watch/${nextVideo.id}`)
                } else {
                  setIsPlaying(false)
                }
              }
            },
            onError: () => {
              if (!disposed) setStatus('error')
            },
          },
        })
      })
      .catch(() => {
        if (!disposed) setStatus('error')
      })

    return () => {
      disposed = true
      try {
        player?.destroy()
      } catch {
        // Player may already be destroyed.
      }
      playerRef.current = null
    }
    // The player instance is created once per video id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id])

  // ------------------------------------------------------------- time loop
  useEffect(() => {
    if (status !== 'ready') return
    let raf = 0
    const loop = () => {
      const p = playerRef.current
      if (p) {
        const nowVal = p.getCurrentTime()
        nowRef.current = nowVal
        if (!seekingRef.current) setCurrentTime(nowVal)
        if (startedRef.current && nowVal - lastSavedRef.current >= 5) {
          lastSavedRef.current = nowVal
          setPosition(video.id, Math.floor(nowVal))
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [status, setPosition, video.id])

  function onSeek(value: number) {
    const p = playerRef.current
    if (!p) return
    setCurrentTime(value)
    p.seekTo(value, true)
  }

  function togglePlay() {
    const p = playerRef.current
    if (!p) return
    if (endedRef.current) {
      p.seekTo(0, true)
      p.playVideo()
      return
    }
    if (isPlaying) {
      p.pauseVideo()
    } else {
      p.playVideo()
    }
  }

  function toggleMute() {
    const p = playerRef.current
    if (!p) return
    if (p.isMuted()) {
      p.unMute()
      setIsMuted(false)
    } else {
      p.mute()
      setIsMuted(true)
    }
  }

  function changeVolume(next: number) {
    const p = playerRef.current
    if (!p) return
    p.setVolume(next)
    setVolume(next)
    setIsMuted(p.isMuted())
  }

  function setRateValue(next: number) {
    const p = playerRef.current
    setRate(next)
    setRateMenuOpen(false)
    if (p) p.setPlaybackRate(next)
  }

  function toggleTheater() {
    onTheaterChange?.(!theater)
  }

  function toggleFullscreen() {
    const container = containerRef.current?.parentElement
    if (!container) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void container.requestFullscreen().catch(() => {})
    }
  }

  function toggleAutoplay() {
    const next = !autoplay
    setAutoplay(next)
    try {
      localStorage.setItem(AUTOPLAY_KEY, next ? 'on' : 'off')
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement !== null)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const menuRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!rateMenuOpen) return
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setRateMenuOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setRateMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [rateMenuOpen])

  const controlButton =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80 disabled:opacity-40'

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        {backdropColor && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[-10%] top-[-16%] bottom-[-16%] rounded-full opacity-30 blur-3xl dark:opacity-40"
            style={{ background: `radial-gradient(closest-side, ${backdropColor}, transparent)` }}
          />
        )}
        <div
          ref={containerRef}
          className="group/player relative aspect-video w-full overflow-hidden rounded-2xl bg-black"
          onDoubleClick={toggleFullscreen}
        >
          {status === 'loading' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <Loader className="animate-spin text-white/70" size={40} />
            </div>
          )}
          {status === 'error' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black p-6 text-center text-white">
              <p className="text-sm font-medium">
                This video can&apos;t be played here. It may be private or removed.
              </p>
              <p className="max-w-md text-xs text-white/60">
                The embed was blocked by YouTube. Open it directly on YouTube instead.
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-80"
              >
                Watch on YouTube
              </a>
            </div>
          )}
          {status === 'ready' && !isPlaying && (
            <button
              onClick={togglePlay}
              aria-label="Play"
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur">
                <Play size={32} className="fill-white text-white" />
              </span>
            </button>
          )}
          {status === 'ready' && isPlaying && (
            <button
              onClick={togglePlay}
              aria-label="Pause"
              className="absolute inset-0 z-10 hidden items-center justify-center bg-black/10 transition-opacity group-hover/player:flex"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 opacity-0 backdrop-blur transition-opacity group-hover/player:opacity-100">
                <Pause size={32} className="fill-white text-white" />
              </span>
            </button>
          )}

          {status === 'ready' && (
            <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 pt-12 pb-2.5">
              <input
                type="range"
                min={0}
                max={Math.max(1, Math.floor(duration || 0))}
                step={1}
                value={Math.min(currentTime, duration || 0)}
                onPointerDown={() => {
                  seekingRef.current = true
                }}
                onPointerUp={() => {
                  seekingRef.current = false
                }}
                onChange={(e) => onSeek(Number(e.target.value))}
                aria-label="Seek"
                className="h-1.5 w-full flex-1 cursor-pointer accent-red-600"
              />
              <span className="shrink-0 text-xs font-medium text-white/90 tabular-nums">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex flex-wrap items-center gap-2">
        {resumeSeconds !== null && status === 'ready' && (
          <button
            onClick={() => {
              const p = playerRef.current
              if (!p) return
              p.seekTo(resumeSeconds, true)
              p.playVideo()
              setResumeSeconds(null)
            }}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
          >
            ⏵ Resume from {formatDuration(resumeSeconds)}
          </button>
        )}
        <button
          onClick={togglePlay}
          disabled={status !== 'ready'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={controlButton}
        >
          {isPlaying ? (
            <Pause size={20} className="fill-white" />
          ) : (
            <Play size={20} className="fill-white" />
          )}
        </button>
        <button
          onClick={goNext}
          disabled={!nextVideo}
          aria-label="Play next video"
          title={nextVideo ? `Next: ${nextVideo.title}` : 'No next video'}
          className={controlButton}
        >
          <SkipForward size={20} className="fill-white" />
        </button>
        <div className="flex items-center">
          <button onClick={toggleMute} disabled={status !== 'ready'} aria-label={isMuted ? 'Unmute' : 'Mute'} className={controlButton}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volume"
            className="ml-2 w-24 cursor-pointer accent-white"
          />
        </div>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setRateMenuOpen((o) => !o)}
            aria-label="Playback speed"
            aria-expanded={rateMenuOpen}
            className="flex h-11 shrink-0 items-center rounded-full bg-black/60 px-3.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-black/80"
          >
            {rate}×
          </button>
          {rateMenuOpen && (
            <div className="absolute bottom-12 left-0 z-40 w-32 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              {RATES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRateValue(r)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                    r === rate ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {r}×
                  {r === rate && <span className="text-red-600">●</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggleTheater}
          aria-pressed={theater}
          aria-label="Toggle theater mode"
          className={`${controlButton} ${theater ? 'bg-white text-black' : ''}`}
        >
          <Tv size={20} />
        </button>

        <div className="flex-1" />

        <button
          onClick={toggleAutoplay}
          aria-pressed={autoplay}
          title={autoplay ? 'Autoplay next video is on' : 'Autoplay next video is off'}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            autoplay
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
          }`}
        >
          <RotateCcw size={16} />
          Autoplay {autoplay ? 'on' : 'off'}
        </button>
        <button onClick={toggleFullscreen} aria-label="Toggle fullscreen" className={controlButton}>
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>
    </div>
  )
}