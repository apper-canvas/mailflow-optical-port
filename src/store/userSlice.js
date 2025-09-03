import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  gmailAuth: {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null
  }
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      // CRITICAL: Always use deep cloning to avoid reference issues
      // This prevents potential issues with object mutations
      state.user = JSON.parse(JSON.stringify(action.payload));
      state.isAuthenticated = !!action.payload;
    },
    setGmailAuth: (state, action) => {
      state.gmailAuth = {
        isAuthenticated: !!action.payload.accessToken,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt
      };
    },
    clearGmailAuth: (state) => {
      state.gmailAuth = {
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null
      };
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    }
  }
});

export const { setUser, clearUser, setGmailAuth, clearGmailAuth } = userSlice.actions;
export default userSlice.reducer;