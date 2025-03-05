// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useEffect, useState ,useRef} from 'react'

import {Board} from '../../../src/blocks/board'
import {Card} from '../../../src/blocks/card'
import {IUser} from '../../../src/user'
import {getMe} from '../../../src/store/users'
import Button from '../../widgets/buttons/button'
import './itpTimeRecorder.scss'
import {useAppDispatch, useAppSelector} from '../../../src/store/hooks'
import {setTrigger} from '../../../src/store/itpTimeRecorderStore'

import { sendFlashMessage } from '../flashMessages'

import ItpTimerEditInput from './itpTimerEditInput'
import ItpRecorderdTimeUsers from './itpRecorderdTimeUsers'
import ItpRecordedTimes from './itpRecordedTimes'

interface Props {
    board: Board,
    card: Card
}

interface TaskObject {
    mm_user_id?: string;
    user_name?: string;
    u_email?: string;
    mm_project_id?: string;
    p_name?: string;
    mm_activity_id?: string;
    a_name?: string;
    action: string;
    totalMinutes: number;
    task_url?:string
}

const ItpTimeRecorder = ({ board, card }: Props) => {
    
    const me = useAppSelector<IUser|null>(getMe)
    const [isShown, setIsShown] = useState(false)
    const [isStart, setIsStart] = useState(false)
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
    const [time, setTime] = useState('00:00:00')
    const [taskStatus, setTaskStatus] = useState(true)
    const [stoppedTime, setStoppedTime] = useState('00h 00m')
    const [loading,setLoading] = useState(true)
    const [loadingAddTIme,setLoadingAddTime] = useState(false)
    const [isTabActive, setIsTabActive] = useState(true)
    const dispatch = useAppDispatch()
    const [toggleStartInputBtn,toggleStartInput] = useState(false)
    const [missedTimeRecordMins,setmissedTimeRecordMins] = useState(0)
    const [clearInputHM,setClearInputHM] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)
    const [modalType,setModalType] = useState('')
    const [cardId,setCardId] = useState('')
    const [records, setRecords] =  useState([])
    const [recordsLoader, setRecordsLoader] =  useState(false)
    const [userIdRecord,setUserIdRecord] = useState(0)
    const itpTitle = 'Time Spend'

    const resetState = async () => {
        
        setIsShown(false)
        setIsStart(false)
        setTime('00:00:00')
        setTaskStatus(true)
        setStoppedTime('00h 00m')
        setLoading(true)
        setLoadingAddTime(false)
        console.log("%cRefreshing timer", "color:green")
        if(intervalId){
            clearInterval(intervalId)
        }
    }


    const fetchTaskStatus = async () => {
        setLoading(true)
        await resetState()
        const userid = me?.id
        const usename = me?.username
        const email = `${me?.username}@itplace.com`
        const projectid = board?.id
        const projectname = board?.title
        const taskid = card?.id
        const taskname = card?.title
        
        const obj: TaskObject = {
            mm_user_id: userid,
            user_name: usename,
            u_email: email,
            mm_project_id: projectid,
            p_name: projectname,
            mm_activity_id: taskid,
            a_name: taskname,
            action: 'status',
            totalMinutes: 0,
            task_url:window.location.href
        }
        
        try {
            const response = await fetch('http://mm2kimai.itplace.io/timerecord', {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })
            const data = await response.json()
        
            if (data.data.length === 0) {
                setIsStart(false)
                setTaskStatus(true)
            } else {
                if (data.data.status === null) {

                    const time = getIntiatTime(data.data.begin_time)
                    setTime(timeFormatSeconds(time))
                    setIsStart(true)
                    setTaskStatus(true)
                    const interval = runTimer(time)
                    setIntervalId(interval)
                    dispatch(setTrigger(
                        {
                            isTriggered: true,
                            taskId:taskid,
                            totalSecond:time,
                            taskURL:window.location.href
                        }
                    ))

                } else if (data.data.status === 'stop') {
                    setIsStart(false)
                    setTaskStatus(false)

                }
        
                setStoppedTime(timeFormat(data.time))
            }

            setLoading(false)
        } catch (err: any) {
            console.log(err.message)
        }
    }

    useEffect(() => {

        console.log(board.cardProperties)

        const handleVisibilityChange = () => {
            setIsTabActive(!document.hidden)
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }

    }, [])

    useEffect(() => {

        const handleOutsideClick = (event:any) => {
            if (isModalOpen &&
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)) {
                closeModal()
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
        }

    }, [isModalOpen])

    useEffect(() => {
        
        if (isTabActive) {
            fetchTaskStatus()

        } else {
            console.log(time)
        }
    }, [isTabActive])


    useEffect(() => {
        // Replace 'myClass' with the actual class name of the element you want to target
        const element = document.querySelector('.historyView') as HTMLElement
  
        if (element) {
        // Get the computed style of the element
            const computedStyle = window.getComputedStyle(element)
  
            // Get the 'top' property value
            const topValue = computedStyle.getPropertyValue('top')
  
            console.log('Top value:', topValue)
        }
    }, [])


    const handleStart =  async () => {

        setLoading(true)

        const userid = me?.id
        const usename = me?.username
        const email = me?.username + '@itplace.com'
        const projectid = board?.id
        const projectname = board?.title
        const taskid = card?.id
        const taskname = card?.title
      
        const obj: TaskObject = {
            mm_user_id: userid,
            user_name: usename,
            u_email: email,
            mm_project_id: projectid,
            p_name: projectname,
            mm_activity_id: taskid,
            a_name: taskname,
            action: taskStatus ? 'create' : 'restart',
            totalMinutes: 0,
            task_url:window.location.href
        }
      
        const success = await handleStartOrRestart(obj)

        if(success){
            setIsShown(false)
            setLoading(false)
            const [hours, minutes, seconds] = time.split(':').map(Number)
            const totalSeconds = hours * 3600 + minutes * 60 + seconds
            const interval = runTimer(totalSeconds)
        
            setIntervalId(interval)
            dispatch(setTrigger(
                {isTriggered: true,
                    taskId:taskid,
                    totalSecond:totalSeconds,
                    taskURL:window.location.href
                }
            ))
            setIsStart(true)

        }

    }

    const handleStartOrRestart = async (obj: TaskObject): Promise<boolean> => {
        try {
            const response = await fetch('http://mm2kimai.itplace.io/timerecord', {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })
      
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
      
            await response.json()
      
            return true // Success
        } catch (err:any) {
            console.error(err.message)
            return false // Error occurred, return false
        }
    }
      

    const timeFormat = (seconds:number) => {

        const updatedHours = Math.floor(seconds / 3600)
        const updatedMinutes = Math.ceil((seconds % 3600) / 60)

        return `${String(updatedHours).padStart(2, '0')}h ${String(updatedMinutes).padStart(2, '0')}m`

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

    const getIntiatTime = (dt:string) => {

        const specificDateTime: Date = new Date(dt)
        const currentTime: Date = new Date()
        const differenceInSeconds: number = Math.floor((currentTime.getTime() - specificDateTime.getTime()) / 1000)

        return differenceInSeconds
    }

    const runTimer = (totalSeconds:number) => {

        if(intervalId){
            clearInterval(intervalId)
        }

        const interval = setInterval(() => {
            let hasFetched = false

            if(totalSeconds % 15 === 0 && !hasFetched){
                hasFetched = true
            }

            totalSeconds++
            const newTime = timeFormatSeconds(totalSeconds)
            setTime(newTime)
        }, 1000)

        return interval
    }

    const handleStop = async() => {
        setIsStart(false)
        const userid = me?.id
        const usename = me?.username
        const email = me?.username+'@itplace.com'
        const projectid = board?.id
        const projectname = board?.title
        const taskid = card?.id
        const taskname = card?.title

        const obj: TaskObject = {
            mm_user_id: userid,
            user_name: usename,
            u_email: email,
            mm_project_id: projectid,
            p_name: projectname,
            mm_activity_id: taskid,
            a_name: taskname,
            action: 'stop',
            totalMinutes: 0,
            task_url:''
        }

        await fetch('http://mm2kimai.itplace.io/timerecord',{
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response)=> response.json())
            .then((data)=>{

                if(data.data.status === 'stop'){

                    if (intervalId) {
                        const timesum = data.time
                        const updatedHours = Math.floor(timesum / 3600)
                        const updatedMinutes = Math.ceil((timesum % 3600) / 60)

                        clearInterval(intervalId)
                        setIntervalId(null)

                        setStoppedTime(
                            `${String(updatedHours).padStart(2, '0')}h ${String(updatedMinutes).padStart(2, '0')}m`
                        )

                        setIsStart(false)

                        dispatch(setTrigger(
                            {isTriggered: false,
                                taskId:'',
                                totalSecond:0,
                                taskURL:''
                            }
                        ))

                        setTime('00:00:00')
                        sendFlashMessage({content: 'Time Recorded successfully' , severity: 'high'})
                        setTaskStatus(false)

                    }else{
                        console.log('time interval not hey')
                        setIsStart(true)
                    }
                }

                if(intervalId){
                    clearInterval(intervalId)
                }
            })
            .catch((err) => {
                console.log(err.message)
            })
        
    }

    const handleStopTimeHover = () => {
        setIsShown(true)
    }

    const handleStopBtnHover = () => { 
        setIsShown(false)
    }

    const changeRecordBtn = (message:boolean,totalMinutes:number) => {

        if(message){
            toggleStartInput(true)
            setmissedTimeRecordMins(totalMinutes)
        }else{
            toggleStartInput(false)
            setmissedTimeRecordMins(0)
        }
    }


    const handleButtonClick = async () => {
        setLoadingAddTime(true)
        const userid = me?.id
        const usename = me?.username
        const email = me?.username + '@itplace.com'
        const projectid = board?.id
        const projectname = board?.title
        const taskid = card?.id
        const taskname = card?.title
      
        const obj: TaskObject = {
            mm_user_id: userid,
            user_name: usename,
            u_email: email,
            mm_project_id: projectid,
            p_name: projectname,
            mm_activity_id: taskid,
            a_name: taskname,
            action:'addNew',
            totalMinutes: missedTimeRecordMins,
            task_url:''
        }

        try {
            const response = await fetch('http://mm2kimai.itplace.io/timerecord', {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })
        
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
        
            const data = await response.json()
            setStoppedTime(timeFormat(data.time))
            setClearInputHM(true)
            setClearInputHM(false)
            setLoadingAddTime(false)
            return true // Success
        } catch (err:any) {
            console.error(err.message)
            return false // Error occurred, return false
        }
    }

    const openModal = (modaltype:any) => {
        console.log(modaltype)
        const taskid = card?.id
        setCardId(taskid)
        getAddedTimeRecords()

        if(isModalOpen){
            setIsModalOpen(false)
        }else{
            setIsModalOpen(true)
        }

        if(modaltype == 'user'){
            setModalType('user')
        }else{
            setModalType('timeRecs')
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setModalType('')
        getAddedTimeRecords()
    }
    
    const modalStyle = {
        display: isModalOpen ? 'block' : 'none',
    }

    const getAddedTimeRecords = async () => {

        setRecordsLoader(true)

        const cardId = card?.id
        const userid = me?.id

        try {
            const response = await fetch('http://mm2kimai.itplace.io/timerecord?type=getdata&cardId=' + cardId +'&userid=' + userid ,{
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })
    
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
    
            const data = await response.json()

            setRecords(data['data'])
            setStoppedTime(timeFormat(data['duration']))

            setRecordsLoader(false)
            console.log('enabled')
    
        } catch (err: any) {
            console.error(err.message)
            return false
        }
        
    }

    const loadTimeRecords = (message:boolean,userId:number) => {
        
        if(message){
            setModalType('timeRecs')
            setUserIdRecord(userId)
        }
    }

    const setBackUserList = (message:boolean) => {

        if(message){
            getAddedTimeRecords()
            setModalType('user') //
        }
    }

    const removeSlot = async(timesheetId:number) => { 

        try {
            const response = await fetch('http://mm2kimai.itplace.io/timerecord?type=delete&timesheet_id=' + timesheetId, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })
    
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
    
            await response.json()
    
        } catch (err: any) {
            console.error(err.message)
            return false
        }

    }

    return (
        <div>
            <div className='octo-propertyrow'>
                <div className='octo-propertyname'>
                    <Button>{itpTitle}</Button>
                </div>
                <div>
                    <div className='timespend-wrapper'>
                        <div className='timespend'>
                            <div className='item2'>
                                {
                                    !isStart && (
                                        <ItpTimerEditInput changeRecordBtn={changeRecordBtn} clearInputHM={clearInputHM} />
                                    ) 
                                
                                }
                            </div>
                            <div className='item3'>
                                { 
                                    !isStart && !toggleStartInputBtn && 
                                    
                                    (
                                        <button className='Button emphasis--primary startBtn size--small' disabled={loading}  onClick={handleStart}><i className="CompassIcon icon-play"></i>Start Recording</button>
                                    )
                                }
                                {
                            
                                    !isStart && toggleStartInputBtn &&
                                    (
                                        <button className='Button emphasis--primary startBtn size--small' disabled={loadingAddTIme} onClick={handleButtonClick} ><i className="CompassIcon icon-play"></i>Enter Time</button>
                                    )
                            
                                }
                                {isStart && (
                                    <button className='Button stopBtn emphasis--primary size--small stopBtnMenu' onClick={handleStop}  onMouseOver={handleStopTimeHover} onMouseLeave={handleStopBtnHover}>
                                    
                                        {!isShown && (
                                            <span >{time}</span>
                                        )}
                                        {isShown && (
                                            <span  >Stop</span>
                                        )}
                                    </button>

                                )}
                            </div>
                            <div className='item4'>
                                <button className='Button' onClick={() => openModal('user')}>Total: {stoppedTime} </button>
                            </div>
                        </div>
                        <div ref={modalRef} className='timespend historyView' style={modalStyle}>
                            {modalType == 'user' && <ItpRecorderdTimeUsers cardId={cardId} loadTimeRecords={loadTimeRecords} records={records} recordsLoader={recordsLoader}/>}
                            {modalType == 'timeRecs' && <ItpRecordedTimes setBackUserList={setBackUserList} userIdRecord={userIdRecord}  records={records} removeSlot={removeSlot}/>}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ItpTimeRecorder
