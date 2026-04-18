import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { uid } from '../utils/helpers';

const initialState = {
  groups: [],
  expenses: [],
  selectedGroupId: null,
  activeTab: 'groups',
};

function appReducer(state, action) {
  switch (action.type) {

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    case 'SET_TAB':
      return { ...state, activeTab: action.payload };

    case 'SELECT_GROUP':
      return { ...state, selectedGroupId: action.payload, activeTab: 'expenses' };

    case 'ADD_GROUP': {
      const group = {
        id: uid(),
        name: action.payload.name,
        members: action.payload.members,
        createdAt: new Date().toISOString(),
      };
      return { ...state, groups: [...state.groups, group] };
    }

    case 'DELETE_GROUP': {
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.payload),
        expenses: state.expenses.filter((e) => e.groupId !== action.payload),
        selectedGroupId:
          state.selectedGroupId === action.payload ? null : state.selectedGroupId,
      };
    }

    case 'ADD_MEMBER': {
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.groupId
            ? { ...g, members: [...g.members, action.payload.member] }
            : g
        ),
      };
    }

    case 'ADD_EXPENSE': {
      const expense = {
        id: uid(),
        groupId: action.payload.groupId,
        description: action.payload.description,
        amount: action.payload.amount,
        paidBy: action.payload.paidBy,
        category: action.payload.category,
        date: action.payload.date,
        splitType: action.payload.splitType,
        splits: action.payload.splits,
        participants: Object.keys(action.payload.splits).filter(
          (k) => action.payload.splits[k] > 0
        ),
        createdAt: new Date().toISOString(),
      };
      return { ...state, expenses: [...state.expenses, expense] };
    }

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };

    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('splitwise-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            groups: parsed.groups || [],
            expenses: parsed.expenses || [],
          },
        });
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        'splitwise-v2',
        JSON.stringify({ groups: state.groups, expenses: state.expenses })
      );
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state.groups, state.expenses]);

  const selectedGroup = state.groups.find((g) => g.id === state.selectedGroupId) || null;
  const groupExpenses = state.expenses.filter(
    (e) => e.groupId === state.selectedGroupId
  );
  const totalExpenses = state.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <AppContext.Provider
      value={{ state, dispatch, selectedGroup, groupExpenses, totalExpenses }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
