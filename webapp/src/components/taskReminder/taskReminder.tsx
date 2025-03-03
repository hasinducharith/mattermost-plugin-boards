// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useEffect, useState } from 'react'

import Button from '../../widgets/buttons/button'

import {Board} from '../../../src/blocks/board'
import {Card} from '../../../src/blocks/card'
import {IUser} from '../../../src/user'
import {getMe} from '../../../src/store/users'
import {useAppSelector} from '../../../src/store/hooks'
import './taskReminder.scss'

interface Props {
    board: Board,
    card: Card
}

interface TaskObject {
    board_id?: string;
    card_id?: string;
    reminder_type?: string;
    reminder_date?: string;
    reciver_type?: string;
    user_id?: string;
    assignee_property_id?: string;
    action?: string;
}

const TaskReminder = ({ board, card }: Props) => {
    const me = useAppSelector<IUser|null>(getMe)
    const [selectedReminderType, setReminderType] = useState('')
    const [selectedReminderDate, setReminderDate] = useState('')
    const [selectedReciver, setReciver] = useState('')
    const [isShown, setIsShown] = useState(false)
    const [isShownReciver, setIsShownReciver] = useState(false)
    const [isAlertShow, setAlertShow] = useState(false)
    const [alertStatus, setAlertStatus] = useState(false)
    const [alertMsg, setAlertMsg] = useState('')
    const [isUpdateReminder, setIsUpdateReminder] = useState(false)

    const fetchTaskReminder = async() => {
        const response = await fetch('https://mm2kimai-staging.itplace.io/task-reminder?board_id='+card.boardId+'&card_id='+card.id+'&user_id='+me?.id+'&action=getTaskReminder', {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
        const data = await response.json()
        if(data.status == true) {
            setIsShown(true)
            setIsShownReciver(true)
            setReminderType(data.data.reminder_type)
            setReminderDate(data.data.next_send_date_time)
            setReciver(data.data.reciver_type)
            setIsUpdateReminder(true)
        }else{
            setIsShown(false)
            setIsShownReciver(false)
            setIsUpdateReminder(false)
        }
    }

    useEffect(() => {
        fetchTaskReminder()
    }, [])

    const reminderOptions = [
        { value: '', text: ' Choose reminder type '},
        { value: 'once', text: 'Once' },
        { value: 'daily', text: 'Daily' },
        { value: 'weekly', text: 'Weekly' },
        { value: 'monthly', text: 'Monthly' },
        { value: 'yearly', text: 'Yearly' },
    ]

    const reciverOptions = [
        { value: '', text: ' Choose reminder reciver '},
        { value: 'me', text: 'Me' },
        { value: 'assignee', text: 'Assignee' },
        { value: 'all', text: 'All' }
    ]

    const handleReminderTypeChange = (e:any) => {
        setReminderType(e.target.value)
        if(e.target.value != ''){
            setIsShown(true)
            setIsShownReciver(true)
        }else{
            setIsShown(false)
            setIsShownReciver(false)
        }
    }

    const handleReminderDateChange = (e:any) => {
        if(selectedReminderType && e.target.value != ''){
            setReminderDate(e.target.value)
            setIsShownReciver(true)
        }
    }

    const handleReciverChange = (e:any) => {
        setReciver(e.target.value)
        const userId = me?.id
        const assigneePropertyId = getAssigneePropertyId()
        if(isUpdateReminder == false){
            createTaskReminder(selectedReminderType,selectedReminderDate,e.target.value, userId, assigneePropertyId)
        }
    }

    const handleUpdateFunction = async() => {
        const obj: TaskObject = {
            board_id: card.boardId,
            card_id: card.id,
            reminder_type: selectedReminderType,
            reminder_date: selectedReminderDate,
            reciver_type: selectedReciver,
            user_id: me?.id,
        }

        const response = await fetch('https://mm2kimai-staging.itplace.io/task-reminder', {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(obj),
        })
        const data = await response.json()

        if(data){
            setAlertShow(true)
            if(data.status === true){
                setAlertStatus(true)
                setAlertMsg(data.msg)
            }else{
                setAlertStatus(false)
                setAlertMsg(data.msg)
            }

            setTimeout(() => {
                setAlertShow(false)
            }, 2000)
        }
    }

    const handleDeleteFunction = async() => {

        const response = await fetch('https://mm2kimai-staging.itplace.io/task-reminder?board_id='+card.boardId+'&card_id='+card.id+'&user_id='+me?.id, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
        const data = await response.json()

        if(data){
            setAlertShow(true)
            if(data.status === true){
                setAlertStatus(true)
                setAlertMsg(data.msg)
            }else{
                setAlertStatus(false)
                setAlertMsg(data.msg)
            }

            setTimeout(() => {
                setAlertShow(false)
                window.location.reload()
            }, 2000)
        }
    }

    function getAssigneePropertyId(){
        let propertyId = ''
        const boardProperties = board.cardProperties

        for(let i = 0; i < boardProperties.length; i++) {
            const property = boardProperties[i]
            if(property.name == "Assignee"){
                propertyId = property.id
            }else if(property.name == "Assign"){
                propertyId = property.id
            }
        }

        return propertyId
    }

    async function createTaskReminder(reminderType:any, reminderDate:any, reciver:any, userId:any, assigneePropertyId:any){
        const obj: TaskObject = {
            board_id: card.boardId,
            card_id: card.id,
            reminder_type: reminderType,
            reminder_date: reminderDate,
            reciver_type: reciver,
            user_id: userId,
            assignee_property_id: assigneePropertyId,
            action: 'create',
        }

        const response = await fetch('https://mm2kimai-staging.itplace.io/task-reminder', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(obj),
        })
        const data = await response.json()

        if(data){
            setAlertShow(true)
            if(data.status === true){
                setAlertStatus(true)
                setAlertMsg(data.msg)
            }else{
                setAlertStatus(false)
                setAlertMsg(data.msg)
            }

            setTimeout(() => {
                setAlertShow(false)
                window.location.reload()
            }, 2000)
        }else{
            setAlertShow(false)
            setAlertMsg(data.msg)
        }
    }

    return (
        <div>
            {/* added new property to select reminder type  */}
            <div className='octo-propertyrow'>
                <div className='octo-propertyname'><Button>Reminder Type</Button></div>
                <div>
                    <select className='Editable octo-propertyvalue propColorDefault task-reminder-selector' value={selectedReminderType} onChange={handleReminderTypeChange}>
                        {reminderOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.text}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {/* added new property to select first reminder date */}
            {isShown && (
                <div className='octo-propertyrow'>
                    <div className='octo-propertyname'><Button>Reminder</Button></div>
                    <div>
                        <input type="datetime-local" className='Editable octo-propertyvalue propColorDefault' value={selectedReminderDate} onChange={handleReminderDateChange}/>
                    </div>
                </div>
            )}
            {isShownReciver && (
                <div className='octo-propertyrow'>
                    <div className='octo-propertyname'><Button>Reciver</Button></div>
                    <div>
                        <select className='Editable octo-propertyvalue propColorDefault  task-reminder-selector' value={selectedReciver} onChange={handleReciverChange}>
                            {reciverOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.text}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            {isUpdateReminder && (
                <div className='octo-propertyrow'>
                    <div className='octo-propertyname'></div>
                    <div className='action-btns-div'>
                        <Button className="delete-button" onClick={handleDeleteFunction}>Delete</Button>
                        <div className='sized-box-20'></div>
                        <Button className="update-button" onClick={handleUpdateFunction}>Update</Button>
                    </div>
                </div>
            )}
            {isAlertShow && (
                <div className='octo-propertyrow'>
                    <div className={'success-message-div message-div '+ (alertStatus ? 'success-message-div' : 'error-message-div') + ''}>
                        <span>{alertMsg}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TaskReminder
