// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback, useMemo} from 'react'
import {useRouteMatch} from 'react-router-dom'
import {useIntl} from 'react-intl'

import {Board, IPropertyTemplate} from '../../blocks/board'
import {Card} from '../../blocks/card'
import {useSortable} from '../../hooks/sortable'
import mutator from '../../mutator'
import TelemetryClient, {TelemetryActions, TelemetryCategory} from '../../telemetry/telemetryClient'
import {Utils} from '../../utils'
import MenuWrapper from '../../widgets/menuWrapper'
import Tooltip from '../../widgets/tooltip'
import PropertyValueElement from '../propertyValueElement'
import ConfirmationDialogBox, {ConfirmationDialogBoxProps} from '../confirmationDialogBox'
import './kanbanCard.scss'
import CardBadges from '../cardBadges'
import OpenCardTourStep from '../onboardingTour/openCard/open_card'
import CopyLinkTourStep from '../onboardingTour/copyLink/copy_link'
import CardActionsMenu from '../cardActionsMenu/cardActionsMenu'
import CardActionsMenuIcon from '../cardActionsMenu/cardActionsMenuIcon'

export const OnboardingCardClassName = 'onboardingCard'

type Props = {
    card: Card
    board: Board
    visiblePropertyTemplates: IPropertyTemplate[]
    isSelected: boolean
    visibleBadges: boolean
    onClick?: (e: React.MouseEvent, card: Card) => void
    readonly: boolean
    onDrop: (srcCard: Card, dstCard: Card) => void
    showCard: (cardId?: string) => void
    isManualSort: boolean
    hideCard:boolean
    showCardArray: any
    isSameBtn: any
}

const KanbanCard = (props: Props) => {
    const {card, board} = props
    const intl = useIntl()
    const [isDragging, isOver, cardRef] = useSortable('card', card, !props.readonly, props.onDrop)
    const visiblePropertyTemplates = props.visiblePropertyTemplates || []
    const match = useRouteMatch<{boardId: string, viewId: string, cardId?: string}>()
    let className = props.isSelected ? 'KanbanCard selected' : 'KanbanCard'
    if (props.isManualSort && isOver) {
        className += ' dragover'
    }

    const [showConfirmationDialogBox, setShowConfirmationDialogBox] = useState<boolean>(false)
    const handleDeleteCard = useCallback(() => {
        if (!card) {
            Utils.assertFailure()
            return
        }
        TelemetryClient.trackEvent(TelemetryCategory, TelemetryActions.DeleteCard, {board: board.id, card: card.id})
        mutator.deleteBlock(card, 'delete card')
    }, [card, board.id])

    const confirmDialogProps: ConfirmationDialogBoxProps = useMemo(() => {
        return {
            heading: intl.formatMessage({id: 'CardDialog.delete-confirmation-dialog-heading', defaultMessage: 'Confirm card delete!'}),
            confirmButtonText: intl.formatMessage({id: 'CardDialog.delete-confirmation-dialog-button-text', defaultMessage: 'Delete'}),
            onConfirm: handleDeleteCard,
            onClose: () => {
                setShowConfirmationDialogBox(false)
            },
        }
    }, [handleDeleteCard])

    const handleDeleteButtonOnClick = useCallback(() => {
        // user trying to delete a card with blank name
        // but content present cannot be deleted without
        // confirmation dialog
        if (card?.title === '' && card?.fields?.contentOrder?.length === 0) {
            handleDeleteCard()
            return
        }
        setShowConfirmationDialogBox(true)
    }, [handleDeleteCard, card.title, card?.fields?.contentOrder?.length])

    const handleOnClick = useCallback((e: React.MouseEvent) => {
        if (props.onClick) {
            props.onClick(e, card)
        }
    }, [props.onClick, card])

    const hideCard = props.hideCard
    const isOnboardingCard = card.title === 'Create a new card'
    const showOnboarding = isOnboardingCard && !match.params.cardId && !board.isTemplate && Utils.isFocalboardPlugin()
    let isHidden = false
    let taskCompletePropertyId = ''
    let taskCompleted = false

    // get task complete property id
    for(let i=0; i < props.board.cardProperties.length; i++)
    {
        const row = props.board.cardProperties[i]
        if(row.name == 'Task Completed' || row.name == ' Task Completed')
        {
            taskCompletePropertyId = row.id
        }
    }
    // check task card task complete true if true then hide that card
    if(card.fields.properties)
    {   
        // set completed task hides
        if(hideCard == true) 
        {
            if(card.fields.properties[taskCompletePropertyId]) 
            {
                isHidden = true
            }
        }
        // set completed task true for change card background color 
        if(card.fields.properties[taskCompletePropertyId])
        {
            taskCompleted = true
        }
    }
    // show completed task which are in column 
    if(props.showCardArray.length != 0)
    {
        if(props.showCardArray.cards.length > 0)
        {
            for(let i = 0; i < props.showCardArray.cards.length; i++)
            {
                const cards = props.showCardArray.cards[i]
                if(cards.id == card.id)
                {
                    isHidden = false
                }
            }
        }
    }
    // hide completed task which show 
    if(props.isSameBtn.length != 0) 
    {
        for(let i = 0; i < props.isSameBtn.cards.length; i++) 
        {
            const sameCardId = props.isSameBtn.cards[i].id
            for(let x = 0; x < props.showCardArray.cards.length; x++)
            {
                const showCardId = props.showCardArray.cards[x].id
                if(sameCardId == showCardId && sameCardId == card.id) 
                {
                    if(isHidden === false && card.fields.properties[taskCompletePropertyId]) 
                    {
                        isHidden = true
                    } 
                }
            }
        }
    }

    return (
        <>
            {/* check card show or hide */}
            {isHidden ? true :
                <div
                    ref={props.readonly ? () => null : cardRef}
                    className={`${className} ${showOnboarding && OnboardingCardClassName}`}
                    draggable={!props.readonly}
                    style={{opacity: isDragging ? 0.5 : 1, backgroundColor: taskCompleted ? 'silver' : '', color : taskCompleted ? 'black' : ''}}
                    onClick={handleOnClick}
                >
                    {!props.readonly &&
                    <MenuWrapper
                        className={`optionsMenu ${showOnboarding ? 'show' : ''}`}
                        stopPropagationOnToggle={true}
                    >
                        <CardActionsMenuIcon/>
                        <CardActionsMenu
                            cardId={card!.id}
                            boardId={card!.boardId}
                            onClickDelete={handleDeleteButtonOnClick}
                            onClickDuplicate={() => {
                                TelemetryClient.trackEvent(TelemetryCategory, TelemetryActions.DuplicateCard, {board: board.id, card: card.id})
                                mutator.duplicateCard(
                                    card.id,
                                    board.id,
                                    false,
                                    'duplicate card',
                                    false,
                                    {},
                                    async (newCardId) => {
                                        props.showCard(newCardId)
                                    },
                                    async () => {
                                        props.showCard(undefined)
                                    },
                                )
                            }}
                        />
                    </MenuWrapper>
                    }

                    <div className='octo-icontitle'>
                        { card.fields.icon ? <div className='octo-icon'>{card.fields.icon}</div> : undefined }
                        <div
                            key='__title'
                            className='octo-titletext'
                        >
                            {card.title || intl.formatMessage({id: 'KanbanCard.untitled', defaultMessage: 'Untitled'})}
                        </div>
                    </div>
                    {visiblePropertyTemplates.map((template) => (
                        <Tooltip
                            key={template.id}
                            title={template.name}
                        >
                            <PropertyValueElement
                                board={board}
                                readOnly={true}
                                card={card}
                                propertyTemplate={template}
                                showEmptyPlaceholder={false}
                            />
                        </Tooltip>
                    ))}
                    {props.visibleBadges && <CardBadges card={card}/>}
                    {showOnboarding && !match.params.cardId && <OpenCardTourStep/>}
                    {showOnboarding && !match.params.cardId && <CopyLinkTourStep/>}
                </div>
            }

            {showConfirmationDialogBox && <ConfirmationDialogBox dialogBox={confirmDialogProps}/>}

        </>
    )
}

export default React.memo(KanbanCard)
