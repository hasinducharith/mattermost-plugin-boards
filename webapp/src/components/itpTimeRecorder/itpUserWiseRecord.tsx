// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react'


interface TaskData {
  
    records:Data[],
    deleteTimeRecord:(timesheetId:number) => void;
  
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

  
const ItpUserWiseRecord = (props: TaskData) => {

    const [data,setData] = useState<Data[]>([])
    const [timesheetId,setTimesheetId] = useState(0)


    useEffect(() => {
        setData(props.records)
    },[props.records])


    const timeFormat = (seconds:number) => {

        const updatedHours = Math.floor(seconds / 3600)
        const updatedMinutes = Math.ceil((seconds % 3600) / 60)
    
        return `${String(updatedHours).padStart(2, '0')}h ${String(updatedMinutes).padStart(2, '0')}m`
    
    }


    const removeSlot = (timesheetId:number)=>{
        const confirmDelete = window.confirm("Are you sure you want to delete this time record?")
        if (confirmDelete) {
            setTimesheetId(timesheetId)

            removeRow(timesheetId)
        }
    }

    useEffect(() => {

        props.deleteTimeRecord(timesheetId)

    },[timesheetId])


    const removeRow = (idToRemove:number) => {

        setData((prevRows) => prevRows.filter((row) => row.timesheet_id !== idToRemove))
    }

    const formatDateTime = (timestamp:string) => {

        if(timestamp == '0'){
            return 'Running Task'
        }

        const date = new Date(timestamp)
  
        const year: number = date.getFullYear()
        const month: string = String(date.getMonth() + 1).padStart(2, '0')
        const day: string = String(date.getDate()).padStart(2, '0')
        const hours: string = String(date.getHours()).padStart(2, '0')
        const minutes: string = String(date.getMinutes()).padStart(2, '0')
      
        return `${year}-${month}-${day} ${hours}:${minutes}`

    }


    return (
    
        <tbody>

            {data.map((dataLine) => (
              
                <tr key={dataLine.timesheet_id}>

                    <td >{formatDateTime(dataLine.begin)}</td>
                    <td >{formatDateTime(dataLine.end)}</td>
                    <td >{timeFormat(dataLine.duration)}</td>
                    <td >
                        {dataLine.to_del === 1 && (
                            <i className="CompassIcon icon-close CloseIcon itp-delete_btn" onClick={()=>removeSlot(dataLine.timesheet_id)}></i>
                        )}
                    </td>
                </tr>

            ))}

        </tbody>

    )
}


export default ItpUserWiseRecord
