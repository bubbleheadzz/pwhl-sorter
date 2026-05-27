import { createSlice } from '@reduxjs/toolkit';
import teams from '../data/teams.json';

/**
 * Fisher-Yates shuffle algorithm to randomize array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Initialize the merge sort structure with randomized teams
 */
const initializeSort = () => {
  const shuffledTeams = shuffleArray(teams.map((_, i) => i));
  
  let lists = [shuffledTeams];
  let parents = [-1];
  
  // Build binary tree structure for merge sort
  for (let i = 0; i < lists.length; i++) {
    if (lists[i].length >= 2) {
      const mid = Math.ceil(lists[i].length / 2);
      const left = lists[i].slice(0, mid);
      const right = lists[i].slice(mid);
      
      lists.push(left);
      parents.push(i);
      lists.push(right);
      parents.push(i);
    }
  }
  
  return {
    lists,
    parents,
    totalSize: teams.length,
    cmp1: lists.length - 2,
    cmp2: lists.length - 1,
  };
};

const initialState = (() => {
  const sort = initializeSort();
  return {
    // Team data
    teams,
    
    // Sort state
    lists: sort.lists,
    parents: sort.parents,
    totalSize: sort.totalSize,
    
    // Comparison indices
    cmp1: sort.cmp1,
    cmp2: sort.cmp2,
    head1: 0,
    head2: 0,
    
    // Results
    rec: new Array(teams.length).fill(0),
    nrec: 0,
    equal: new Array(teams.length).fill(-1),
    finishSize: 0,
    
    // UI
    numQuestion: 1,
    isFinished: false,
    
    // History for undo
    history: [],
    historyIndex: -1,
  };
})();

const sorterSlice = createSlice({
  name: 'sorter',
  initialState,
  reducers: {
    /**
     * Save current state to history before making a choice
     */
    saveHistory: (state) => {
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({
        cmp1: state.cmp1,
        cmp2: state.cmp2,
        head1: state.head1,
        head2: state.head2,
        nrec: state.nrec,
        finishSize: state.finishSize,
        numQuestion: state.numQuestion,
        rec: [...state.rec],
        equal: [...state.equal],
        lists: state.lists.map(list => [...list]),
      });
      state.historyIndex++;
    },

    /**
     * Process a comparison result (flag: -1 = left, 0 = tie, 1 = right)
     */
    makeChoice: (state, action) => {
      const { flag } = action.payload;

      const processTeam = (listIdx, headIdx, teamIdx) => {
        state.rec[state.nrec] = state.lists[listIdx][headIdx];
        state.nrec++;
        state.finishSize++;

        // Add any teams tied with this one
        while (state.equal[state.rec[state.nrec - 1]] !== -1) {
          const nextTeam = state.equal[state.rec[state.nrec - 1]];
          state.rec[state.nrec] = nextTeam;
          state.nrec++;
          state.finishSize++;
        }
      };

      if (flag < 0) {
        // Left team wins
        processTeam(state.cmp1, state.head1);
        state.head1++;
      } else if (flag > 0) {
        // Right team wins
        processTeam(state.cmp2, state.head2);
        state.head2++;
      } else {
        // Tie
        processTeam(state.cmp1, state.head1);
        state.head1++;

        // Mark them as equal
        state.equal[state.rec[state.nrec - 1]] = state.lists[state.cmp2][state.head2];

        processTeam(state.cmp2, state.head2);
        state.head2++;
      }

      // Handle remaining elements after one list is exhausted
      if (state.head1 < state.lists[state.cmp1].length && state.head2 === state.lists[state.cmp2].length) {
        while (state.head1 < state.lists[state.cmp1].length) {
          state.rec[state.nrec] = state.lists[state.cmp1][state.head1];
          state.nrec++;
          state.finishSize++;
          state.head1++;
        }
      } else if (state.head1 === state.lists[state.cmp1].length && state.head2 < state.lists[state.cmp2].length) {
        while (state.head2 < state.lists[state.cmp2].length) {
          state.rec[state.nrec] = state.lists[state.cmp2][state.head2];
          state.nrec++;
          state.finishSize++;
          state.head2++;
        }
      }

      // Merge completed
      if (state.head1 === state.lists[state.cmp1].length && state.head2 === state.lists[state.cmp2].length) {
        const parentIdx = state.parents[state.cmp1];
        for (let i = 0; i < state.lists[state.cmp1].length + state.lists[state.cmp2].length; i++) {
          state.lists[parentIdx][i] = state.rec[i];
        }

        state.lists.pop();
        state.lists.pop();
        state.cmp1 -= 2;
        state.cmp2 -= 2;
        state.head1 = 0;
        state.head2 = 0;

        if (state.cmp1 < 0) {
          state.isFinished = true;
        }

        // Reset rec for next merge
        if (state.head1 === 0 && state.head2 === 0) {
          state.rec = new Array(teams.length).fill(0);
          state.nrec = 0;
        }
      }

      state.numQuestion++;
    },

    /**
     * Undo the last choice
     */
    undoChoice: (state) => {
      if (state.historyIndex >= 0) {
        const prevState = state.history[state.historyIndex];
        state.cmp1 = prevState.cmp1;
        state.cmp2 = prevState.cmp2;
        state.head1 = prevState.head1;
        state.head2 = prevState.head2;
        state.nrec = prevState.nrec;
        state.finishSize = prevState.finishSize;
        state.numQuestion = prevState.numQuestion;
        state.rec = [...prevState.rec];
        state.equal = [...prevState.equal];
        state.lists = prevState.lists.map(list => [...list]);
        state.isFinished = false;

        state.historyIndex--;
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
    },

    /**
     * Reset sorter to initial state
     */
    reset: (state) => {
      const sort = initializeSort();
      state.lists = sort.lists;
      state.parents = sort.parents;
      state.totalSize = sort.totalSize;
      state.cmp1 = sort.cmp1;
      state.cmp2 = sort.cmp2;
      state.head1 = 0;
      state.head2 = 0;
      state.rec = new Array(teams.length).fill(0);
      state.nrec = 0;
      state.equal = new Array(teams.length).fill(-1);
      state.finishSize = 0;
      state.numQuestion = 1;
      state.isFinished = false;
      state.history = [];
      state.historyIndex = -1;
    },
  },
});

export const { saveHistory, makeChoice, undoChoice, reset } = sorterSlice.actions;
export default sorterSlice.reducer;
