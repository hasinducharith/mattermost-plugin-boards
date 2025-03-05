// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useEffect, useState } from 'react'

import './itpTimeRecorder.scss'
import {useAppDispatch, useAppSelector} from '../../../src/store/hooks'
import {getTrigger, setTrigger} from '../../../src/store/itpTimeRecorderStore'
import {IUser} from '../../../src/user'
import {getMe} from '../../../src/store/users'

import { sendFlashMessage } from '../flashMessages'

import api from './apiClient' 

interface Props {
    board: string
}

const ItpTimeViewer = ({}: Props)  => {

    const dispatch = useAppDispatch()

    const storedValue = localStorage.getItem('ongoingTask')

    const ongoingTaskId = localStorage.getItem('ongoingTaskId')

    const ongoingTaskURLst = localStorage.getItem('ongoingTaskURL')
  
    const ongoingTaskIdres = ongoingTaskId ? ongoingTaskId : ''

    const ongoingTaskURL = ongoingTaskURLst ? ongoingTaskURLst : ''

    const retrievedValue = storedValue ? JSON.parse(storedValue) : false
  
    const {isTriggered, taskId,totalSecond,taskURL} = useAppSelector(getTrigger)

    const [isTabActive, setIsTabActive] = useState(true)

    const [isShown, setIsShown] = useState(retrievedValue)

    const [taskIdloc, setTaskId] = useState(ongoingTaskIdres)

    const [counter, setCounter] = useState('00:00:00')
  
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

    const me = useAppSelector<IUser|null>(getMe)

    const activeTime = 0

    const [timesheetIdloc,setTimeSheetlocId] = useState(0)

    const [cardURL,setCardURL] = useState('')

    const [taskStop,setTaskStop] = useState('')

    const runTimer = (totalSecond:number) => {

        if(intervalId){

            clearInterval(intervalId)
        }
        
        const interval = setInterval(() => {

            totalSecond++
            const newTime = timeFormatSeconds(totalSecond)
            setCounter(newTime)
        }, 1000)
        console.log(interval)

        return interval
    }

    const timeFormatSeconds = (seconds:number) => {

        const updatedHours = Math.floor(seconds / 3600)
        const updatedMinutes = Math.floor((seconds % 3600) / 60)
        const updatedSeconds = seconds % 60

        const newTime = `${String(updatedHours).padStart(2, '0')}:${String(updatedMinutes).padStart(2, '0')}:${String(
            updatedSeconds
        ).padStart(2, '0')}`

        return newTime
    }

    useEffect(() => {
        console.log('this is it now')

        if(intervalId){
            clearInterval(intervalId)
        }
    
        if (isTabActive) {
            getActiveTaskStatus()
            console.log('this is it')
        }

        console.log(isTriggered)
    }, [isTriggered,isTabActive,ongoingTaskId])

    useEffect(()=>{

        console.log('retrievedValue -- '+storedValue)
        if(!retrievedValue){
            setIsShown(false)
            if(intervalId){
                clearInterval(intervalId)
            }
        }
    },[storedValue])


    useEffect(() => {

        const handleVisibilityChange = () => {

            setIsTabActive(!document.hidden)
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    useEffect(()=>{

        if(taskId != ''){

            setTaskId(taskId)
        }else{

            setTaskId(ongoingTaskIdres)
        }

        if(taskURL != ''){

            setCardURL(taskURL)
        }else{

            setCardURL(ongoingTaskURL)
        }
    },[taskId,totalSecond,activeTime,taskURL])


    const handleRedirect = () => {
        window.location.href =  cardURL
    }

    const stopTimeView = () => {

        setIsShown(false)
        if(intervalId){
            clearInterval(intervalId)
        }

        dispatch(setTrigger(
            {
                isTriggered: false,
                taskId:'',
                totalSecond:0,
                taskURL:''
            }
        ))

        sendFlashMessage({content: 'Time Recorded successfully' , severity: 'high'})
    }

    interface Response {

        status:boolean
    }


    const stopTimer = async () => {

        const userid = me?.id
        const response = await api.get<Response>(
            '/timerecord?type=stopTask&km_time_sheet_id=' + timesheetIdloc + '&userId=' + userid + '&cardId=' + taskStop
        )

        if(response.status){
            setIsShown(false)
            if(intervalId){
                clearInterval(intervalId)
            }

            stopTimeView()
        }

    }
    interface ResponseType {

        count: number;
        timesheet_id:number;
        status:string;
        task_url:string,
        mm_task_id:string
    }

    const getActiveTaskStatus = async () => {

        try {
        
            const response = await api.get<ResponseType>(
                '/timerecord/activeTask?type=activeTaskStatus&userId=' + me?.id+'&task_id=' + taskIdloc
            )

            console.log(response)
            if(response.timesheet_id != 0 && response.status != 'stop'){

                setIsShown(true)
                setCounter('Loading...')

                const interval = runTimer(response.count)
            
                setIntervalId(interval)
                setTimeSheetlocId(response.timesheet_id)
                localStorage.setItem('ongoingTask', String(true))
                console.log(response)
                setCardURL(response.task_url)
                setTaskStop(response.mm_task_id)

            }else{

                setIsShown(false)

                dispatch(setTrigger(
                    {isTriggered: false,
                        taskId:'',
                        totalSecond:0,
                        taskURL:''
                    }
                ))
            }

        } catch (error) {
            console.error('Error fetching data:', error)
        }

    }
    return (
        
        <div >
            {isShown && (
                <div className='timerSideBar'>
                    <i className="CompassIcon icon-clock"></i><span className='counterspan' title='Go to Task' onClick={handleRedirect}>{counter}</span><button className='stopBtnMenu size--medium' title='Stop Timer' onClick={stopTimer}><i className="CompassIcon icon-square"></i></button>
                </div>
            )}
        </div>
      
    )
}


export default ItpTimeViewer
