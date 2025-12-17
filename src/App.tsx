/* eslint-disable max-len */
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';

import { Todo } from './types/Todo';
import { User } from './types/User';
import { Status } from './types/Status';

import { getTodos, getUser } from './api';

export const App: React.FC = () => {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [isTodosLoading, setIsTodosLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const [status, setStatus] = useState<Status>(Status.All);
  const [searchText, setSearchText] = useState('');

  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    setIsTodosLoading(true);

    getTodos()
      .then(setTodoList)
      .finally(() => setIsTodosLoading(false));
  }, []);

  const handleShow = (todo: Todo) => {
    setSelectedTodo(todo);
    setSelectedUser(null);
    setIsUserLoading(true);

    getUser(todo.userId)
      .then(setSelectedUser)
      .finally(() => setIsUserLoading(false));
  };

  const handleClose = () => {
    setSelectedTodo(null);
    setSelectedUser(null);
  };

  const handleFilterChange = useCallback(
    (newStatus: Status, newText: string) => {
      setStatus(newStatus);
      setSearchText(newText);
    },
    [],
  );

  const filteredTodos = useMemo(() => {
    return todoList.filter(todo => {
      const matchesStatus =
        status === Status.All ||
        (status === Status.Active && !todo.completed) ||
        (status === Status.Completed && todo.completed);

      const matchesText = todo.title
        .toLowerCase()
        .includes(searchText.toLowerCase());

      return matchesStatus && matchesText;
    });
  }, [todoList, status, searchText]);

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                status={status}
                searchText={searchText}
                onFilterChange={handleFilterChange}
              />
            </div>

            <div className="block">
              {isTodosLoading ? (
                <Loader />
              ) : (
                <TodoList
                  todos={filteredTodos}
                  onShow={handleShow}
                  selectedTodo={selectedTodo} // додаємо для hide/show логіки
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <TodoModal
        todo={selectedTodo}
        user={isUserLoading ? null : selectedUser}
        onClose={handleClose}
        isOpen={Boolean(selectedTodo)}
      />
    </>
  );
};
