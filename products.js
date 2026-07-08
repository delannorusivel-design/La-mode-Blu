/*
  CATÁLOGO DE PRODUTOS
  ---------------------------------
  Pra adicionar uma peça nova: copie um bloco { ... } inteiro, cole antes do
  colchete final "]" e mude os dados. Cada peça precisa de um "id" único.

  image: caminho da foto dentro da pasta /images (coloque a foto lá com esse
  nome). Se não tiver a foto ainda, pode deixar assim que o site mostra um
  quadro com a inicial do nome no lugar.

  sizes: lista de tamanhos disponíveis. Se não trabalha com tamanho (ex:
  bolsa, acessório), pode deixar sizes: [] que o seletor de tamanho some.
*/

const PRODUCTS = [
  {
    id: 'p001',
    name: 'Vestido Midi Seda',
    category: 'Vestidos',
    price: 289.90,
    image: 'images/vestido-midi-seda.jpg',
    sizes: ['P', 'M', 'G'],
    description: 'Vestido midi em tecido fluido, caimento leve, ideal pro dia a dia ou ocasiões especiais.'
  },
  {
    id: 'p002',
    name: 'Blazer Alfaiataria',
    category: 'Blazers',
    price: 349.00,
    image: 'images/blazer-alfaiataria.jpg',
    sizes: ['P', 'M', 'G', 'GG'],
    description: 'Blazer estruturado, corte reto, tecido premium com forro.'
  },
  {
    id: 'p003',
    name: 'Calça Wide Leg',
    category: 'Calças',
    price: 219.90,
    image: 'images/calca-wide-leg.jpg',
    sizes: ['36', '38', '40', '42'],
    description: 'Calça de cintura alta, modelagem ampla, tecido com caimento fluido.'
  },
  {
    id: 'p004',
    name: 'Bolsa Estruturada Couro',
    category: 'Acessórios',
    price: 459.00,
    image: 'images/bolsa-estruturada.jpg',
    sizes: [],
    description: 'Bolsa em couro legítimo, alça removível, acabamento interno em suede.'
  }
];
