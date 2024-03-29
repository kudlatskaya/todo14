import {v1} from 'uuid';
import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppActionsType, AppRootStateType, AppThunk} from "./store";
import {ThunkAction} from "redux-thunk";


const initialState: Array<TodolistDomainType> = [
    /*{id: todolistId1, title: 'What to learn', filter: 'all', addedDate: '', order: 0},
    {id: todolistId2, title: 'What to buy', filter: 'all', addedDate: '', order: 0}*/
]

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
}

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: TodolistsActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case "SET-TODOS":
            return action.todos.map((tl) => ({...tl, filter: 'all'}))

        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id !== action.id)

        case 'ADD-TODOLIST':
            return [{
                id: action.todolistId,
                title: action.title,
                filter: 'all',
                addedDate: '',
                order: 0
            }, ...state]

        case 'CHANGE-TODOLIST-TITLE':
            return state.map(tl => tl.id === action.id
                ? {...tl, title: action.title}
                : tl
            )

        case 'CHANGE-TODOLIST-FILTER':
            return state.map(tl => tl.id === action.id
                ? {...tl, filter: action.filter}
                : tl
            )

        default:
            return state;
    }
}

export const removeTodolistAC = (todolistId: string) => ({type: 'REMOVE-TODOLIST', id: todolistId} as const)
export const addTodolistAC = (title: string) => ({type: 'ADD-TODOLIST', title: title, todolistId: v1()} as const)
export const changeTodolistTitleAC = (id: string, title: string) => ({type: 'CHANGE-TODOLIST-TITLE', id: id, title: title} as const)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({type: 'CHANGE-TODOLIST-FILTER', id: id, filter: filter} as const)
export const setTodolistsAC = (todos: TodolistType[]) => ({type: 'SET-TODOS', todos} as const)

// export const getTodosTC = (): AppThunk => (dispatch: Dispatch<AppActionsType>) => {
//     todolistsAPI.getTodolists()
//         .then((res) => {
//             dispatch(setTodolistsAC(res.data))
//         })
// }

export const getTodosTC = (): AppThunk => async (dispatch: Dispatch<AppActionsType>) => {
    try {
        const res = await todolistsAPI.getTodolists()
        dispatch(setTodolistsAC(res.data))
    } catch (e) {
        throw new Error(e)
    }

}

export const removeTodolistTC = (todoId: string): AppThunk => (dispatch: Dispatch<AppActionsType>) => {
    todolistsAPI.deleteTodolist(todoId)
        .then(() => {
            dispatch(removeTodolistAC(todoId))
        })
}

export const createTodolistTC = (title: string): AppThunk => (dispatch: Dispatch<AppActionsType>) => {
    todolistsAPI.createTodolist(title)
        .then(() => {
            dispatch(addTodolistAC(title))
        })
}

export const changeTodolistTitleTC = (todoId: string, title: string): AppThunk => (dispatch: Dispatch<AppActionsType>) => {
    todolistsAPI.updateTodolist(todoId, title)
        .then(() => {
            dispatch(changeTodolistTitleAC(todoId, title))
        })
}


/* types */

export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>
export type SetTodolistsType = ReturnType<typeof setTodolistsAC>
export type TodolistsActionsType =
    RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | SetTodolistsType

