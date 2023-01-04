import {createAction, props} from '@ngrx/store';

export const setVariable = createAction('[My Component] Set Value', props<{ 'variable' : any }>());