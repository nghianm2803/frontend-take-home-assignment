import type { SVGProps } from 'react'

import * as Checkbox from '@radix-ui/react-checkbox'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import * as Tabs from '@radix-ui/react-tabs'
import { useState } from 'react'

import { api } from '@/utils/client/api'

/**
 * QUESTION 3:
 * -----------
 * A todo has 2 statuses: "pending" and "completed"
 *  - "pending" state is represented by an unchecked checkbox
 *  - "completed" state is represented by a checked checkbox, darker background,
 *    and a line-through text
 *
 * We have 2 backend apis:
 *  - (1) `api.todo.getAll`       -> a query to get all todos
 *  - (2) `api.todoStatus.update` -> a mutation to update a todo's status
 *
 * Example usage for (1) is right below inside the TodoList component. For (2),
 * you can find similar usage (`api.todo.create`) in src/client/components/CreateTodoForm.tsx
 *
 * If you use VSCode as your editor , you should have intellisense for the apis'
 * input. If not, you can find their signatures in:
 *  - (1) src/server/api/routers/todo-router.ts
 *  - (2) src/server/api/routers/todo-status-router.ts
 *
 * Your tasks are:
 *  - Use TRPC to connect the todos' statuses to the backend apis
 *  - Style each todo item to reflect its status base on the design on Figma
 *
 * Documentation references:
 *  - https://trpc.io/docs/client/react/useQuery
 *  - https://trpc.io/docs/client/react/useMutation
 *
 *
 *
 *
 *
 * QUESTION 4:
 * -----------
 * Implement UI to delete a todo. The UI should look like the design on Figma
 *
 * The backend api to delete a todo is `api.todo.delete`. You can find the api
 * signature in src/server/api/routers/todo-router.ts
 *
 * NOTES:
 *  - Use the XMarkIcon component below for the delete icon button. Note that
 *  the icon button should be accessible
 *  - deleted todo should be removed from the UI without page refresh
 *
 * Documentation references:
 *  - https://www.sarasoueidan.com/blog/accessible-icon-buttons
 *
 *
 *
 *
 *
 * QUESTION 5:
 * -----------
 * Animate your todo list using @formkit/auto-animate package
 *
 * Documentation references:
 *  - https://auto-animate.formkit.com
 */

export const TodoList = () => {
  const [animationToDoList] = useAutoAnimate()

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  const { data: todos = [] } = api.todo.getAll.useQuery({
    statuses: filter === 'all' ? ['completed', 'pending'] : [filter],
  })

  const apiContext = api.useContext()

  const { mutate: updateTodo } = api.todoStatus.update.useMutation({
    onSuccess: () => {
      apiContext.todo.getAll.refetch()
    },
  })

  const { mutate: deleteTodo } = api.todo.delete.useMutation({
    onSuccess: () => {
      apiContext.todo.getAll.refetch()
    },
  })

  return (
    <Tabs.Root className="TabsRoot" defaultValue="all">
      <Tabs.List className="flex items-start gap-x-2 pb-10">
        <Tabs.Trigger
          className={`rounded-full px-6 py-3 ${
            filter === 'all'
              ? 'bg-gray-700 text-white'
              : 'border border-gray-200 bg-white text-gray-700'
          }`}
          onClick={() => setFilter('all')}
          value="all"
        >
          All
        </Tabs.Trigger>
        <Tabs.Trigger
          className={`rounded-full px-6 py-3 ${
            filter === 'pending'
              ? 'bg-gray-700 text-white'
              : 'border border-gray-200 bg-white text-gray-700'
          }`}
          onClick={() => setFilter('pending')}
          value="pending"
        >
          Pending
        </Tabs.Trigger>
        <Tabs.Trigger
          className={`rounded-full px-6 py-3 ${
            filter === 'completed'
              ? 'bg-gray-700 text-white'
              : 'border border-gray-200 bg-white text-gray-700'
          }`}
          onClick={() => setFilter('completed')}
          value="completed"
        >
          Completed
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content className="TabsContent" value={filter}>
        <ul className="grid grid-cols-1 gap-y-3" ref={animationToDoList}>
          {todos.map((todo) => (
            <li key={todo.id}>
              <div className="flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
                <Checkbox.Root
                  id={String(todo.id)}
                  checked={todo.status === 'completed'}
                  className={`flex h-6 w-6 items-center justify-center rounded-6 border ${
                    todo.status === 'completed'
                      ? 'border-gray-700 bg-gray-700 focus:border-gray-700 focus:outline-none'
                      : 'border-gray-300'
                  }`}
                  onClick={() => {
                    const changeStatus =
                      todo.status === 'completed' ? 'pending' : 'completed'
                    updateTodo({
                      todoId: todo.id,
                      status: changeStatus,
                    })
                  }}
                >
                  <Checkbox.Indicator>
                    <CheckIcon className="h-4 w-4 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>

                <label
                  className={`block w-80 pl-3 font-medium ${
                    todo.status === 'completed' ? 'line-through' : ''
                  }`}
                  htmlFor={String(todo.id)}
                >
                  {todo.body}
                </label>

                <XMarkIcon
                  className="h-8 w-8 cursor-pointer px-1 py-1 text-gray-700"
                  onClick={() => {
                    deleteTodo({
                      id: todo.id,
                    })
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Tabs.Content>
    </Tabs.Root>
  )
}

const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}
