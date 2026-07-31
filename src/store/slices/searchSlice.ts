import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Video } from "@/lib/data/mockVideos"

interface SearchState {
  query: string
  results: Video[]
  loading: boolean
}

const initialState: SearchState = {
  query: "",
  results: [],
  loading: false,
}

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
  },
})

export const { setQuery } = searchSlice.actions
export default searchSlice.reducer
