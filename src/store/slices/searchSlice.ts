import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { ApiError, PageResponse, Video } from '@/lib/youtube/types'

export type SearchSort = 'relevance' | 'date' | 'views'
export type SearchDuration = 'any' | 'short' | 'medium' | 'long'

interface SearchState {
  query: string
  results: Video[]
  nextPageToken: string | null
  hasMore: boolean
  totalResults: number | null
  status: 'idle' | 'loading' | 'success' | 'error'
  error: ApiError | null
  loadingMore: boolean
  sort: SearchSort
  duration: SearchDuration
}

const initialState: SearchState = {
  query: '',
  results: [],
  nextPageToken: null,
  hasMore: false,
  totalResults: null,
  status: 'idle',
  error: null,
  loadingMore: false,
  sort: 'relevance',
  duration: 'any',
}

async function searchRequest(
  q: string,
  pageToken: string | null,
  order: string,
  duration: SearchDuration,
  signal?: AbortSignal
): Promise<PageResponse<Video>> {
  const params = new URLSearchParams({ q })
  if (order === 'date') params.set('order', 'date')
  if (order === 'views') params.set('order', 'viewCount')
  if (duration !== 'any') params.set('duration', duration)
  if (pageToken) params.set('pageToken', pageToken)
  const res = await fetch(`/api/youtube/search?${params.toString()}`, { signal })
  const body = (await res.json()) as { ok: boolean; data?: PageResponse<Video>; error?: ApiError }
  if (!body.ok || !body.data) {
    const error: ApiError =
      body.error ?? { kind: 'unknown', message: 'Search request failed', retryable: true }
    throw new SearchApiError(error)
  }
  return body.data
}

class SearchApiError extends Error {
  readonly apiError: ApiError
  constructor(apiError: ApiError) {
    super(apiError.message)
    this.apiError = apiError
  }
}

export const fetchSearch = createAsyncThunk(
  'search/fetchSearch',
  async (
    { q, sort, duration }: { q: string; sort: SearchSort; duration: SearchDuration },
    api
  ): Promise<PageResponse<Video>> => {
    const state = (api.getState() as { search: SearchState }).search
    const order = sort === 'relevance' ? state.sort : sort
    return searchRequest(q, null, order, duration)
  }
)

export const fetchMoreSearch = createAsyncThunk(
  'search/fetchMoreSearch',
  async (_, api): Promise<PageResponse<Video>> => {
    const state = (api.getState() as { search: SearchState }).search
    if (!state.nextPageToken) throw new Error('No more pages')
    const order = state.sort === 'relevance' ? 'relevance' : state.sort
    return searchRequest(state.query, state.nextPageToken, order, state.duration)
  }
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: { payload: string }) => {
      state.query = action.payload.trim()
    },
    setSort: (state, action: { payload: SearchSort }) => {
      state.sort = action.payload
    },
    setDuration: (state, action: { payload: SearchDuration }) => {
      state.duration = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearch.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSearch.fulfilled, (state, action) => {
        state.status = 'success'
        state.results = action.payload.items
        state.nextPageToken = action.payload.nextPageToken
        state.hasMore = !!action.payload.nextPageToken
        state.totalResults = action.payload.totalResults
      })
      .addCase(fetchSearch.rejected, (state, action) => {
        state.status = 'error'
        state.error =
          action.payload instanceof SearchApiError
            ? action.payload.apiError
            : { kind: 'unknown', message: action.error.message ?? 'Search failed', retryable: true }
      })
      .addCase(fetchMoreSearch.pending, (state) => {
        state.loadingMore = true
      })
      .addCase(fetchMoreSearch.fulfilled, (state, action) => {
        state.loadingMore = false
        const existing = new Set(state.results.map((v) => v.id))
        state.results = [
          ...state.results,
          ...action.payload.items.filter((v) => !existing.has(v.id)),
        ]
        state.nextPageToken = action.payload.nextPageToken
        state.hasMore = !!action.payload.nextPageToken
      })
      .addCase(fetchMoreSearch.rejected, (state) => {
        state.loadingMore = false
      })
  },
})

export const { setQuery, setSort, setDuration } = searchSlice.actions
export default searchSlice.reducer