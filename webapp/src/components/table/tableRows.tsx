// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react'

import {Card} from '../../blocks/card'
import {Board} from '../../blocks/board'
import {BoardView} from '../../blocks/boardView'

import './table.scss'

import TableRow from './tableRow'

type Props = {
    board: Board
    activeView: BoardView
    cards: readonly Card[]
    selectedCardIds: string[]
    readonly: boolean
    cardIdToFocusOnRender: string
    showCard: (cardId?: string) => void
    addCard: (groupByOptionId?: string) => Promise<void>
    onCardClicked: (e: React.MouseEvent, card: Card) => void
    onDrop: (srcCard: Card, dstCard: Card) => void
    isCompleted: boolean
}

const TableRows = (props: Props): JSX.Element => {
    const {board, cards, activeView} = props

    const onClickRow = useCallback((e: React.MouseEvent<HTMLDivElement>, card: Card) => {
        props.onCardClicked(e, card)
    }, [props.onCardClicked])

    const [isHiddenCard, setHiddenCard] = useState(false)
    let isHidden = false
    let taskCompletePropertyId = ''

    useEffect(() => {
        setHiddenCard(props.isCompleted)
    },[props.isCompleted])

    // get task complete property id 
    for(let i=0; i < props.board.cardProperties.length; i++){
        const row = props.board.cardProperties[i]
        if(row.name == "Task Completed" || row.name == " Task Completed"){
            taskCompletePropertyId = row.id
        }
    }

    return (
        <>
            {cards.map((card, idx) => {

                if(card.fields.properties){
                    if(card.fields.properties[taskCompletePropertyId]){
                        isHidden = true
                    }else{
                        isHidden = false
                    }
                }

                return (
                    <>
                        {!isHidden && 
                            <TableRow
                                key={card.id + card.updateAt}
                                board={board}
                                columnWidths={activeView.fields.columnWidths}
                                isManualSort={activeView.fields.sortOptions.length === 0}
                                groupById={activeView.fields.groupById}
                                visiblePropertyIds={activeView.fields.visiblePropertyIds}
                                collapsedOptionIds={activeView.fields.collapsedOptionIds}
                                card={card}
                                addCard={props.addCard}
                                isSelected={props.selectedCardIds.includes(card.id)}
                                focusOnMount={props.cardIdToFocusOnRender === card.id}
                                isLastCard={idx === (cards.length - 1)}
                                onClick={onClickRow}
                                showCard={props.showCard}
                                readonly={props.readonly}
                                onDrop={props.onDrop}
                            />
                        }
                    </>)
            })}

            {cards.map((card, idx) => {
                if(card.fields.properties){
                    if(card.fields.properties){
                        if(card.fields.properties[taskCompletePropertyId]){
                            isHidden = true
                        }else{
                            isHidden = false
                        }
                    }
                }

                return (
                    <>
                        {isHidden && isHiddenCard && 
                            <TableRow
                                key={card.id + card.updateAt}
                                board={board}
                                columnWidths={activeView.fields.columnWidths}
                                isManualSort={activeView.fields.sortOptions.length === 0}
                                groupById={activeView.fields.groupById}
                                visiblePropertyIds={activeView.fields.visibleOptionIds}
                                collapsedOptionIds={activeView.fields.collapsedOptionIds}
                                card={card}
                                addCard={props.addCard}
                                isSelected={props.selectedCardIds.includes(card.id)}
                                focusOnMount={props.cardIdToFocusOnRender === card.id}
                                isLastCard={idx === (cards.length - 1)}
                                onClick={onClickRow}
                                showCard={props.showCard}
                                readonly={props.readonly}
                                onDrop={props.onDrop}
                            />
                        }
                    </>
                )
            })}
        </>
    )
}

export default TableRows
