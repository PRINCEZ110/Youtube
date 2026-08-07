import { configureStore } from "@reduxjs/toolkit"
import videoReducer from "@/store/slices/videoSlice"
import searchReducer from "@/store/slices/searchSlice"
import uiReducer from "@/store/slices/uiSlice"
import commentReducer from "@/store/slices/commentSlice"
import channelReducer from "@/store/slices/channelSlice"

export const store = configureStore({
  reducer: {
    videos: videoReducer,
    search: searchReducer,
    ui: uiReducer,
    comments: commentReducer,
    channel: channelReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
