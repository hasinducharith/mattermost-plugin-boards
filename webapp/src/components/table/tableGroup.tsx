// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react'

import {useDrop} from 'react-dnd'

import {Board, IPropertyOption, IPropertyTemplate, BoardGroup} from '../../blocks/board'
import {BoardView} from '../../blocks/boardView'
import {Card} from '../../blocks/card'

import TableGroupHeaderRow from './tableGroupHeaderRow'
import TableRows from './tableRows'

type Props = {
    board: Board
    activeView: BoardView
    groupByProperty?: IPropertyTemplate
    group: BoardGroup
    readonly: boolean
    selectedCardIds: string[]
    cardIdToFocusOnRender: string
    hideGroup: (groupByOptionId: string) => void
    addCard: (groupByOptionId?: string) => Promise<void>
    showCard: (cardId?: string) => void
    propertyNameChanged: (option: IPropertyOption, text: string) => Promise<void>
    onCardClicked: (e: React.MouseEvent, card: Card) => void
    onDropToGroupHeader: (srcOption: IPropertyOption, dstOption?: IPropertyOption) => void
    onDropToCard: (srcCard: Card, dstCard: Card) => void
    onDropToGroup: (srcCard: Card, groupID: string, dstCardID: string) => void
}

const TableGroup = (props: Props): JSX.Element => {
    const {board, activeView, group, onDropToGroup, groupByProperty} = props
    const groupId = group.option.id
    const [isCompleted, setCompleted] = useState(false)
    let taskCompletePropertyId = ''
    let count = 0

    const [{isOver}, drop] = useDrop(() => ({
        accept: 'card',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
        drop: (item: Card, monitor) => {
            if (monitor.isOver({shallow: true})) {
                onDropToGroup(item, groupId, '')
            }
        },
    }), [onDropToGroup, groupId])

    let className = 'octo-table-group'
    if (isOver) {
        className += ' dragover'
    }

    const hideCompletedTask = (isCompleted : boolean) => {
        if(isCompleted == false){
            setCompleted(true)
        }else{
            setCompleted(false)
        }        
    }

    // get task complete property id 
    for(let i=0; i < props.board.cardProperties.length; i++){
        const row = props.board.cardProperties[i]
        if(row.name == "Task Completed" || row.name == " Task Completed"){
            taskCompletePropertyId = row.id
        }
    }

    return (
        <div
            ref={drop}
            className={className}
            key={group.option.id}
        >

            {
                group.cards.map((card) => {
                    if(card.fields.properties){
                        if(card.fields.properties[taskCompletePropertyId]){
                            count++
                        }
                    }
                })
            }

            <TableGroupHeaderRow
                group={group}
                board={board}
                activeView={activeView}
                groupByProperty={groupByProperty}
                hideGroup={props.hideGroup}
                hideCompletedTask={hideCompletedTask}
                addCard={props.addCard}
                readonly={props.readonly}
                propertyNameChanged={props.propertyNameChanged}
                onDrop={props.onDropToGroupHeader}
                completedTasksCount={count}
            />

            {(group.cards.length > 0) &&
            <TableRows
                board={board}
                activeView={activeView}
                cards={group.cards}
                selectedCardIds={props.selectedCardIds}
                readonly={props.readonly}
                cardIdToFocusOnRender={props.cardIdToFocusOnRender}
                showCard={props.showCard}
                addCard={props.addCard}
                onCardClicked={props.onCardClicked}
                onDrop={props.onDropToCard}
                isCompleted={isCompleted}
            />}
        </div>
    )
}

export default React.memo(TableGroup)
