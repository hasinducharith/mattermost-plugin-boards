// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useEffect, useState } from 'react'

import {useAppDispatch, useAppSelector} from '../../../src/store/hooks'
import {getDocumentViwerUrl, setDocumentViwerUrl, getDocumentViwerType, setDocumentViwerType, getDocumentLoading} from '../../../../webapp/src/store/boards'
import './fullViewer.scss'

const FullViewer = ()  => {
    const dispatch = useAppDispatch()
    const documentUrl:string = useAppSelector(getDocumentViwerUrl)
    const documentType:string = useAppSelector(getDocumentViwerType)
    const [isShown, setIsShown] = useState(false)
    const [url, setUrl] = useState<string>()
    const [isImage, setIsImage] = useState<boolean>(false)
    const [isVideo, setIsVideo] = useState<boolean>(false)
    const loading:boolean = useAppSelector(getDocumentLoading)


    const handleCloseBtn = () => {
        setIsShown(false)
        setIsImage(false)
        setIsVideo(false)
        dispatch(setDocumentViwerUrl(""))
        dispatch(setDocumentViwerType(""))
    }

    useEffect(() => {
        if(documentType == 'img'){
            setUrl(documentUrl)
            setIsShown(true)
            setIsImage(true)
        }else if(documentType == 'vid'){
            setUrl(documentUrl)
            setIsShown(true)
            setIsVideo(true)
        }

    }, [documentType, documentUrl])

    return (
        
        <div>
            {isShown && (
                <div 
                    className="full-image-view-container"
                >
                    <div 
                        className="top-bar"
                    >
                        <button onClick={handleCloseBtn}>X</button>
                    </div>

                    {isImage && (
                        <div 
                            className="image-content-box"
                        >
                            <img src={url} alt="" />
                        </div>
                    )}  

                    { isVideo && (
                        <div
                            className="video-content-box"
                        >
                            <video
                                controls={true}
                                className='VideoViewr'
                                data-testid='video'
                            >
                                <source src={url}/>
                            </video>
                        </div>
                    )}
                </div>
            )}

            {loading && (
                <div className="loader-container">
                    <div className='loader'></div>
                </div>                
            )}

        </div>
    
    )
}

export default FullViewer
