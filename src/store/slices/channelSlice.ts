import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getChannel, getChannelVideos } from '@/lib/services/mockApi'
import type { Channel } from '@/lib/data/mockChannels'
import type { Video } from '@/lib/data/mockVideos'

interface ChannelState {
  channel: Channel | null
  videos: Video[]
  subscribed: boolean
  loading: boolean
}

const initialState: ChannelState = {
  channel: null,
  videos: [],
  subscribed: false,
  loading: false,
}

export const fetchChannel = createAsyncThunk('channel/fetchChannel', async (id: string) => {
  const [channel, videos] = await Promise.all([getChannel(id), getChannelVideos(id)])
  return { channel, videos }
})

const channelSlice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    toggleSubscribe: (state) => {
      state.subscribed = !state.subscribed
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannel.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchChannel.fulfilled, (state, action) => {
        state.loading = false
        state.channel = action.payload.channel ?? null
        state.videos = action.payload.videos
        state.subscribed = false
      })
      .addCase(fetchChannel.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { toggleSubscribe } = channelSlice.actions
export default channelSlice.reducer