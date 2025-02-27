// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useRef } from 'react'
import {useIntl} from 'react-intl'
import {useHotkeys} from 'react-hotkeys-hook'

import IconButton from '../../../src/widgets/buttons/iconButton'
import CloseIcon from '../../../src/widgets/icons/close'
import OptionsIcon from '../../../src/widgets/icons/options'
import MenuWrapper from '../../../src/widgets/menuWrapper'
import './itpTimerDialog.scss'


type Props = {
}

const itpTimerDialog = (props: Props) => {
    const intl = useIntl()

    const closeDialogText = intl.formatMessage({
        id: 'Dialog.closeDialog',
        defaultMessage: 'Close dialog',
    })



    const isBackdropClickedRef = useRef(false)

    return (
        <div className={`Dialog_itp dialog-back size--small`}>
            <div>
                <div
                    className='itp_wrapper'
                    onClick={(e) => {
                        e.stopPropagation()
                        if (!isBackdropClickedRef.current) {
                            return
                        }
                        isBackdropClickedRef.current = false
                    }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            isBackdropClickedRef.current = true
                        }
                    }}
                >
                    <div
                        role='dialog'
                        className='itp_dialog'
                    > 
                        <div className='toolbar'>
                            <h5 className='itp-dialog-title'>Time Recorded</h5>
                            <div className='itp-toolbar--right'>
                                <IconButton
                                    className='dialog__close'
                                    icon={<CloseIcon/>}
                                    title='Close'
                                    size='medium'
                                />
                            </div>
                        </div>
                        <button className='Button emphasis--primary startBtn size--medium' ><i className="CompassIcon icon-play"></i>Start Recording</button> 
                    
                    </div>
                </div>
            </div>
        </div>
    )
}

export default React.memo(itpTimerDialog)
