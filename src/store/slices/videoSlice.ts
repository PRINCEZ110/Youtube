import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ApiError, LocalCategoryId, PageResponse, Video } from '@/lib/youtube/types'

interface VideoFeedState {
  videos: Video[]
  nextPageToken: string | null
  hasMore: boolean
  status: 'idle' | 'loading' | 'success' | 'error'
  error: ApiError | null
  loadingMore: boolean
  category: LocalCategoryId
}

const initialState: VideoFeedState = {
  videos: [],
  nextPageToken: null,
  hasMore: false,
  status: 'idle',
  error: null,
  loadingMore: false,
  category: 'all',
}

export const fetchFeed = createAsyncThunk(
  'videos/fetchFeed',
  async (category: LocalCategoryId): Promise<PageResponse<Video>> => {
    const res = await fetch(
      `/api/youtube/videos?mode=popular&category=${encodeURIComponent(category)}`
    )
    const body = (await res.json()) as { ok: boolean; data?: PageResponse<Video>; error?: ApiError }
    if (!body.ok || !body.data) throw new ThunkApiError(body.error)
    return body.data
  }
)

export const fetchMoreFeed = createAsyncThunk(
  'videos/fetchMoreFeed',
  async (_, api): Promise<PageResponse<Video>> => {
    const state = (api.getState() as { videos: VideoFeedState }).videos
    if (!state.nextPageToken) throw new Error('No more pages')
    const res = await fetch(
      `/api/youtube/videos?mode=popular&category=${encodeURIComponent(state.category)}&pageToken=${encodeURIComponent(state.nextPageToken)}`
    )
    const body = (await res.json()) as { ok: boolean; data?: PageResponse<Video>; error?: ApiError }
    if (!body.ok || !body.data) throw new ThunkApiError(body.error)
    return body.data
  }
)

class ThunkApiError extends Error {
  readonly apiError: ApiError
  constructor(apiError: ApiError | undefined) {
    super(apiError?.message ?? 'Feed request failed')
    this.apiError = apiError ?? { kind: 'unknown', message: 'Feed request failed', retryable: false }
  }
}

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    resetFeed: (state) => {
      state.videos = []
      state.nextPageToken = null
      state.hasMore = false
      state.status = 'idle'
      state.error = null
    },
    setFeedCategory: (state, action: PayloadAction<LocalCategoryId>) => {
      state.category = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.status = 'success'
        state.videos = action.payload.items
        state.nextPageToken = action.payload.nextPageToken
        state.hasMore = !!action.payload.nextPageToken
        state.error = null
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.status = 'error'
        state.error =
          action.payload instanceof ThunkApiError
            ? action.payload.apiError
            : { kind: 'unknown', message: action.error.message ?? 'Feed request failed', retryable: true }
      })
      .addCase(fetchMoreFeed.pending, (state) => {
        state.loadingMore = true
      })
      .addCase(fetchMoreFeed.fulfilled, (state, action) => {
        state.loadingMore = false
        const existing = new Set(state.videos.map((v) => v.id))
        state.videos = [
          ...state.videos,
          ...action.payload.items.filter((v) => !existing.has(v.id)),
        ]
        state.nextPageToken = action.payload.nextPageToken
        state.hasMore = !!action.payload.nextPageToken
      })
      .addCase(fetchMoreFeed.rejected, (state) => {
        state.loadingMore = false
      })
  },
})

export const { resetFeed, setFeedCategory } = videoSlice.actions
export default videoSlice.reducer