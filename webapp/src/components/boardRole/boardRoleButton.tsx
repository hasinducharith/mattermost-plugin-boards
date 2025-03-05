// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react'

import Button from '../../widgets/buttons/button'
import HandRight from '../../widgets/icons/HandRight'

import './boardRoleButton.scss'
import BoardRoleDialog from './boardRole'

type Props = {
    enableSharedBoards: boolean
}
const BoardRoleButton = (props: Props) => {
    const [showBoardRoleDialog, setShowBoardRoleDialog] = useState(false)

    return (
        <div className='boardRoleButton'>
            <Button
                title='Share board'
                size='medium'
                emphasis='primary'
                icon={<HandRight/>}
                onClick={() => {
                    setShowBoardRoleDialog(!showBoardRoleDialog)
                }}
            >
                Role
            </Button>
            {showBoardRoleDialog &&
                <BoardRoleDialog
                    onClose={() => setShowBoardRoleDialog(false)}
                    enableSharedBoards={props.enableSharedBoards}
                />
            }
        </div>
    )
}
export default React.memo(BoardRoleButton)
