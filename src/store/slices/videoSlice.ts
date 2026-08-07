import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { mockVideos, type Video } from '@/lib/data/mockVideos'
import { fetchVideos as fetchVideosApi } from '@/lib/services/mockApi'
import type { RootState } from '@/store/index'

const PAGE_SIZE = 12

interface VideoState {
  videos: Video[]
  currentVideo: Video | null
  relatedVideos: Video[]
  loading: boolean
  hasMore: boolean
  page: number
}

const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  relatedVideos: [],
  loading: false,
  hasMore: false,
  page: 1,
}

export const fetchVideos = createAsyncThunk('videos/fetchVideos', async (page: number, api) => {
  const categoryId = (api.getState() as RootState).ui.selectedCategory ?? undefined
  return fetchVideosApi({ page, pageSize: PAGE_SIZE, categoryId })
})

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<string>) => {
      state.currentVideo = mockVideos.find((video) => video.id === action.payload) ?? null
      if (state.currentVideo) {
        const { categoryId, tags } = state.currentVideo
        state.relatedVideos = mockVideos
          .filter(
            (video) =>
              video.id !== state.currentVideo?.id &&
              (video.categoryId === categoryId || video.tags.some((tag) => tags.includes(tag)))
          )
          .slice(0, 8)
      } else {
        state.relatedVideos = []
      }
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null
      state.relatedVideos = []
    },
    resetVideos: (state) => {
      state.videos = []
      state.page = 1
      state.hasMore = false
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
        state.hasMore = action.payload.length === PAGE_SIZE
        state.videos = action.meta.arg === 1 ? action.payload : [...state.videos, ...action.payload]
      })
      .addCase(fetchVideos.rejected, (state) => {
        state.loading = false
        state.hasMore = false
      })
  },
})

export const { setCurrentVideo, clearCurrentVideo, resetVideos } = videoSlice.actions
export default videoSlice.reducer