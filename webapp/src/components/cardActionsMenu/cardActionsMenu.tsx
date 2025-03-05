// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.


import React, {ReactNode, useEffect, useState} from 'react'
import {useIntl} from 'react-intl'

import DeleteIcon from '../../widgets/icons/delete'
import Menu from '../../widgets/menu'
import BoardPermissionGate from '../permissions/boardPermissionGate'
import DuplicateIcon from '../../widgets/icons/duplicate'
import LinkIcon from '../../widgets/icons/Link'
import {Utils} from '../../utils'
import {Permission} from '../../constants'
import {sendFlashMessage} from '../flashMessages'
import {IUser} from '../../user'
import {getMe} from '../../store/users'
import {useAppSelector} from '../../store/hooks'
import TelemetryClient, {TelemetryActions, TelemetryCategory} from '../../telemetry/telemetryClient'

import CheckIcon from '../../widgets/icons/checkIcon'
import Update from '../../widgets/icons/update'
import octoClient from '../../octoClient'

type Props = {
    cardId: string
    boardId: string
    onClickDelete: () => void
    onClickDuplicate?: () => void
    children?: ReactNode
}

export const CardActionsMenu = (props: Props): JSX.Element => {
    const {cardId} = props

    const me = useAppSelector<IUser|null>(getMe)
    const intl = useIntl()

    // task completed status 
    const [taskStatus, setTaskStatus] = useState('loading')

    const handleDeleteCard = () => {
        TelemetryClient.trackEvent(TelemetryCategory, TelemetryActions.DeleteCard, {board: props.boardId, card: props.cardId})
        props.onClickDelete()
    }

    const handleDuplicateCard = () => {
        if (props.onClickDuplicate) {
            TelemetryClient.trackEvent(TelemetryCategory, TelemetryActions.DuplicateCard, {board: props.boardId, card: props.cardId})
            props.onClickDuplicate()
        }
    }

    // task completed by click menu 
    const handleTaskComplete = async() => {
        const cardDetail = await octoClient.getBlocksWithBlockID(props.cardId,props.boardId)
        const boardDetail = await octoClient.getBoard(props.boardId)
        let taskCompletePropertyId = ''
        // get task completed property id 
        if(boardDetail && boardDetail.cardProperties.length > 0) {
            for(let i=0; i < boardDetail.cardProperties.length; i++){
                const property = boardDetail.cardProperties[i]
                if(property.name == "Task Completed" || property.name == " Task Completed"){  
                    taskCompletePropertyId = property.id
                }
            }
        }
        // update task options 
        if(cardDetail && cardDetail.length > 0){
            const cardProperty = cardDetail[0].fields.properties

            if(cardProperty[taskCompletePropertyId]){
                delete cardProperty[taskCompletePropertyId]
            }else if(taskCompletePropertyId){
                cardProperty[taskCompletePropertyId] = 'true'
            }

            if(cardProperty){
                const finalArray = {
                    updatedFields: {
                        properties: cardProperty
                    },
                    deletedFields: [],
                }
                await octoClient.patchBlock(props.boardId,props.cardId,finalArray)
            }
        }
    }

    const getTaskStatus = async() => {
        const cardDetail = await octoClient.getBlocksWithBlockID(props.cardId,props.boardId)
        const boardDetail = await octoClient.getBoard(props.boardId)
        let taskCompletePropertyId = ''
        // get task completed property id 
        if(boardDetail && boardDetail.cardProperties.length > 0) {
            for(let i=0; i < boardDetail.cardProperties.length; i++){
                const property = boardDetail.cardProperties[i]
                if(property.name == "Task Completed" || property.name == " Task Completed"){  
                    taskCompletePropertyId = property.id
                }
            }
        }
        // update task options 
        if(cardDetail && cardDetail.length > 0){
            const cardProperty = cardDetail[0].fields.properties

            if(cardProperty[taskCompletePropertyId] == 'true'){
                setTaskStatus('inactive')
            }else{
                setTaskStatus('active')
            }
        }
    }

    useEffect(() => {
        getTaskStatus()
    }, [])

    return (
        <Menu position='left'>
            <BoardPermissionGate permissions={[Permission.ManageBoardCards]}>
                <Menu.Text
                    icon={<DeleteIcon/>}
                    id='delete'
                    name={intl.formatMessage({id: 'CardActionsMenu.delete', defaultMessage: 'Delete'})}
                    onClick={handleDeleteCard}
                />
                {props.onClickDuplicate &&
                <Menu.Text
                    icon={<DuplicateIcon/>}
                    id='duplicate'
                    name={intl.formatMessage({id: 'CardActionsMenu.duplicate', defaultMessage: 'Duplicate'})}
                    onClick={handleDuplicateCard}
                />}
                {taskStatus === 'inactive' &&
                <Menu.Text
                    icon={<Update/>}
                    id='taskCompelet'
                    name={intl.formatMessage({id: 'CardActionsMenu.taskComplete', defaultMessage: 'Undo Task Complete'})}
                    onClick={handleTaskComplete}
                />
                }
                {taskStatus === 'active' &&
                <Menu.Text
                    icon={<CheckIcon/>}
                    id='taskCompelet'
                    name={intl.formatMessage({id: 'CardActionsMenu.taskComplete', defaultMessage: 'Task Complete'})}
                    onClick={handleTaskComplete}
                />
                }
            </BoardPermissionGate>
            {me?.id !== 'single-user' &&
                <Menu.Text
                    icon={<LinkIcon/>}
                    id='copy'
                    name={intl.formatMessage({id: 'CardActionsMenu.copyLink', defaultMessage: 'Copy link'})}
                    onClick={() => {
                        let cardLink = window.location.href

                        if (!cardLink.includes(cardId)) {
                            cardLink += `/${cardId}`
                        }

                        Utils.copyTextToClipboard(cardLink)
                        sendFlashMessage({content: intl.formatMessage({id: 'CardActionsMenu.copiedLink', defaultMessage: 'Copied!'}), severity: 'high'})
                    }}
                />
            }
            {props.children}
        </Menu>
    )
}

export default CardActionsMenu
