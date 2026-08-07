import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { addComment as addCommentApi, getComments } from '@/lib/services/mockApi'
import type { Comment } from '@/lib/data/mockComments'

interface CommentState {
  comments: Comment[]
  loading: boolean
}

const initialState: CommentState = {
  comments: [],
  loading: false,
}

export const fetchComments = createAsyncThunk('comments/fetchComments', async (videoId: string) => {
  return getComments(videoId)
})

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ videoId, text }: { videoId: string; text: string }) => {
    return addCommentApi(videoId, text)
  }
)

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    likeComment: (state, action: PayloadAction<string>) => {
      const comment = state.comments.find((item) => item.id === action.payload)
      if (comment) comment.likes += 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false
        state.comments = action.payload
      })
      .addCase(fetchComments.rejected, (state) => {
        state.loading = false
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.unshift(action.payload)
      })
  },
})

export const { likeComment } = commentSlice.actions
export default commentSlice.reducer