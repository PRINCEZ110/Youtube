import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { searchVideos as searchVideosApi, type SearchSort } from '@/lib/services/mockApi'
import type { Video } from '@/lib/data/mockVideos'

interface SearchState {
  query: string
  results: Video[]
  loading: boolean
  recentSearches: string[]
  sort: SearchSort
}

const MAX_RECENT_SEARCHES = 8

const initialState: SearchState = {
  query: '',
  results: [],
  loading: false,
  recentSearches: [],
  sort: 'relevance',
}

export const searchVideos = createAsyncThunk(
  'search/searchVideos',
  async ({ q, sort }: { q: string; sort: SearchSort }) => {
    const query = q.trim()
    if (!query) return []
    return searchVideosApi({ q: query, sort })
  }
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
    setSort: (state, action: PayloadAction<SearchSort>) => {
      state.sort = action.payload
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const term = action.payload.trim()
      if (!term) return
      state.recentSearches = [term, ...state.recentSearches.filter((item) => item !== term)].slice(
        0,
        MAX_RECENT_SEARCHES
      )
    },
    clearRecentSearches: (state) => {
      state.recentSearches = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchVideos.pending, (state) => {
        state.loading = true
      })
      .addCase(searchVideos.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload
      })
      .addCase(searchVideos.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { setQuery, setSort, addRecentSearch, clearRecentSearches } = searchSlice.actions
export default searchSlice.reducer