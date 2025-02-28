// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react'

import ItpUserWiseRecord from './itpUserWiseRecord'

interface TaskData {
    setBackUserList: (message: boolean) => void;
    records:Record[],
    userIdRecord:number,
    removeSlot:(timesheet_id:number) => void

}

interface Record {
    username: string;
    duration: number;
    userId: number;
    mm_name: string;
    data: Data[];
    timesheet_id: number;
    km_user_id:number
    // Add other properties as needed
}

interface Data {
    begin: string;
    duration: number;
    end:string;
    mm_user_id: string;
    task_id: number;
    timesheet_id: number;
    userId: number;
    user_name: string;
    to_del: number;
    // Add other properties as needed
}


const ItpRecordedTimes = (props: TaskData) => {

    const [backToUser,setBackUser] = useState(false)
    const [userData,setUserData] = useState<Record[]>([])
    const [timesheetId,setTimesheetId] = useState(0)

    const backToUserList = () => {
        setBackUser(true)
    }

    useEffect(() => {

        if(backToUser){
            props.setBackUserList(true)
        }

        const filteredData = props.records.filter((item) => item.userId === props.userIdRecord)
        setUserData(filteredData)
        if(timesheetId !== 0){
            props.removeSlot(timesheetId)
        }
    

    }, [backToUser,timesheetId])

    const deleteTimeRecord = (timesheetId:number) => {
        setTimesheetId(timesheetId)
    }

    return (
        <>
            <div className='titleHistoryView'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button className='Button' onClick={backToUserList}>
                        <i className="CompassIcon icon-chevron-left"></i>
                    </button> <span>Recorded Time</span>
                </div>
            </div>
            <div className='titleHistorydetials' >
      
                <table  className='timeRecordBreakTable'>
                    <thead>
                        <tr>
                            <th className='prof-name'>Start</th>
                            <th className='prof-name'>End</th>
                            <th className='prof-name'>Duration</th>
                            <th className='prof-name'></th>
                        </tr>
                    </thead>
                    {userData.map((record) => (
                        <ItpUserWiseRecord records={record.data} deleteTimeRecord={deleteTimeRecord}/>
                    ))}
                </table>
            </div>
        </>
    )
}
export default ItpRecordedTimes
