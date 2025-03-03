// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react'
import {useIntl} from 'react-intl'

import {IUser} from '../../user'
import {Utils} from '../../utils'
import MenuWrapper from '../../widgets/menuWrapper'
import Menu from '../../widgets/menu'
import CompassIcon from '../../widgets/icons/compassIcon'
import CheckIcon from '../../widgets/icons/check'
import './boardRoleButton.scss'
import {BoardMember} from '../../blocks/board'

interface BoardRole {
    id?: string,
    name?: string 
}

type Props = {
    user: IUser
    isMe: boolean
    teammateNameDisplay: string,
    boardRoles: BoardRole[],
    boardId: string,
    members: BoardMember[],
    adminPrev: boolean,
    onAssignRole: (boardId: string, userId: string, roleId: string) => void,
    onUpdateRole: (boardId: string, userId: string, roleId: string) => void
}

const UserBoardRoleRow = (props: Props): JSX.Element => {
    const intl = useIntl()
    const menuWrapperRef = useRef<HTMLDivElement>(null)
    const {user, isMe, teammateNameDisplay, boardRoles, boardId, adminPrev} = props
    const [currentRole, setCurrentRole] = useState("0")
    const [displayRole, setDisplayRole] = useState("None")

    const getUserBoardRole = async(userId: string, boardId: string) => {
        const response = await fetch('https://mm2kimai.itplace.io/board-role?boardId='+boardId+'&userId='+userId, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
        const data = await response.json()

        if(data.status == true && data.result.length > 0) {
            const value = data.result[0]
            setCurrentRole(value.role_id)
            setDisplayRole(value.name)
        }
    }

    useEffect(() => {
        getUserBoardRole(user.id, boardId)
    }, [])

    return (
        <div>
            <div
                className='user-item'
                ref={menuWrapperRef}
            >
                <div className='user-item__content'>
                    <div className='ml-3'>
                        <strong>{Utils.getUserDisplayName(user, teammateNameDisplay)}</strong>
                        <strong className='ml-2 text-light'>{`@${user.username}`}</strong>
                        {isMe && <strong className='ml-2 text-light'>{intl.formatMessage({id: 'ShareBoard.userPermissionsYouText', defaultMessage: '(You)'})}</strong>}
                    </div>
                </div>

                {adminPrev 
                    ?   <div>
                        <MenuWrapper>
                            <button className='user-item__button'>
                                {displayRole}
                                <CompassIcon
                                    icon='chevron-down'
                                    className='CompassIcon'
                                />
                            </button>
                            <Menu
                                position='left'
                                parentRef={menuWrapperRef}
                            >
                                {boardRoles.map((role, index) => (
                                    <Menu.Text
                                        key={index}
                                        id={role.id!}
                                        check={true}
                                        icon={currentRole == role.id ? <CheckIcon/> : <div className='empty-icon'/>}
                                        name={role.name!}
                                        onClick={() => {
                                            if(currentRole == '0'){
                                                props.onAssignRole(boardId, user.id, role.id!)
                                            }else{
                                                props.onUpdateRole(boardId, user.id, role.id!)
                                            }
                                        }}
                                    />
                                ))}
                            </Menu>
                        </MenuWrapper>
                    </div>
                    :   <div>
                        <button className='user-item__button'>
                            {displayRole}
                        </button>
                    </div>
                }
            </div>
        </div>
    )
}

export default UserBoardRoleRow
