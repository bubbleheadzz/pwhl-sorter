// Sorter application logic

// Convert teams array to HTML format for display
function createTeamDisplay(team) {
  return `<div class="teamname">${team.name}</div><br /><img width="100px" src="${team.logo}"/>`;
}

// Initialize team display array and shuffle
function initializeTeams(teamsArray) {
  const namMember = teamsArray.map(createTeamDisplay);
  
  // Shuffle teams (Fisher-Yates algorithm)
  for (let i = namMember.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [namMember[i], namMember[j]] = [namMember[j], namMember[i]];
  }
  
  return namMember;
}

// State management
class SorterState {
  constructor(namMember) {
    this.namMember = namMember;
    this.lstMember = [];
    this.parent = [];
    this.equal = [];
    this.rec = [];
    this.history = [];
    this.historyIndex = -1;
    this.cmp1 = null;
    this.cmp2 = null;
    this.head1 = 0;
    this.head2 = 0;
    this.nrec = 0;
    this.numQuestion = 1;
    this.totalSize = 0;
    this.finishSize = 0;
    this.finishFlag = 0;
    this.initList();
  }

  initList() {
    let n = 0;

    // Initialize with all items
    this.lstMember[n] = [];
    for (let i = 0; i < this.namMember.length; i++) {
      this.lstMember[n][i] = i;
    }
    this.parent[n] = -1;
    this.totalSize = 0;
    n++;

    // Build binary tree structure
    for (let i = 0; i < this.lstMember.length; i++) {
      if (this.lstMember[i].length >= 2) {
        const mid = Math.ceil(this.lstMember[i].length / 2);
        
        this.lstMember[n] = this.lstMember[i].slice(0, mid);
        this.totalSize += this.lstMember[n].length;
        this.parent[n] = i;
        n++;
        
        this.lstMember[n] = this.lstMember[i].slice(mid, this.lstMember[i].length);
        this.totalSize += this.lstMember[n].length;
        this.parent[n] = i;
        n++;
      }
    }

    // Initialize record keeping
    for (let i = 0; i < this.namMember.length; i++) {
      this.rec[i] = 0;
    }
    this.nrec = 0;

    // Initialize equal array
    for (let i = 0; i <= this.namMember.length; i++) {
      this.equal[i] = -1;
    }

    this.cmp1 = this.lstMember.length - 2;
    this.cmp2 = this.lstMember.length - 1;
    this.head1 = 0;
    this.head2 = 0;
    this.numQuestion = 1;
    this.finishSize = 0;
    this.finishFlag = 0;
  }

  saveState() {
    this.historyIndex++;
    this.history[this.historyIndex] = {
      cmp1: this.cmp1,
      cmp2: this.cmp2,
      head1: this.head1,
      head2: this.head2,
      nrec: this.nrec,
      finishSize: this.finishSize,
      numQuestion: this.numQuestion,
      rec: this.rec.slice(),
      equal: this.equal.slice(),
      lstMember: this.lstMember.map(arr => arr.slice())
    };
  }

  undoLastChoice() {
    if (this.historyIndex >= 0) {
      const state = this.history[this.historyIndex];
      this.cmp1 = state.cmp1;
      this.cmp2 = state.cmp2;
      this.head1 = state.head1;
      this.head2 = state.head2;
      this.nrec = state.nrec;
      this.finishSize = state.finishSize;
      this.numQuestion = state.numQuestion;
      
      for (let i = 0; i < state.rec.length; i++) {
        this.rec[i] = state.rec[i];
      }
      for (let i = 0; i < state.equal.length; i++) {
        this.equal[i] = state.equal[i];
      }
      for (let i = 0; i < state.lstMember.length; i++) {
        this.lstMember[i] = state.lstMember[i].slice();
      }
      
      this.numQuestion--;
      this.historyIndex--;
      return true;
    }
    return false;
  }

  sortList(flag) {
    this.saveState();

    // Handle selection
    if (flag < 0) {
      // Left chosen
      this.rec[this.nrec] = this.lstMember[this.cmp1][this.head1];
      this.head1++;
      this.nrec++;
      this.finishSize++;
      while (this.equal[this.rec[this.nrec - 1]] !== -1) {
        this.rec[this.nrec] = this.lstMember[this.cmp1][this.head1];
        this.head1++;
        this.nrec++;
        this.finishSize++;
      }
    } else if (flag > 0) {
      // Right chosen
      this.rec[this.nrec] = this.lstMember[this.cmp2][this.head2];
      this.head2++;
      this.nrec++;
      this.finishSize++;
      while (this.equal[this.rec[this.nrec - 1]] !== -1) {
        this.rec[this.nrec] = this.lstMember[this.cmp2][this.head2];
        this.head2++;
        this.nrec++;
        this.finishSize++;
      }
    } else {
      // Tie
      this.rec[this.nrec] = this.lstMember[this.cmp1][this.head1];
      this.head1++;
      this.nrec++;
      this.finishSize++;
      while (this.equal[this.rec[this.nrec - 1]] !== -1) {
        this.rec[this.nrec] = this.lstMember[this.cmp1][this.head1];
        this.head1++;
        this.nrec++;
        this.finishSize++;
      }
      this.equal[this.rec[this.nrec - 1]] = this.lstMember[this.cmp2][this.head2];
      this.rec[this.nrec] = this.lstMember[this.cmp2][this.head2];
      this.head2++;
      this.nrec++;
      this.finishSize++;
      while (this.equal[this.rec[this.nrec - 1]] !== -1) {
        this.rec[this.nrec] = this.lstMember[this.cmp2][this.head2];
        this.head2++;
        this.nrec++;
        this.finishSize++;
      }
    }

    // Process remaining items
    if (this.head1 < this.lstMember[this.cmp1].length && this.head2 === this.lstMember[this.cmp2].length) {
      while (this.head1 < this.lstMember[this.cmp1].length) {
        this.rec[this.nrec] = this.lstMember[this.cmp1][this.head1];
        this.head1++;
        this.nrec++;
        this.finishSize++;
      }
    } else if (this.head1 === this.lstMember[this.cmp1].length && this.head2 < this.lstMember[this.cmp2].length) {
      while (this.head2 < this.lstMember[this.cmp2].length) {
        this.rec[this.nrec] = this.lstMember[this.cmp2][this.head2];
        this.head2++;
        this.nrec++;
        this.finishSize++;
      }
    }

    // Update parent list when both sublists are exhausted
    if (this.head1 === this.lstMember[this.cmp1].length && this.head2 === this.lstMember[this.cmp2].length) {
      for (let i = 0; i < this.lstMember[this.cmp1].length + this.lstMember[this.cmp2].length; i++) {
        this.lstMember[this.parent[this.cmp1]][i] = this.rec[i];
      }
      this.lstMember.pop();
      this.lstMember.pop();
      this.cmp1 -= 2;
      this.cmp2 -= 2;
      this.head1 = 0;
      this.head2 = 0;

      if (this.head1 === 0 && this.head2 === 0) {
        for (let i = 0; i < this.namMember.length; i++) {
          this.rec[i] = 0;
        }
        this.nrec = 0;
      }
    }

    return this.isComplete();
  }

  isComplete() {
    return this.cmp1 < 0;
  }

  getProgress() {
    return Math.floor((this.finishSize * 100) / this.totalSize);
  }

  getResults() {
    const results = [];
    let ranking = 1;
    let sameRank = 1;

    for (let i = 0; i < this.namMember.length; i++) {
      const teamIndex = this.lstMember[0][i];
      results.push({
        rank: ranking,
        teamName: this.namMember[teamIndex]
      });

      if (i < this.namMember.length - 1) {
        if (this.equal[this.lstMember[0][i]] === this.lstMember[0][i + 1]) {
          sameRank++;
        } else {
          ranking += sameRank;
          sameRank = 1;
        }
      }
    }

    return results;
  }
}
