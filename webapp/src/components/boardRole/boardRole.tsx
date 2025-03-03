// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react'

import Dialog from '../dialog'
import {getMe, getBoardUsersList} from '../../store/users'
import {IUser} from '../../user'
import {useAppSelector} from '../../store/hooks'
import {ClientConfig} from '../../config/clientConfig'

import {getClientConfig} from '../../store/clientConfig'
import {getCurrentBoard, getCurrentBoardMembers} from '../../store/boards'
import {BoardMember} from '../../blocks/board'

import UserBoardRoleRow from './userBoardRoleRow'

type Props = {
    onClose: () => void
    enableSharedBoards: boolean
}

interface BoardRole {
    id?: string,
    name?: string
}

export default function BoardRoleDialog(props: Props): JSX.Element {

    const boardRoleTitle = <span>Board Role</span>
    const board = useAppSelector(getCurrentBoard)
    const boardId = board.id
    const boardUsers = useAppSelector<IUser[]>(getBoardUsersList)
    const me = useAppSelector<IUser|null>(getMe)
    const clientConfig = useAppSelector<ClientConfig>(getClientConfig)
    const [boardRoles, setBoardRoles] = useState<BoardRole[]>([]) 
    const [isAlertShow, setAlertShow] = useState(false)
    const [alertStatus, setAlertStatus] = useState(false)
    const [alertMsg, setAlertMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const members = useAppSelector<{[key: string]: BoardMember}>(getCurrentBoardMembers)
    const [isAdmin, setIsAdmin] = useState(false)
    
    const fetchBoardRoles = async() => {
        const response = await fetch('https://mm2kimai-staging.itplace.io/board-role', {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
        const data = await response.json()
        if(data.status == true && data.result.length > 0) {
            setBoardRoles(data.result)
        }else{
            console.log('No data found')
            console.log(data)
        }
    }

    const handleCreateFunction = async(boardId: string, userId: string, roleId: string) => {
        setLoading(true)
        const obj = {
            boardId: boardId,
            userId: userId,
            roleId: roleId
        }

        const response = await fetch('https://mm2kimai-staging.itplace.io/board-role', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(obj),
        })
        const data = await response.json()

        if(data){
            setLoading(false)
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

    const handleUpdateFunction = async(boardId: string, userId: string, roleId: string) => {
        setLoading(true)
        const obj = {
            boardId: boardId,
            userId: userId,
            roleId: roleId
        }

        const response = await fetch('https://mm2kimai-staging.itplace.io/board-role', {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(obj),
        })
        const data = await response.json()

        if(data){
            setLoading(false)
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

    const checkCurrentUserAdmin = (members: BoardMember[]) => {
        for (const member of members) {
            if(me?.id == member.userId && member.schemeAdmin){
                setIsAdmin(true)
            }
        }

    }

    useEffect(() => {
        fetchBoardRoles()
        checkCurrentUserAdmin(Object.values(members))
    }, [])

    return (
        <Dialog
            onClose={props.onClose}
            title={boardRoleTitle}
            className='ShareBoardDialog'
        >
            <hr />
            {loading 
                ?   <div>
                    <h4>Loading..</h4>
                </div>
                :   <div className='user-items'>
                    {boardUsers.map((user) => {
                        return (
                            <UserBoardRoleRow 
                                key={user.id}
                                user={user}
                                isMe={user.id === me?.id}
                                teammateNameDisplay={me?.props?.teammateNameDisplay || clientConfig.teammateNameDisplay}
                                boardRoles={boardRoles}
                                boardId={boardId}
                                members={Object.values(members)}
                                adminPrev={isAdmin}
                                onAssignRole={handleCreateFunction}
                                onUpdateRole={handleUpdateFunction}
                            />
                        )
                    })}
                </div>
            }
            
            {isAlertShow && (
                <div className='octo-propertyrow'>
                    <div className={'success-message-div message-div '+ (alertStatus ? 'success-message-div' : 'error-message-div') + ''}>
                        <span>{alertMsg}</span>
                    </div>
                </div>
            )}
        </Dialog>
    )
}
