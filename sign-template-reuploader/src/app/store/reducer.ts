import {createReducer, on} from '@ngrx/store';
import {setVariable} from './actions';

export interface State { 'oAuthState': string };

const initialState = { 'oAuthState': null };

const _reducer = createReducer(
  initialState,

  /* If we wanted to preserve a record of previous states, we would use
  on(setVariable, (state, oAuthState) => ({...state, oAuthState})) instead of the below. 
  Note that here, the ... operator ensures pass-by-value rather than pass-by-reference.
  We don't need to do this though; overwriting the old state works for our purposes. */
  on(setVariable, (state, oAuthState) => oAuthState)
);

export function reducer(state, action) {
  return _reducer(state, action);
}