import React, {
  forwardRef, useEffect, useImperativeHandle,
  useState,
} from 'react'
import styled from '@emotion/styled'

interface MentionListProps {
  items: string[]
  command: (props: { id: string }) => void
}

interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({ id: index.toString() })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <DropdownMenu>
      {props.items.length
        ? props.items.map((item, index) => (
          <DropdownButton
            className={index === selectedIndex ? 'is-selected' : ''}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item}
          </DropdownButton>
        ))
        : <div className="item">결과 없음</div>
      }
    </DropdownMenu>
  )
})

MentionList.displayName = 'MentionList'

export default MentionList

const DropdownMenu = styled.div`
  background: var(--white);
  border-bottom: 1px solid var(--grey-800);
  border-radius: 0.7rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: auto;
  padding: 0.4rem;
  position: relative;
  max-height: 200px;
  z-index: 100;

  .item {
    padding: 0.5rem;
    color: var(--grey-500);
  }
`;

const DropdownButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: 0.3rem;
  cursor: pointer;
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem;
  text-align: left;
  width: 100%;

  &:hover,
  &:hover.is-selected {
    background-color: var(--grey-100);
  }

  &.is-selected {
    background-color: var(--grey-200);
  }
`;