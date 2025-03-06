// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, useState} from 'react'
import {useIntl, FormattedMessage} from 'react-intl'

import {getChannelsNameMapInTeam} from 'mattermost-redux/selectors/entities/channels'

import {Provider} from 'react-redux'

import {Block} from '../../blocks/block'
import mutator from '../../mutator'
import {Utils} from '../../utils'
import IconButton from '../../widgets/buttons/iconButton'
import DeleteIcon from '../../widgets/icons/delete'
import OptionsIcon from '../../widgets/icons/options'
import Menu from '../../widgets/menu'
import MenuWrapper from '../../widgets/menuWrapper'
import {getUser, getMe} from '../../store/users'
import {useAppSelector} from '../../store/hooks'
import Tooltip from '../../widgets/tooltip'
import GuestBadge from '../../widgets/guestBadge'

import './comment.scss'
import {formatText, messageHtmlToComponent} from '../../webapp_globals'
import {getCurrentTeam} from '../../store/teams'
import AttachmentElement from '../../components/content/attachmentElement'
import {createAttachmentBlock} from '../../blocks/attachmentBlock'

import EditIcon from '../../widgets/icons/edit'
import {MarkdownEditor} from '../../components/markdownEditor'
import {IUser} from '../../user'
import Button from '../../widgets/buttons/button'
import {createCommentBlock} from '../../blocks/commentBlock'


type Props = {
    comment: Block
    userId: string
    userImageUrl: string
    readonly: boolean
    boardId: string
    cardId: string
    onDelete: (block: Block) => void
}

const Comment: FC<Props> = (props: Props) => {
    const {comment, userId, userImageUrl, onDelete} = props
    const intl = useIntl()
    const user = useAppSelector(getUser(userId))
    const date = new Date(comment.createAt)
    const attachmentBlock = createAttachmentBlock(props.comment)
    const me = useAppSelector<IUser|null>(getMe)
    const [currentComment, setCurrentComment] = useState('')
    const [updatedComment, setUpdatedComment] = useState('')

    const selectedTeam = useAppSelector(getCurrentTeam)
    const channelNamesMap =  getChannelsNameMapInTeam((window as any).store.getState(), selectedTeam!.id)

    const formattedText = 
    <Provider store={(window as any).store}>
        {messageHtmlToComponent(formatText(comment.title, {
            atMentions: true,
            team: selectedTeam,
            channelNamesMap,
        }), {
            fetchMissingUsers: true, 
        })}
    </Provider>

    const onUpdateClicked = () => {
        const commentText = updatedComment

        if(commentText) {

            const {cardId} = props
            Utils.log(`Update comment: ${commentText}`)
            Utils.assertValue(cardId)
            const newComment = createCommentBlock()
            // set the new comment block 
            newComment.id = comment.id
            newComment.boardId = comment.boardId
            newComment.parentId = comment.parentId
            newComment.title = commentText
            newComment.createdBy = comment.createdBy
            newComment.createAt = comment.createAt
            newComment.modifiedBy = comment.modifiedBy

            mutator.updateBlock(comment.boardId,newComment,comment,'update')
            setCurrentComment('')
            setUpdatedComment('')
        }
    }

    const updateCommentComponent = (
        <div className='CommentsList__new'>
            <MarkdownEditor
                className='newcomment'
                text={currentComment}
                placeholderText={intl.formatMessage({id: 'CardDetail.new-comment-placeholder', defaultMessage: 'Update the comment...'})}
                onChange={(value: string) => {
                    if (currentComment !== value) {
                        setUpdatedComment(value)
                    }
                }}
            />

            {currentComment &&
                <Button
                    filled={true}
                    onClick={onUpdateClicked}
                >
                    <FormattedMessage
                        id='CommentsList.update'
                        defaultMessage='Update'
                    />
                </Button>
            }
        </div>
    )

    return (
        <div
            className=''
        >
            {props.comment.type == 'comment' ? (
                <div
                    key={comment.id}
                    className='Comment comment'
                >
                    <div className='comment-header'>
                        <img
                            className='comment-avatar'
                            src={userImageUrl}
                        />
                        <div className='comment-username'>{user?.username}</div>
                        <GuestBadge show={user?.is_guest}/>

                        <Tooltip title={Utils.displayDateTime(date, intl)}>
                            <div className='comment-date'>
                                {Utils.relativeDisplayDateTime(date, intl)}
                            </div>
                        </Tooltip>

                        {!props.readonly && (
                            <MenuWrapper>
                                <IconButton icon={<OptionsIcon/>}/>
                                <Menu position='left'>
                                    <Menu.Text
                                        icon={<DeleteIcon/>}
                                        id='delete'
                                        name={intl.formatMessage({id: 'Comment.delete', defaultMessage: 'Delete'})}
                                        onClick={() => mutator.deleteBlock(comment)}
                                    />
                                    {comment.modifiedBy == me?.id && (
                                        <Menu.Text 
                                            icon={<EditIcon/>}
                                            id='edit'
                                            name='Edit'
                                            onClick={() => {
                                                setCurrentComment(comment.title)
                                            }}
                                        />
                                    )}
                                </Menu>
                            </MenuWrapper>
                        )}
                    </div>
                    {!currentComment ?
                        (
                            <div className='comment-markdown'>
                                {formattedText}
                            </div>
                        )
                        :
                        (
                            updateCommentComponent
                        )
                    }

                </div>
            ) : (
                <div className="attachemnt-section">
                    <div
                        key={comment.id}
                        className='Comment comment'
                    >
                        <div className='comment-header'>
                            <img
                                className='comment-avatar'
                                src={userImageUrl}
                            />
                            <div className='comment-username'>{user?.username}</div>
                            <GuestBadge show={user?.is_guest}/>
            
                            <Tooltip title={Utils.displayDateTime(date, intl)}>
                                <div className='comment-date'>
                                    {Utils.relativeDisplayDateTime(date, intl)}
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <div className='Attachment'>
                        <div className='attachment-content'>
                            <div key={props.comment.id}>
                                <AttachmentElement
                                    block={attachmentBlock}
                                    onDelete={onDelete}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Comment
