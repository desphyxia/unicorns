// Everyone who lives in (or around) the castle.

export const RAINBOW = ['#ff6b8b', '#ff9a5c', '#ffd23f', '#6edc8c', '#5cc8ff', '#a98bff'];

export const PRINCESSES = [
  // Elsa is drawn to look like the real Elsa: round face, wavy chestnut hair with lighter streaks, side-swept fringe,
  // a little tied-back tuft, big dark brown eyes and rosy cheeks. Her favourite coral T-shirt colour is her default dress.
  { id: 'elsa', name: 'Elsa', dress: '#f27c80', hair: '#8c5b3a', skin: '#f1c4a0', shoes: '#ff8fc7', tiara: '#ffd84d', hairStyle: 1, face: 'elsa' },
  { id: 'p2', name: 'Sara', dress: '#a98bff', hair: '#5b3a29', skin: '#f1c27d', shoes: '#ff8fc7', tiara: '#ffd84d', queen: true, dressStyle: 2, tiaraStyle: 6 },
  { id: 'p3', name: 'Marina', dress: '#5cc8ff', hair: '#2d2340', skin: '#8d5524', shoes: '#ffd23f', tiara: '#fff3b0' },
  { id: 'p4', name: 'Molly', dress: '#6edc8c', hair: '#e8743b', skin: '#ffe0bd', shoes: '#ff9a5c', tiara: '#ffd84d' },
  { id: 'p5', name: 'Anna', dress: '#ffd23f', hair: '#a0522d', skin: '#c68642', shoes: '#5cc8ff', tiara: '#ffffff' },
  { id: 'p6', name: 'Amelia', dress: '#ff9a5c', hair: '#ff6fa5', skin: '#e0ac69', shoes: '#a98bff', tiara: '#ffd84d' },
  // four more friends, each with her own hairstyle from the hair salon
  { id: 'p7', name: 'Luna', dress: '#7a6bd8', hair: '#e8e4f0', skin: '#f6d5c0', shoes: '#ffd23f', tiara: '#ffffff', hairStyle: 5 },     // silver top bun
  { id: 'p8', name: 'Poppy', dress: '#ff4f6a', hair: '#f5c542', skin: '#ffe0bd', shoes: '#ffffff', tiara: '#ffd84d', hairStyle: 3 },    // blonde pigtails
  { id: 'p9', name: 'Coral', dress: '#2fc7b6', hair: '#2d2340', skin: '#e3b48a', shoes: '#ff8fc7', tiara: '#fff3b0', hairStyle: 4 },    // black ponytail
  { id: 'p10', name: 'Willow', dress: '#c8e45a', hair: '#6a3d1e', skin: '#d9a066', shoes: '#a98bff', tiara: '#ffe27a', hairStyle: 2 },  // brown bob
  // the royal family: Sara is the Queen (pearl crown and gown), Jonas is the King (crown, cape and a beard)
  { id: 'king', name: 'Jonas', dress: '#3b5bdb', hair: '#6a3d1e', skin: '#f1c4a0', shoes: '#7a4a2c', tiara: '#ffd84d', king: true },
  // Elsa's little sister: round face, blue eyes, short wispy strawberry-blonde hair with a little flower clip (rename her in the parent corner)
  { id: 'sis', name: 'Baby', dress: '#f6c9dc', hair: '#e6b57c', skin: '#f9d9c6', shoes: '#ffffff', tiara: '#ffe27a', baby: true, hairAcc: 2, hairAccColor: '#f3c08a' },
];

export const UNICORNS = [
  { id: 'u1', body: '#ffffff', hoof: '#ffd2e8' },
  { id: 'u2', body: '#ffe3f1', hoof: '#ffb3d9' },
  { id: 'u3', body: '#e3f0ff', hoof: '#b3d4ff' },
  { id: 'u4', body: '#e6ffe9', hoof: '#b3ecc0' },
  { id: 'u5', body: '#fff3d6', hoof: '#ffd98a' },
  { id: 'u6', body: '#efe3ff', hoof: '#d2b8ff' },
];

// Colour choices in the wardrobe: the rainbow plus pink and white (gold first for tiaras).
export const PALETTE = [...RAINBOW, '#ff8fc7', '#ffffff'];
export const TIARA_PALETTE = ['#ffd84d', '#ffffff', '#ff8fc7', '#5cc8ff', '#a98bff', '#6edc8c', '#ff9a5c', '#ff6b8b'];

// Coat colours to choose from for the unicorns.
export const COAT_PALETTE = ['#ffffff', '#ffd2e8', '#bfe3ff', '#c4f5d0', '#fff0b8', '#dcc9ff', '#ffd4bd', '#d9d9ea'];

// Hair salon and makeup room colour choices.
export const HAIR_PALETTE = ['#8c5b3a', '#2d2340', '#f5c542', '#e8743b', '#ff6fa5', '#a98bff', '#5cc8ff', '#e8e4f0'];
export const LIP_PALETTE = ['#ff6b8b', '#e0556f', '#ff8fc7', '#d94a8c', '#ff9a5c', '#a98bff', '#c9566f', '#ffb3c7'];
export const EYE_PALETTE = ['#a98bff', '#5cc8ff', '#ff8fc7', '#6edc8c', '#ffd23f', '#ff9a5c', '#2d2340', '#ffffff'];
export const CHEEK_PALETTE = ['#ff8f9f', '#ff6b8b', '#ffb3c7', '#ffd23f', '#5cc8ff', '#a98bff', '#6edc8c', '#ff9a5c'];
