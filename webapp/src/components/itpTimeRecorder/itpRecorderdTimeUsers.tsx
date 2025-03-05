// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useEffect, useState } from 'react'

import ItpUserTimeRecord from './itpUserTimeRecord'

interface TaskData {
    cardId: string;
    loadTimeRecords: (message: boolean,userid: number) => void;
    records:Record[],
    recordsLoader:boolean

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



const ItpRecorderdTimeUsers = (props: TaskData) => {
    const [cardId] = useState(props.cardId)
    const [recordsdata, setRecords] = useState<Record[]>([])
    const [recordData, setRecordData] = useState(false)
    const [userId, setUserId] = useState(0)

 

    const timeFormat = (seconds:number) => {

        const updatedHours = Math.floor(seconds / 3600)
        const updatedMinutes = Math.ceil((seconds % 3600) / 60)

        return `${String(updatedHours).padStart(2, '0')}h ${String(updatedMinutes).padStart(2, '0')}m`

    }

    const getTimeRecordsPerUser = (userId:any) => {
        setRecordData(true)
        setUserId(userId)
    }

    useEffect(() => {

        setRecords(props.records)

        if(recordData){
            props.loadTimeRecords(true,userId)
        }

    
    }, [cardId,recordData,props.records])

    return (
        <div>
            <div className='titleHistoryView'>
                        Recorded Time
            </div>
            <div className='item1'></div>
            <div className='item2 timeRecordiv'>
                <table className='timeRecordTable'>
                    <tbody>
                        {
                            props.recordsLoader ? (
                                <tr>
                                    <td>Loading...</td>
                                </tr>

                            ) : 
                                recordsdata.length > 0  ? (

                                    recordsdata.map((record, index) => (
                  
                                        <tr key={index}>
                                            <td onClick={()=>getTimeRecordsPerUser(record.userId)}>
                                                <ItpUserTimeRecord  username={record.username} timerecord={timeFormat(record.duration)}  userid={record.userId} mm_name={record.mm_name} />
                                            </td>
                                        </tr>
                                    ))
  
                                ):(
  
                                    <tr>
                                        <td>No Record Found</td>
                                    </tr>
  
                                )
              
                        }


                        {/* {
              recordsdata.length > 0  ? (

                recordsdata.map((record, index) => (
                
                  <tr key={index}>
                    <td onClick={()=>getTimeRecordsPerUser(record.userId)}>
                      <ItpUserTimeRecord  username={record.username} timerecord={timeFormat(record.duration)}  userid={record.userId} mm_name={record.mm_name} />
                      </td>
                  </tr>
                ))

                ):(

                  <tr>
                      <td>No Record Found</td>
                  </tr>

              )
            } */}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ItpRecorderdTimeUsers
