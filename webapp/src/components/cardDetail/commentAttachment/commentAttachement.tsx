// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react'
import {useIntl} from 'react-intl'

import mutator from '../../../mutator'
import {useAppDispatch,useAppSelector} from '../../../store/hooks'
import {Utils} from '../../../utils'
import Button from '../../../widgets/buttons/button'

import {AttachmentBlock, createAttachmentBlock} from '../../../blocks/attachmentBlock'
import CompassIcon from '../../../widgets/icons/compassIcon'

import {Block, createBlock} from '../../../blocks/block'
import {updateAttachments, updateUploadPrecent} from '../../../store/attachments'
import {getClientConfig} from '../../../store/clientConfig'
import {sendFlashMessage} from '../../../components/flashMessages'
import octoClient from '../../../octoClient'

type Props = {
    boardId: string
    cardId: string
}

const CommentAttachment = (props: Props) => {
    const clientConfig = useAppSelector(getClientConfig)
    const intl = useIntl()
    const dispatch = useAppDispatch()

    const removeUploadingAttachment = (uploadingBlock: Block) => {
        uploadingBlock.deleteAt = 1
        const removeUploadingAttachmentBlock = createAttachmentBlock(uploadingBlock)
        dispatch(updateAttachments([removeUploadingAttachmentBlock]))
    }

    const selectAttachment = (boardId: string) => {
        return new Promise<AttachmentBlock>(
            (resolve) => {
                Utils.selectLocalFile(async (attachment) => {
                    const uploadingBlock = createBlock()
                    uploadingBlock.title = attachment.name
                    uploadingBlock.fields.fileId = attachment.name
                    uploadingBlock.boardId = boardId
                    if (props.cardId) {
                        uploadingBlock.parentId = props.cardId
                    }
                    const attachmentBlock = createAttachmentBlock(uploadingBlock)
                    attachmentBlock.isUploading = true
                    dispatch(updateAttachments([attachmentBlock]))
                    if(attachment.size > clientConfig.maxFileSize && Utils.isFocalboardPlugin()) {
                        console.log('innnnn **  ')
                        console.log(attachment.size)
                        console.log(clientConfig.maxFileSize)
                        removeUploadingAttachment(uploadingBlock)
                        sendFlashMessage({content: intl.formatMessage({id: 'AttachmentBlock.failed', defaultMessage: "This file couldn't be uploaded as the file size limit has been reached."}), severity: 'normal'})
                    } else {
                        console.log('kkkkkk')
                        sendFlashMessage({content: intl.formatMessage({id: 'AttachmentBlock.upload', defaultMessage: 'Attachment uploading.'}), severity: 'normal'})
                        const xhr = await octoClient.uploadAttachment(boardId, attachment)
                        if(xhr) {
                            xhr.upload.onprogress = (event) => {
                                const percent = Math.floor((event.loaded / event.total) * 100)
                                dispatch(updateUploadPrecent({
                                    blockId: attachmentBlock.id,
                                    uploadPercent: percent,
                                }))
                            }
                            xhr.onload = () => {
                                if(xhr.status === 200 && xhr.readyState === 4) {
                                    const json = JSON.parse(xhr.response)
                                    const fileId = json.fileId
                                    if(fileId) {
                                        removeUploadingAttachment(uploadingBlock)
                                        const block = createAttachmentBlock()
                                        block.fields.fileId = fileId || ''
                                        block.title = attachment.name
                                        sendFlashMessage({content: intl.formatMessage({id: 'AttachmentBlock.uploadSuccess', defaultMessage: 'Attachment uploaded.'}), severity: 'normal'})
                                        resolve(block)
                                    }else {
                                        removeUploadingAttachment(uploadingBlock)
                                        sendFlashMessage({content: intl.formatMessage({id: 'AttachmentBlock.failed', defaultMessage: "This file couldn't be uploaded as the file size limit has been reached."}), severity: 'normal'})
                                    }
                                }
                            }
                        }
                    }
                }, '')
            },
        )
    }

    const onAttachedClicked = async () => {
        const block = await selectAttachment(props.boardId)
        block.parentId = props.cardId
        block.boardId = props.boardId
        const typeName = block.type
        const description = intl.formatMessage({id: 'AttachmentBlock.addElement', defaultMessage: 'add {type}'}, {type: typeName})
        
        await mutator.insertBlock(props.boardId, block, description)
    }

    return <Button
        icon={<CompassIcon icon='paperclip'/>}
        className='cardFollowBtn cardFollowBtn--attach'
        emphasis='gray'
        size='medium'
        onClick={onAttachedClicked}
    >
        {intl.formatMessage({id: 'CardDetail.Attach', defaultMessage: 'Attach'})}
    </Button> 
}

export default CommentAttachment
