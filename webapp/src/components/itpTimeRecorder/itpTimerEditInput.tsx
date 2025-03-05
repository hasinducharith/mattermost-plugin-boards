// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, useEffect, useState} from 'react'

interface ItpTimerEditInputProps {
    changeRecordBtn: (message: boolean, totalMinutes: number) => void
    clearInputHM: boolean
}

const ItpTimerEditInput: FC<ItpTimerEditInputProps> = ({changeRecordBtn, clearInputHM}) => {
    const [inputHours, setHours] = useState(0)
    const [inputMins, setMins] = useState(0)

    const HandleInputHours = (e: any) => {
        if (e.target.value === '') {
            setHours(0)
        } else {
            setHours(e.target.value)
        }
    }

    const HandleInputMins = (e: any) => {
        if (e.target.value === '') {
            setMins(0)
        } else {
            setMins(e.target.value)
        }
    }

    const selectText = (e: any) => {
        e.target.select()
    }

    useEffect(() => {
        if ((inputHours > 0) || (inputMins > 0)) {
            const totalMinutes = convertToMins(inputHours, inputMins)
            changeRecordBtn(true, totalMinutes)
        } else {
            changeRecordBtn(false, 0)
        }

        if (clearInputHM) {
            setHours(0)
            setMins(0)
        }
    }, [inputHours, inputMins, clearInputHM])

    const convertToMins = (hours: number, mins: number) => {
        const hour = parseInt(hours.toString(), 10)
        const min = parseInt(mins.toString(), 10)
        const totmins = ((hour * 60) + min)

        return totmins
    }

    function clearInputHMText() {
        setHours(0)
        setMins(0)
    }

    return (
        <div>
            <div className='hourMinuteWidget'>
                <div className='tw-duration-input'>
                    <div className='tw-duration-input__hour'>
                        <input
                            className='tw-duration-input__hour ax-duration-input__hour'
                            type='number'
                            placeholder='HH'
                            value={inputHours}
                            onChange={HandleInputHours}
                            onClick={selectText}
                        />
                        <div className='tw-duration-input__unit'>h</div>
                    </div>

                    <div className='tw-duration-input__separator'>:</div>
                    <div className='tw-duration-input__minute'>
                        <input
                            className='tw-duration-input__minute ax-duration-input__minute'
                            type='number'
                            placeholder='MM'
                            value={inputMins}
                            onChange={HandleInputMins}
                            onClick={selectText}
                        />
                        <div className='tw-duration-input__unit'>m</div>
                    </div>
                    <div className='tw-duration-input__edit-icon'>
                        <span onClick={clearInputHMText}>X</span>
                        <i
                            className='tw-icon'
                            data-icon='pen'
                        /></div>
                </div>
            </div>
        </div>
    )
}

export default ItpTimerEditInput
