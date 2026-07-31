import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { mockVideos, type Video } from "@/lib/data/mockVideos"

const PAGE_SIZE = 8

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface VideoState {
  videos: Video[]
  currentVideo: Video | null
  relatedVideos: Video[]
  loading: boolean
  page: number
}

const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  relatedVideos: [],
  loading: false,
  page: 1,
}

export const fetchVideos = createAsyncThunk("videos/fetchVideos", async (page: number) => {
  await delay(500)
  const start = (page - 1) * PAGE_SIZE
  return mockVideos.slice(start, start + PAGE_SIZE)
})

const videoSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<string>) => {
      state.currentVideo = mockVideos.find((v) => v.id === action.payload) ?? null
      if (state.currentVideo) {
        const { categoryId, tags } = state.currentVideo
        state.relatedVideos = mockVideos
          .filter(
            (v) =>
              v.id !== state.currentVideo?.id &&
              (v.categoryId === categoryId || v.tags.some((t) => tags.includes(t)))
          )
          .slice(0, 12)
      } else {
        state.relatedVideos = []
      }
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null
      state.relatedVideos = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false
        state.page = action.meta.arg
        state.videos = action.meta.arg === 1 ? action.payload : [...state.videos, ...action.payload]
      })
      .addCase(fetchVideos.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { setCurrentVideo, clearCurrentVideo } = videoSlice.actions
export default videoSlice.reducer
