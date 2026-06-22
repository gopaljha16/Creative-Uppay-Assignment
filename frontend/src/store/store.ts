import { configureStore, Middleware } from "@reduxjs/toolkit";
import bookingReducer from "./bookingSlice";

const localStorageMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  const state = storeApi.getState() as { booking: any };
  localStorage.setItem("movie_booking_state", JSON.stringify(state.booking));
  return result;
};

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
