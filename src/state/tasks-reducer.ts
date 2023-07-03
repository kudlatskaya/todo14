import {TasksStateType} from '../app/App';
import {
    AddTodolistActionType,
    RemoveTodolistActionType,
    SetTodolistsType
} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppActionsType, AppRootStateType} from "./store";


const initialState: TasksStateType = {
    /*"todolistId1": [
        { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ],
    "todolistId2": [
        { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ]*/

}

export const tasksReducer = (state: TasksStateType = initialState, action: TasksActionsType): TasksStateType => {
    switch (action.type) {
        case "SET-TASKS":
            return {...state, [action.todoId]: action.tasks}

        case 'SET-TODOS': {
            const _state = {...state}
            action.todos.forEach((tl) => {
                _state[tl.id] = []
            })
            return _state
        }
        case 'REMOVE-TASK':
            return {
                ...state,
                [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)
            }
        case 'ADD-TASK':
            return {
                ...state,
                [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]
            }
        case 'UPDATE-TASK':
            return {
                ...state,
                [action.todolistId]: state[action.todolistId]
                    .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
            }
        case 'ADD-TODOLIST':
            return {...state, [action.todolistId]: []}
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        default:
            return state;
    }
}

export const removeTaskAC = (taskId: string, todolistId: string) => ({
    type: 'REMOVE-TASK',
    taskId: taskId,
    todolistId: todolistId
} as const)

export const addTaskAC = (task: TaskType) => ({type: 'ADD-TASK', task} as const)
export const updateTaskAC = (taskId: string, model: UpdateTaskModelType, todolistId: string) => ({
    type: 'UPDATE-TASK',
    model, todolistId, taskId
} as const)

export const setTasksAC = (todoId: string, tasks: TaskType[]) => ({
    type: 'SET-TASKS',
    tasks, todoId
} as const)

export const getTasksTC = (todoId: string) => (dispatch: Dispatch<AppActionsType>) => {
    todolistsAPI.getTasks(todoId)
        .then((res) => {
            dispatch(setTasksAC(todoId, res.data.items))
        })
}

export const deleteTaskTC = (taskId: string, todoId: string) => (dispatch: Dispatch<AppActionsType>) => {
    todolistsAPI.deleteTask(todoId, taskId)
        .then(() => {
            dispatch(removeTaskAC(taskId, todoId))
        })
}

export const createTaskTC = (todoId: string, title: string) => (dispatch: Dispatch<AppActionsType>) => {
    todolistsAPI.createTask(todoId, title)
        .then((res) => {
            dispatch(addTaskAC(res.data.data.item))
        })
}

export const updateTaskTC = (todoId: string, taskId: string, data: FlexType) =>
    (dispatch: Dispatch, getState: () => AppRootStateType) => {

        const task = getState().tasks[todoId].find((t) => t.id === taskId)

        if (task) {
            const model: UpdateTaskModelType = {
                title: task.title,
                deadline: task.deadline,
                startDate: task.startDate,
                priority: task.priority,
                description: task.description,
                status: task.status,
                ...data,
            }

            todolistsAPI.updateTask(todoId, taskId, model)
                .then(() => {
                    dispatch(updateTaskAC(taskId, model, todoId))
                })
        }
    }


/* type */

interface FlexType {
    title?: string,
    deadline?: string,
    startDate?: string,
    priority?: TaskPriorities,
    description?: string,
    status?: TaskStatuses
}

export type TasksActionsType =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistsType
    | ReturnType<typeof setTasksAC>