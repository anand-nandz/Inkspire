import {configureStore} from '@reduxjs/toolkit';
import {persistReducer,persistStore} from "redux-persist";
import storage from 'redux-persist/lib/storage';
import userReducer from './slices/UserSlice';

const persistConfigUser = {
    storage,
    key : 'user'
}

const persistedUserReducer = persistReducer(persistConfigUser,userReducer)
export const store = configureStore({
    reducer :{
        user: persistedUserReducer,

    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST']
            }
        })
})

export const persistor = persistStore(store)
