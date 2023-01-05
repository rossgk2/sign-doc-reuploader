import {ActionCreator, createAction, props} from '@ngrx/store';

/* The use of the props<>() function here specifies the type of the payload that the Action created
by this ActionCreator will have. */
export const setVariable = createAction('[Variables] Set Variable', props<{'oAuthState': string}>());

// Using a type declaration in the above and saying "export const setVariable: ActionCreator = ..." causes a compile error.
