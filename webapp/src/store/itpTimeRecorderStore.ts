// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.


import {PayloadAction, createSlice} from '@reduxjs/toolkit'

import {RootState} from './index'

const storedValue = localStorage.getItem('ongoingTask')

const triggerSlice = createSlice({
    
    name: 'itpTimeRecorder',
    initialState: { isTriggered: false,
        taskId:'',
        totalSecond:0,
        taskURL:'xyz'
    },
    reducers: {
        setTrigger: (state, action: PayloadAction<{isTriggered: boolean; taskId: string,totalSecond:number,taskURL:string}>) => {
            localStorage.setItem('ongoingTask', String(action.payload.isTriggered))
            localStorage.setItem('ongoingTaskId', String(action.payload.taskId))
            localStorage.setItem('ongoingTaskURL', String(action.payload.taskURL))
            state.isTriggered = action.payload.isTriggered
            state.taskId = action.payload.taskId
            state.totalSecond = action.payload.totalSecond
            state.taskURL = action.payload.taskURL

            
        },
    },
})
  

export const {reducer} = triggerSlice
export const { setTrigger } = triggerSlice.actions

export const getTrigger = (state: RootState) => ({
    isTriggered: state.itpTimeRecorder.isTriggered,
    taskId: state.itpTimeRecorder.taskId,
    totalSecond:state.itpTimeRecorder.totalSecond,
    taskURL:state.itpTimeRecorder.taskURL
})

