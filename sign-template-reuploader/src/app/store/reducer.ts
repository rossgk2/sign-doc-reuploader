import {createReducer, on} from '@ngrx/store';
import {setVariable} from './actions';

export interface State { 'variable' : any; }

const initialState: State = { 'variable' : null };

const _reducer = createReducer(initialState,
  on(setVariable, (state, {variable}) => ({...state, variable}))
);

export function reducer(state, action) {
  return _reducer(state, action);
}