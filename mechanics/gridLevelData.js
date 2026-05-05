export const LEVELS = [
  {
    id: 1,
    name: "First Cross",
    size: 5,

    cells: {
      "1,1": { type:"slot",   key:"A" },
      "1,2": { type:"op",     value:"+" },
      "1,3": { type:"slot",   key:"B" },
      "1,4": { type:"op",     value:"=" },
      "1,5": { type:"answer", value:3 },   // ← was 4

      "2,3": { type:"op",     value:"×" },
      "3,3": { type:"slot",   key:"C" },
      "4,3": { type:"op",     value:"=" },
      "5,3": { type:"answer", value:6 }    // ← was 4
    },

    equations: [
      ["A","+","B","=",3],
      ["B","×","C","=",6]
    ],
    preview: [
      { label: "Eq 1:", tokens: ["A", "+", "B", "=", 3] },
      { label: "Eq 2:", tokens: ["B", "×", "C", "=", 6] }
    ],
    tiles: [
      { value:1, count:1 },
      { value:2, count:2 },
      { value:3, count:1 }
    ],

    hint: "The center tile must work for both math paths."
  },

  {
    id: 2,
    name: "Lv 2 - Split Factor",
    size: 5,

    cells: {
      "1,1": { type: "slot",   key: "A" },
      "1,2": { type: "op",     value: "×" },
      "1,3": { type: "slot",   key: "B" },
      "1,4": { type: "op",     value: "=" },
      "1,5": { type: "answer", value: 6 },

      "2,3": { type: "op",     value: "+" },
      "3,3": { type: "slot",   key: "C" },
      "4,3": { type: "op",     value: "=" },
      "5,3": { type: "answer", value: 5 }
    },

    equations: [
      ["A", "×", "B", "=", 6],
      ["B", "+", "C", "=", 5]
    ],
    preview: [
      { label: "Eq 1:", tokens: ["A", "×", "B", "=", 6] },
      { label: "Eq 2:", tokens: ["B", "+", "C", "=", 5] }
    ],
    tiles: [
      { value: 2, count: 2 },
      { value: 3, count: 2 },
      { value: 4, count: 1 }
    ],

    hint: "The shared tile must satisfy both a multiplication and an addition."
  },

  {
    id: 3,
    name: "Lv 3 - Fork in the Road",
    size: 5,

    cells: {
      // row 1: A + B = 5
      "1,1": { type: "slot",   key: "A" },
      "1,2": { type: "op",     value: "+" },
      "1,3": { type: "slot",   key: "B" },
      "1,4": { type: "op",     value: "=" },
      "1,5": { type: "answer", value: 5 },

      // col 3 going down: B × C = 8
      "2,3": { type: "op",     value: "×" },
      "3,3": { type: "slot",   key: "C" },
      "4,3": { type: "op",     value: "=" },  // ← was "3,4"
      "5,3": { type: "answer", value: 8 },    // ← was "3,5"

      // col 1 going down: A + D = 4
      "2,1": { type: "op",     value: "+" },
      "3,1": { type: "slot",   key: "D" },
      "4,1": { type: "op",     value: "=" },
      "5,1": { type: "answer", value: 4 }
    },

    equations: [
      ["A", "+", "B", "=", 5],
      ["B", "×", "C", "=", 8],
      ["A", "+", "D", "=", 4]
    ],
    preview: [
      { label: "Eq 1:", tokens: ["A", "+", "B", "=", 5] },
      { label: "Eq 2:", tokens: ["B", "×", "C", "=", 8] },
      { label: "Eq 3:", tokens: ["A", "+", "D", "=", 4] }
    ],
    tiles: [
      { value: 1, count: 1 },
      { value: 2, count: 1 },
      { value: 3, count: 3 },
      { value: 4, count: 2 }
    ],

    hint: "B appears in both a sum and a product. Find what multiplies to 8 first."
  },

  {
    id: 4,
    name: "Lv 4 - Three Paths",
    size: 6,

    cells: {
      // row 1: A × B = 6
      "1,1": { type: "slot",   key: "A" },
      "1,2": { type: "op",     value: "×" },
      "1,3": { type: "slot",   key: "B" },
      "1,4": { type: "op",     value: "=" },
      "1,5": { type: "answer", value: 6 },

      // col 3 going down: C ÷ B = 2
      "2,3": { type: "op",     value: "÷" },
      "3,3": { type: "slot",   key: "C" },
      "4,3": { type: "op",     value: "=" },  // ← was "3,4"
      "5,3": { type: "answer", value: 2 },    // ← was "3,5"

      // row 6: D + E = 5  ← moved down one row to avoid collision
      "6,2": { type: "slot",   key: "D" },
      "6,3": { type: "op",     value: "+" },
      "6,4": { type: "slot",   key: "E" },
      "6,5": { type: "op",     value: "=" },
      "6,6": { type: "answer", value: 6 }
    },

    equations: [
      ["A", "×", "B", "=", 6],
      ["B", "÷", "C", "=", 2],   // ← was C ÷ B, swap to match top-to-bottom visual
      ["D", "+", "E", "=", 6]
    ],

    preview: [
      { label: "Eq 1:", tokens: ["A", "×", "B", "=", 6] },
      { label: "Eq 2:", tokens: ["B", "÷", "C", "=", 2] },
      { label: "Eq 3:", tokens: ["D", "+", "E", "=", 6] }
    ],

    tiles: [
      { value: 1, count: 1 },
      { value: 2, count: 1 },
      { value: 3, count: 1 },
      { value: 4, count: 1 },
      { value: 6, count: 1 }
    ],

    hint: "B is shared between the multiplication and division. Only one value works for both."
  },
  
  {
    id: 5,
    name: "Lv 5 - New Level",
    size: 7,

    cells: {
      "1,1": { type: "slot",   key: "A" },
      "1,2": { type: "op",     value: "+" },
      "1,3": { type: "slot",   key: "B" },
      "1,4": { type: "op",     value: "×" },
      "1,5": { type: "slot",   key: "C" },
      "1,6": { type: "op",     value: "=" },
      "1,7": { type: "answer", value: 13 },
      "2,3": { type: "op",     value: "+" },
      "3,3": { type: "slot",   key: "D" },
      "3,4": { type: "op",     value: "×" },
      "3,5": { type: "slot",   key: "F" },
      "3,6": { type: "op",     value: "=" },
      "3,7": { type: "answer", value: 0 },
      "4,3": { type: "op",     value: "-" },
      "5,3": { type: "slot",   key: "E" },
      "6,3": { type: "op",     value: "=" },
      "7,3": { type: "answer", value: 0 }
    },

    equations: [
      ["A", "+", "B", "×", "C", "=", 13],
      ["B", "+", "D", "-", "E", "=", 0],
      ["D", "×", "F", "=", 0]
    ],
    preview: [
      { label: "Eq 1:", tokens: ["A", "+", "B", "×", "C", "=", 13] },
      { label: "Eq 2:", tokens: ["B", "+", "D", "-", "E", "=", 0] },
      { label: "Eq 3:", tokens: ["D", "×", "F", "=", 0] }
    ],
    tiles: [
      { value: 0, count: 1 },
      { value: 2, count: 1 },
      { value: 3, count: 1 },
      { value: 5, count: 3 }
    ],

    hint: "Multiply comes before addition."
  },

  {
      id: 6 ,
      name: "Lv 6 - The maiz",
      size: 9,

      cells: {
        "1,1": { type: "slot",        key: "A" },
        "1,2": { type: "op",          value: "+" },
        "1,3": { type: "slot",        key: "B" },
        "1,7": { type: "slot",        key: "H" },
        "1,8": { type: "op",          value: "×" },
        "1,9": { type: "slot",        key: "G" },
        "2,3": { type: "op",          value: "+" },
        "2,7": { type: "op",          value: "×" },
        "3,1": { type: "slot",        key: "K" },
        "3,3": { type: "slot",        key: "F" },
        "3,4": { type: "op",          value: "×" },
        "3,5": { type: "slot",        key: "Q" },
        "3,6": { type: "op",          value: "×" },
        "3,7": { type: "slot",        key: "I" },
        "3,9": { type: "slot",        key: "N" },
        "4,1": { type: "op",          value: "-" },
        "4,3": { type: "op",          value: "=" },
        "4,5": { type: "op",          value: "=" },
        "4,7": { type: "op",          value: "=" },
        "4,9": { type: "op",          value: "+" },
        "5,1": { type: "slot",        key: "L" },
        "5,3": { type: "answer",      value: 6 },
        "5,5": { type: "answer",      value: 36 },
        "5,7": { type: "answer",      value: 6 },
        "5,9": { type: "slot",        key: "O" },
        "6,1": { type: "op",          value: "+" },
        "6,9": { type: "op",          value: "-" },
        "7,1": { type: "slot",        key: "M" },
        "7,2": { type: "op",          value: "=" },
        "7,3": { type: "answer",      value: 5 },
        "7,7": { type: "answer",      value: 3 },
        "7,8": { type: "op",          value: "=" },
        "7,9": { type: "slot",        key: "P" }
      },

      equations: [
        { tokens:[{ type:"slot", key:"A", r:0, c:0 }, { type:"op", value:"+", r:0, c:1 }, { type:"slot", key:"B", r:0, c:2 }, { type:"op", value:"+", r:1, c:2 }, { type:"slot", key:"F", r:2, c:2 }], answer:6, eqCell:"4,3", ansCell:"5,3" },
        { tokens:[{ type:"slot", key:"G", r:0, c:8 }, { type:"op", value:"×", r:0, c:7 }, { type:"slot", key:"H", r:0, c:6 }, { type:"op", value:"×", r:1, c:6 }, { type:"slot", key:"I", r:2, c:6 }], answer:6, eqCell:"4,7", ansCell:"5,7" },
        { tokens:[{ type:"slot", key:"K", r:2, c:0 }, { type:"op", value:"-", r:3, c:0 }, { type:"slot", key:"L", r:4, c:0 }, { type:"op", value:"+", r:5, c:0 }, { type:"slot", key:"M", r:6, c:0 }], answer:5, eqCell:"7,2", ansCell:"7,3" },
        { tokens:[{ type:"slot", key:"N", r:2, c:8 }, { type:"op", value:"+", r:3, c:8 }, { type:"slot", key:"O", r:4, c:8 }, { type:"op", value:"-", r:5, c:8 }, { type:"slot", key:"P", r:6, c:8 }], answer:3, eqCell:"7,8", ansCell:"7,7" },
        { tokens:[{ type:"slot", key:"F", r:2, c:2 }, { type:"op", value:"×", r:2, c:3 }, { type:"slot", key:"Q", r:2, c:4 }, { type:"op", value:"×", r:2, c:5 }, { type:"slot", key:"I", r:2, c:6 }], answer:36, eqCell:"4,5", ansCell:"5,5" }
      ],
      preview: [
        { label: "Eq 1:", tokens: ["A", "+", "B", "+", "F", "=", 6] },
        { label: "Eq 2:", tokens: ["G", "×", "H", "×", "I", "=", 6] },
        { label: "Eq 3:", tokens: ["K", "-", "L", "+", "M", "=", 5] },
        { label: "Eq 4:", tokens: ["N", "+", "O", "-", "P", "=", 3] },
        { label: "Eq 5:", tokens: ["F", "×", "Q", "×", "I", "=", 36] }
      ],
      tiles: [
        { value: 1, count: 2 },
        { value: 2, count: 2 },
        { value: 3, count: 2 },
        { value: 4, count: 3 },
        { value: 5, count: 2 },
        { value: 6, count: 2 }
      ],

      hint: "3 2 1 - let's Goo!"
    },

  {
    id: 7,
    name: "Lv 7 - The Trap",
    size: 11,

    cells: {
      "3,2": { type: "slot",   key: "A" },
      "3,3": { type: "op",     value: "×" },
      "3,4": { type: "slot",   key: "B" },
      "3,5": { type: "op",     value: "=" },
      "3,6": { type: "answer", value: 42 },
      "3,7": { type: "op",     value: "-" },
      "3,8": { type: "slot",   key: "E" },
      "3,9": { type: "op",     value: "=" },
      "3,10": { type: "answer", value: 22 },
      "4,2": { type: "op",     value: "÷" },
      "4,4": { type: "op",     value: "×" },
      "4,6": { type: "op",     value: "÷" },
      "4,8": { type: "op",     value: "×" },
      "5,2": { type: "answer", value: 2 },
      "5,3": { type: "op",     value: "=" },
      "5,4": { type: "slot",   key: "D" },
      "5,5": { type: "op",     value: "-" },
      "5,6": { type: "slot",   key: "C" },
      "5,7": { type: "op",     value: "-" },
      "5,8": { type: "slot",   key: "F" },
      "6,2": { type: "op",     value: "=" },
      "6,4": { type: "op",     value: "=" },
      "6,6": { type: "op",     value: "=" },
      "6,8": { type: "op",     value: "=" },
      "7,2": { type: "answer", value: 3 },
      "7,4": { type: "answer", value: 35 },
      "7,6": { type: "answer", value: 21 },
      "7,8": { type: "answer", value: 20 }
    },

    equations: [
      { tokens: [{ type:"slot", key:"A" }, { type:"op", value:"×" }, { type:"slot", key:"B" }], answer: 42, eqCell:"3,5", ansCell:"3,6" },
      { tokens: [{ type:"answer", value:42 }, { type:"op", value:"÷" }, { type:"slot", key:"C" }], answer: 21, eqCell:"4,6", ansCell:"7,6" },
      { tokens: [{ type:"slot", key:"B" }, { type:"op", value:"×" }, { type:"slot", key:"D" }], answer: 35, eqCell:"6,4", ansCell:"7,4" },
      { tokens: [{ type:"answer", value:42 }, { type:"op", value:"-" }, { type:"slot", key:"E" }], answer: 22, eqCell:"3,9", ansCell:"3,10" },
      { tokens: [{ type:"slot", key:"E" }, { type:"op", value:"×" }, { type:"slot", key:"F" }], answer: 20, eqCell:"6,8", ansCell:"7,8" },
      { tokens: [{ type:"slot", key:"D" }, { type:"op", value:"-" }, { type:"slot", key:"C" }, { type:"op", value:"-" }, { type:"slot", key:"F" }], answer: 2, eqCell:"5,3", ansCell:"5,2" },
      { tokens: [{ type:"slot", key:"A" }, { type:"op", value:"÷" }, { type:"answer", value:2 }], answer: 3, eqCell:"6,2", ansCell:"7,2" }
    ],
    preview: [
      { label: "Eq 1:", tokens: ["A", "×", "B", "=", 42] },
      { label: "Eq 2:", tokens: [42, "÷", "C", "=", 21] },
      { label: "Eq 3:", tokens: ["B", "×", "D", "=", 35] },
      { label: "Eq 4:", tokens: [42, "-", "E", "=", 22] },
      { label: "Eq 5:", tokens: ["E", "×", "F", "=", 20] },
      { label: "Eq 6:", tokens: ["D", "-", "C", "-", "F", "=", 2] },
      { label: "Eq 7:", tokens: ["A", "÷", 2, "=", 3] }
    ],
    tiles: [
      { value: 1, count: 3 },
      { value: 2, count: 2 },
      { value: 5, count: 1 },
      { value: 6, count: 2 },
      { value: 7, count: 1 },
      { value: 20, count: 3 }
    ],

    hint: "solve columns first"
  },

  {
    id: 8,
    name: "Lv 8 - The Maize",
    size: 12,

    cells: {
      "2,2":  { type: "slot",   key: "A" },
      "2,3":  { type: "op",     value: "+" },
      "2,4":  { type: "slot",   key: "B", placeholder: 4 },
      "2,5":  { type: "op",     value: "×" },
      "2,6":  { type: "slot",   key: "C" },
      "2,7":  { type: "op",     value: "÷" },
      "2,8":  { type: "slot",   key: "D", placeholder: 3 },
      "2,9":  { type: "op",     value: "=" },
      "2,10": { type: "answer", value: 6 },

      "3,2":  { type: "op",     value: "+" },
      "4,2":  { type: "slot",   key: "L" },
      "5,2":  { type: "op",     value: "÷" },
      "6,2":  { type: "slot",   key: "K" },
      "7,2":  { type: "op",     value: "+" },
      "8,2":  { type: "slot",   key: "J",placeholder: 5 },
      "9,2":  { type: "op",     value: "=" },
      "10,2": { type: "answer", value: 9 },

      "4,3":  { type: "op",     value: "÷" },
      "4,4":  { type: "slot",   key: "M" },
      "4,5":  { type: "op",     value: "=" },
      "4,6":  { type: "answer", value: 2 },

      "3,8":  { type: "op",     value: "-" },
      "4,8":  { type: "slot",   key: "E" },
      "5,8":  { type: "op",     value: "÷" },
      "6,8":  { type: "slot",   key: "F" },
      "7,8":  { type: "op",     value: "×" },
      "8,8":  { type: "slot",   key: "G", placeholder: 2 },
      "9,8":  { type: "op",     value: "=" },
      "10,8": { type: "answer", value: 1 },

      "6,6":  { type: "slot",   key: "N" },
      "6,7":  { type: "op",     value: "×" },
      "6,9":  { type: "op",     value: "=" },
      "6,10": { type: "answer", value: 12 },

      "8,3":  { type: "op",     value: "+" },
      "8,4":  { type: "slot",   key: "I" },
      "8,5":  { type: "op",     value: "×" },
      "8,6":  { type: "slot",   key: "H" },
      "8,7":  { type: "op",     value: "+" },
      "8,9":  { type: "op",     value: "=" },
      "8,10": { type: "answer", value: 19 },
    },

    equations: [
      { tokens: [{ type:"slot", key:"A" }, { type:"op", value:"+" }, { type:"slot", key:"B" }, { type:"op", value:"×" }, { type:"slot", key:"C" }, { type:"op", value:"÷" }, { type:"slot", key:"D" }], answer: 6 },
      { tokens: [{ type:"slot", key:"L" }, { type:"op", value:"÷" }, { type:"slot", key:"M" }], answer: 2 },
      { tokens: [{ type:"slot", key:"N" }, { type:"op", value:"×" }, { type:"slot", key:"F" }], answer: 12 },
      { tokens: [{ type:"slot", key:"A" }, { type:"op", value:"+" }, { type:"slot", key:"L" }, { type:"op", value:"÷" }, { type:"slot", key:"K" }, { type:"op", value:"+" }, { type:"slot", key:"J" }], answer: 9 },
      { tokens: [{ type:"slot", key:"D" }, { type:"op", value:"-" }, { type:"slot", key:"E" }, { type:"op", value:"÷" }, { type:"slot", key:"F" }, { type:"op", value:"×" }, { type:"slot", key:"G" }], answer: 1 },
      { tokens: [{ type:"slot", key:"J" }, { type:"op", value:"+" }, { type:"slot", key:"I" }, { type:"op", value:"×" }, { type:"slot", key:"H" }, { type:"op", value:"+" }, { type:"slot", key:"G" }], answer: 19 }
    ],

    groups: [
      { cells: ["2,2","2,3","2,4","2,5","2,6"], pad: 12, color: { border: "rgba(60, 141, 240, 0.4)" } }
    ],

    preview: [
      { label: "Eq 1:", tokens: ["A", "+", "B", "×", "C", "÷", "D", "=", 6] },
      { label: "Eq 2:", tokens: ["L", "÷", "M", "=", 2] },
      { label: "Eq 3:", tokens: ["N", "×", "F", "=", 12] },
      { label: "Eq 4:", tokens: ["A", "+", "L", "÷", "K", "+", "J", "=", 9] },
      { label: "Eq 5:", tokens: ["D", "-", "E", "÷", "F", "×", "G", "=", 1] },
      { label: "Eq 6:", tokens: ["J", "+", "I", "×", "H", "+", "G", "=", 19] }
    ],

    tiles: [
      { value: 2, count: 4 },
      { value: 3, count: 4 },
      { value: 4, count: 5 },
      { value: 5, count: 1 }
    ],

    hint: "1st comes Multiply then Divide then + and -"
  },

    {
    id: 9,
    name: "Lv 9 - The Maize",
    size: 12,

    cells: {
      "1,1": { type: "slot",   key: "A" },
      "1,2": { type: "op",     value: "+" },
      "1,3": { type: "slot",   key: "B" },
      "2,3": { type: "op",     value: "=" },
      "3,3": { type: "answer", value: 3 },
      "3,4": { type: "op",     value: "×" },
      "3,5": { type: "slot",   key: "C" },
      "4,5": { type: "op",     value: "=" },
      "5,5": { type: "answer", value: 9 },
      "5,6": { type: "op",     value: "÷" },
      "5,7": { type: "slot",   key: "D" },
      "6,7": { type: "op",     value: "=" },
      "7,7": { type: "answer", value: 3 },
      "7,8": { type: "op",     value: "-" },
      "7,9": { type: "slot",   key: "E" },
      "8,9": { type: "op",     value: "=" },
      "9,9": { type: "answer", value: 1 },
      "9,10": { type: "op",     value: "×" },
      "9,11": { type: "slot",   key: "F" },
      "10,11": { type: "op",     value: "=" },
      "11,11": { type: "answer", value: 1 }
    },

    equations: [
      ["A", "+", "B", "=", 3],
      ["[3]", "×", "C", "=", 9],
      ["[9]", "÷", "D", "=", 3],
      ["[3]", "-", "E", "=", 1],
      ["[1]", "×", "F", "=", 1]
    ],

    tiles: [
      { value: 1, count: 2 },
      { value: 2, count: 2 },
      { value: 3, count: 2 }
    ],

    hint: "focus on small equation first"
  },
  {
    id: 10,
    name: "Lv 10 - Boss fight ",
    size: 9,

    cells: {
      "1,1": { type: "slot",   key: "A" },
      "1,2": { type: "op",     value: "+" },
      "1,3": { type: "slot",   key: "B", placeholder: "2" },
      "1,4": { type: "op",     value: "×" },
      "1,5": { type: "slot",   key: "C" },
      "1,6": { type: "op",     value: "-" },
      "1,7": { type: "slot",   key: "D" },
      "1,8": { type: "op",     value: "÷" },
      "1,9": { type: "slot",   key: "I" },
      "2,3": { type: "op",     value: "+" },
      "2,7": { type: "op",     value: "-" },
      "2,9": { type: "op",     value: "=" },
      "3,1": { type: "slot",   key: "M" },
      "3,2": { type: "op",     value: "+" },
      "3,3": { type: "slot",   key: "L" },
      "3,4": { type: "op",     value: "÷" },
      "3,5": { type: "slot",   key: "K" },
      "3,6": { type: "op",     value: "×" },
      "3,7": { type: "slot",   key: "J", placeholder: "2" },
      "3,8": { type: "op",     value: "×" },
      "3,9": { type: "answer", value: 5 },
      "4,1": { type: "op",     value: "=" },
      "4,3": { type: "op",     value: "+" },
      "4,7": { type: "op",     value: "-" },
      "5,1": { type: "answer", value: 22 },
      "5,2": { type: "op",     value: "-" },
      "5,3": { type: "slot",   key: "N" },
      "5,4": { type: "op",     value: "=" },
      "5,5": { type: "answer", value: 20 },
      "5,6": { type: "op",     value: "×" },
      "5,7": { type: "slot",   key: "O" },
      "5,8": { type: "op",     value: "=" },
      "5,9": { type: "answer", value: 40 },
      "6,3": { type: "op",     value: "+" },
      "6,7": { type: "op",     value: "+" },
      "6,9": { type: "op",     value: "÷" },
      "7,1": { type: "answer", value: 4 },
      "7,2": { type: "op",     value: "=" },
      "7,3": { type: "slot",   key: "R" },
      "7,4": { type: "op",     value: "+" },
      "7,5": { type: "answer", value: 1 },
      "7,6": { type: "op",     value: "=" },
      "7,7": { type: "slot",   key: "Q" },
      "7,8": { type: "op",     value: "÷" },
      "7,9": { type: "slot",   key: "P" },
      "8,3": { type: "op",     value: "=" },
      "8,7": { type: "op",     value: "=" },
      "8,9": { type: "op",     value: "=" },
      "9,3": { type: "answer", value: 11 },
      "9,7": { type: "answer", value: 4 },
      "9,9": { type: "answer", value: 10 }
    },

    equations: [
      ["A", "+", "B", "×", "C", "-", "D", "÷", "I", "=", 5],
      ["M", "+", "L", "÷", "K", "×", "J", "×", "[5]", "=", 22],
      ["[22]", "-", "N", "=", 20],
      ["[20]", "×", "O", "=", 40],
      ["[40]", "÷", "P", "=", 10],
      ["Q", "÷", "P", "=", 1],
      ["R", "+", "[1]", "=", 4],
      ["D", "-", "J", "-", "O", "+", "Q", "=", 4],
      ["B", "+", "L", "+", "N", "+", "R", "=", 11]
    ],

    preview: [
      { label: "Eq 1:", tokens: ["A", "+", "B", "×", "C", "-", "D", "÷", "I", "=", 5] },
      { label: "Eq 2:", tokens: ["M", "+", "L", "÷", "K", "×", "J", "×", "[5]", "=", 22] },
      { label: "Eq 3:", tokens: ["[22]", "-", "N", "=", 20] },
      { label: "Eq 4:", tokens: ["[20]", "×", "O", "=", 40] },
      { label: "Eq 5:", tokens: ["[40]", "÷", "P", "=", 10] },
      { label: "Eq 6:", tokens: ["Q", "÷", "P", "=", 1] },
      { label: "Eq 7:", tokens: ["R", "+", "[1]", "=", 4] },
      { label: "Eq 8:", tokens: ["D", "-", "J", "-", "O", "+", "Q", "=", 4] },
      { label: "Eq 9:", tokens: ["B", "+", "L", "+", "N", "+", "R", "=", 11] }
    ],

    tiles: [
      { value: 1, count: 2 },
      { value: 2, count: 7 },
      { value: 3, count: 3 },
      { value: 4, count: 4 }
    ],

    hint: "Ha Ha Ha no Hint here.."
  }
];