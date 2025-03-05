// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import Button from '../../../widgets/buttons/button'

import {Board} from '../../../blocks/board'
import {Card} from '../../../blocks/card'
import {IUser} from '../../../user'
import {getMe} from '../../../store/users'
import {useAppSelector} from '../../../store/hooks'
import api from '../apiClient'
import ConfirmationDialogBox, {ConfirmationDialogBoxProps} from '../../confirmationDialogBox'
import { sendFlashMessage } from '../../flashMessages'

interface Props {
    board: Board,
    card: Card,
}

//add points card property
const pointsOptions = [
    {value : '', label:'No Estimate'},
    {value : '0', label:'0 ⚆ ⚆ ⚆ ⚆ ⚆'},
    {value : '1', label:'1 ⚈ ⚆ ⚆ ⚆ ⚆'},
    {value : '2', label:'2 ⚈ ⚈ ⚆ ⚆ ⚆'},
    {value : '3', label:'3 ⚈ ⚈ ⚈ ⚆ ⚆'},
    {value : '4', label:'4 ⚈ ⚈ ⚈ ⚈ ⚆'},
    {value : '5', label:'5 ⚈ ⚈ ⚈ ⚈ ⚈'},
]


const ItpCardProperty = ({ card }:Props) => {
    const me = useAppSelector<IUser|null>(getMe)
    const [pointValue,SetPointValue] = useState<number | null>(null)
    const [estimatedTime,SetEstimatedTime] = useState<number | null>(null)
    const [confirmationDialogBox, setConfirmationDialogBox] = useState<ConfirmationDialogBoxProps>({heading: '', onConfirm: () => {}, onClose: () => {}})
    const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false)
    const [estimatedHoursStatus, setEstimatedHoursStatus] = useState<boolean>(false)
    const intl = useIntl()
    interface Response {
        status:boolean,
        task_points:number,
        value:any,
        estimated_hours:any
    }


    const fetchItpCardProperty = async() => {

        const response = await api.get<Response>(
            '/card-property?board_id='+card.boardId+'&card_id='+card.id+'&user_id='+me?.id+'&action=getItpCardProperties'
        )
    
        if(response.status){

            SetPointValue(response.task_points)

            if(response.estimated_hours != null ) {
                SetEstimatedTime(response.estimated_hours)
                setEstimatedHoursStatus(true)
            }

        
        }

    }


    useEffect(() => {
        fetchItpCardProperty()
    },[])


    const handleOnChangedPoint = async(e:any) => {
        SetPointValue(e.target.value)
        const data = {
            'board_id':card.boardId,
            'card_id':card.id,
            'user_id':me?.id,
            'action':'addItpCardProperties',
            'point_value':e.target.value
        }
        const response = await api.post<Response>('/card-property',data)
    
        if(response.status){

            // SetPointValue(response.task_points)
        
        }
        
    }

    const addEstimatedTime = async() => {
        const data = {
            'board_id':card.boardId,
            'card_id':card.id,
            'user_id':me?.id,
            'action':'addItpEstimatedTime',
            'estimated_hours':estimatedTime
        }
        const response = await api.post<Response>('/card-property',data)
        
        if(response.status){
            setEstimatedHoursStatus(true)
            console.log(response.status + 'response timess')
            SetEstimatedTime(estimatedTime)
            // SetPointValue(response.task_points)
        
        }
        
    }

    const handleOnChangedEstimatedTime = (e:any) => {
        SetEstimatedTime(e.target.value)

    }
    const handleSetEstimateTime = () => {
        if(estimatedTime != null){
            setShowConfirmationDialog(true)
            onPropertyEstimateTimeSetAndOpenConfirmationDialog(estimatedTime)
            console.log(estimatedTime)
        }
       
    }

    function onPropertyEstimateTimeSetAndOpenConfirmationDialog(estimatedTime:number) {
        // set ConfirmationDialogBox Props
        setConfirmationDialogBox({
            heading:  'Confirm Estimated Hours',
            subText: `Are you sure you want to add the Estimated Hours as "${estimatedTime} Hours"? Confirming it will permanently add the Estimated Hours to this task.`,
            confirmButtonText: 'Confirm',

            onConfirm: async () => {
                addEstimatedTime()
                sendFlashMessage({content: intl.formatMessage({id: 'CardDetailProperty.property-changed', defaultMessage: 'Changed property successfully!'}), severity: 'high'})
                setShowConfirmationDialog(false)
                // handleTaskComplete()
                
            },

            onClose: () => setShowConfirmationDialog(false),
        })

        // open confirmation dialog property delete
        setShowConfirmationDialog(true)
    }

    return (
        <div>
            {/* Point Property */}
            <div className='octo-propertyrow'>
                <div className='octo-propertyname'><Button>Points</Button></div>
                <div>
                    <select className='Editable octo-propertyvalue propColorDefault task-reminder-selector' value={pointValue || ''} onChange={handleOnChangedPoint} >
                        {pointsOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {/* Estimated Time */}
            <div className='octo-propertyrow'>
                <div className='octo-propertyname'><Button>Estimated Hours</Button></div>
                {estimatedHoursStatus ? (
                    <div className="Person octo-propertyvalue octo-propertyvalue--readonly"><div className="Person-item">{estimatedTime}</div></div>
                ) : (
                    <div>
                        <input className="Editable octo-propertyvalue" placeholder="Empty" title="" value={estimatedTime || ''} style={{ width:' 100%'}}  onChange={handleOnChangedEstimatedTime} onBlur={handleSetEstimateTime}/>
                    </div>
                )}
                
            </div>
            {showConfirmationDialog && 
                <ConfirmationDialogBox
                    dialogBox={confirmationDialogBox}
                />
            }
            
        </div>



    )

}

export default ItpCardProperty
