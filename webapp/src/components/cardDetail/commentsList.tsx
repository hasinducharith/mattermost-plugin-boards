// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react'
import {FormattedMessage, useIntl} from 'react-intl'

import {CommentBlock, createCommentBlock} from '../../blocks/commentBlock'
import mutator from '../../mutator'
import {useAppSelector} from '../../store/hooks'
import {Utils} from '../../utils'
import Button from '../../widgets/buttons/button'

import {MarkdownEditor} from '../markdownEditor'

import {IUser} from '../../user'
import {getMe} from '../../store/users'
import {useHasCurrentBoardPermissions} from '../../hooks/permissions'
import {Permission} from '../../constants'

import AddCommentTourStep from '../onboardingTour/addComments/addComments'

import {AttachmentBlock} from '../../blocks/attachmentBlock'
import {Block} from '../../blocks/block'

import CommentAttachment from './commentAttachment/commentAttachement'

import Comment from './comment'

import './commentsList.scss'

type Props = {
    comments: readonly CommentBlock[]
    boardId: string
    cardId: string
    readonly: boolean
    attachments: AttachmentBlock[]
    onDelete: (block: Block) => void
    addAttachment: () => void
}

const CommentsList = (props: Props) => {
    const {onDelete} = props
    const [newComment, setNewComment] = useState('')
    const me = useAppSelector<IUser|null>(getMe)
    const canDeleteOthersComments = useHasCurrentBoardPermissions([Permission.DeleteOthersComments])

    const onSendClicked = () => {
        const commentText = newComment
        if (commentText) {
            const {cardId, boardId} = props
            Utils.log(`Send comment: ${commentText}`)
            Utils.assertValue(cardId)

            const comment = createCommentBlock()
            comment.parentId = cardId
            comment.boardId = boardId
            comment.title = commentText
            mutator.insertBlock(boardId, comment, 'add comment')
            setNewComment('')
        }
    }

    const {comments} = props
    const intl = useIntl()

    const attachment = props.attachments

    const newCommentComponent = (
        <div className='CommentsList__new'>
            <img
                className='comment-avatar'
                src={Utils.getProfilePicture(me?.id)}
            />
            <MarkdownEditor
                className='newcomment'
                text={newComment}
                placeholderText={intl.formatMessage({id: 'CardDetail.new-comment-placeholder', defaultMessage: 'Add a comment...'})}
                onChange={(value: string) => {
                    if (newComment !== value) {
                        setNewComment(value)
                    }
                }}
            />

            {newComment &&
            <Button
                filled={true}
                onClick={onSendClicked}
            >
                <FormattedMessage
                    id='CommentsList.send'
                    defaultMessage='Send'
                />
            </Button>
            }

            {/* comment attachment upload component  */}
            <CommentAttachment
                boardId={props.boardId}
                cardId={props.cardId}
            />

            <AddCommentTourStep/>
        </div>
    )

    const newOrderArray = []
    const usedFilesArray: AttachmentBlock[] = []

    if(comments.length > 0) {
        for(let x=0; x < comments.length; x++) {
            const comment = comments[x]
            const fileArray = []
            const commentDate = new Date(comment.createAt)

            if(attachment.length > 0) {
                for(let i=0; i< attachment.length; i++) {
                    const file = attachment[i]
                    const fileDate = new Date(file.createAt)

                    if(commentDate > fileDate){
                        if(usedFilesArray.length == 0) {
                            fileArray.push(file)
                            usedFilesArray.push(file)
                        }else {
                            if(usedFilesArray.includes(file) == false) {
                                fileArray.push(file)
                                usedFilesArray.push(file)
                            }
                        }
                    }
                }

                if((comments.length -1) == x) {
                    if(usedFilesArray.length != attachment.length){
                        for(let i=0; i< attachment.length; i++) {
                            const file = attachment[i]
                            if(usedFilesArray.includes(file) == false) {
                                fileArray.push(file)
                                usedFilesArray.push(file)
                            }
                        }
                    }
                    if(fileArray.length > 0) {
                        let addedLastComment = 0
                        for(let z=0; z < fileArray.length; z++){
                            const fileCreateAt = new Date(fileArray[z].createAt)
                            if(commentDate < fileCreateAt){
                                if(addedLastComment == 0){
                                    newOrderArray.push(comment)
                                    addedLastComment = addedLastComment +1
                                }
                            }
                            newOrderArray.push(fileArray[z])
                            if(z == (fileArray.length -1)){
                                if(addedLastComment == 0) {
                                    newOrderArray.push(comment)
                                }
                            }
                        }
                    }else {
                        newOrderArray.push(comment)
                    }
                }else {
                    if(fileArray.length > 0) {
                        for(let z=0; z < fileArray.length; z++){
                            newOrderArray.push(fileArray[z])
                        }
                        newOrderArray.push(comment)
                    }else {
                        newOrderArray.push(comment)
                    }
                }
            } else {
                newOrderArray.push(comment)
            }
        }
    } else if(attachment.length > 0) {
        for(let i=0; i< attachment.length; i++) {
            const file = attachment[i]
            newOrderArray.push(file)
        }
    }

    return (
        <div className='CommentsList'>
            {/* New comment */}
            {!props.readonly && newCommentComponent}

            {newOrderArray.slice(0).reverse().map((comment) => {
                // Only modify _own_ comments, EXCEPT for Admins, which can delete _any_ comment
                // NOTE: editing comments will exist in the future (in addition to deleting)
                const canDeleteComment: boolean = canDeleteOthersComments || me?.id === comment.modifiedBy
                return (
                    <Comment
                        key={comment.id}
                        comment={comment}
                        userImageUrl={Utils.getProfilePicture(comment.modifiedBy)}
                        userId={comment.modifiedBy}
                        readonly={props.readonly || !canDeleteComment}
                        boardId={props.boardId}
                        cardId={props.cardId}
                        onDelete={onDelete}
                    />
                )
            })}

            {/* horizontal divider below comments */}
            {!(comments.length === 0 && props.readonly) && <hr className='CommentsList__divider'/>}
        </div>
    )
}

export default React.memo(CommentsList)
