import { combineReducers, configureStore } from '@reduxjs/toolkit';

import {
	TypedUseSelectorHook,
	useDispatch as dispatchHook,
	useSelector as selectorHook,
} from 'react-redux';
import { reducer as ingredientsReducer } from './../slices/ingredients';
import { reducer as ordersReducer } from '../slices/orders';
import { reducer as builderReducer } from '../slices/builder';

const rootReducer = combineReducers({
	ingredientsReducer,
	ordersReducer,
	builderReducer
});

const store = configureStore({
	reducer: rootReducer,
	devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export default store;
