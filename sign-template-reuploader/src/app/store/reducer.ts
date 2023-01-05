import {createReducer, on} from '@ngrx/store';
import {setVariable} from './actions';

export interface State { 'oAuthState': string };

const initialState = { 'oAuthState': null };

const _reducer = createReducer(
  initialState,
  // The ... operator is used to ensure pass-by-value and not pass-by-reference.
  on(setVariable, (state, oAuthState) => ({...state, oAuthState}))
);

export function reducer(state, action) {
  return _reducer(state, action);
}