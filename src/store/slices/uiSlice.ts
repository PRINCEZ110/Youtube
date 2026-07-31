import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface UiState {
  sidebarOpen: boolean
  selectedCategory: string | null
  isMobile: boolean
}

const initialState: UiState = {
  sidebarOpen: false,
  selectedCategory: null,
  isMobile: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload
    },
  },
})

export const { toggleSidebar, setSelectedCategory, setIsMobile } = uiSlice.actions
export default uiSlice.reducer
