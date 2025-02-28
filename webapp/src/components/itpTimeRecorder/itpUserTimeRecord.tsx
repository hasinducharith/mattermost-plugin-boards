// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react'

import {Utils} from '../../utils'

interface Paras {
    username: string,
    timerecord:string,
    userid:number,
    mm_name:string
  
}
  

//   const getTimeRecordsPerUser = (userid:number) =>{

//   }

const ItpUserTimeRecord = (props:Paras) => {
    return (
        <div className='prof-timerecord'>
            <div className='prof-container' >
                {/* //profile img */}
                <div className='prof-user'>
                    <div className='prof-image'>

                        {Utils.isFocalboardPlugin() &&
                        <img
                            src={Utils.getProfilePicture(props.mm_name)}
                            className='user-item__img'
                        />
                        }
                    </div>
                    <div className='prof-name'>
                        {props.username}
                    </div>
                </div>
                <div className='prof-detail'>
                    <div className='prof-time'>
                        {props.timerecord}
                    </div>
                    <div className='prof-arrow'>
                        <i className="CompassIcon icon-chevron-right"></i>
                    </div>
                </div>  
            </div>
        </div>
    )
}

export default ItpUserTimeRecord
